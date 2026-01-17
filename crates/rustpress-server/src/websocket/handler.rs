//! WebSocket connection handler.

use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use serde::Deserialize;
use std::sync::Arc;
use tokio::sync::mpsc;
use tracing::{error, info, warn};
use uuid::Uuid;

use super::chat::ChatService;
use super::hub::WebSocketHub;
use super::message::{ClientMessage, ServerMessage};
use crate::state::AppState;

/// Query parameters for WebSocket connection
#[derive(Debug, Deserialize)]
pub struct WsQuery {
    /// JWT token for authentication
    pub token: Option<String>,
}

/// WebSocket upgrade handler
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, query, state))
}

/// Handle a WebSocket connection
async fn handle_socket(socket: WebSocket, query: WsQuery, state: AppState) {
    // Authenticate the user
    let token = match query.token {
        Some(t) => t,
        None => {
            warn!("WebSocket connection without token");
            return;
        }
    };

    // Verify JWT token
    let claims = match state.jwt.validate_access_token(&token) {
        Ok(claims) => claims,
        Err(e) => {
            warn!("Invalid WebSocket token: {}", e);
            return;
        }
    };

    let user_id = match Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(e) => {
            warn!("Invalid user ID in token: {}", e);
            return;
        }
    };
    let session_id = Uuid::new_v4();

    // Get user info from database
    let user_info = match get_user_info(&state, user_id).await {
        Some(info) => info,
        None => {
            warn!("User not found for WebSocket connection: {}", user_id);
            return;
        }
    };

    info!(
        "WebSocket connected: user={}, session={}",
        user_id, session_id
    );

    // Split the socket
    let (mut sender, mut receiver) = socket.split();

    // Create channel for outgoing messages
    let (tx, mut rx) = mpsc::unbounded_channel::<ServerMessage>();

    // Get hub reference
    let hub = state.ws_hub.clone();

    // Register connection
    hub.register(
        session_id,
        user_id,
        user_info.username.clone(),
        user_info.display_name.clone(),
        user_info.avatar_url.clone(),
        tx,
    )
    .await;

    // Send connected message
    let connected_msg = ServerMessage::Connected {
        session_id,
        user_id,
    };
    if let Ok(json) = serde_json::to_string(&connected_msg) {
        let _ = sender.send(Message::Text(json.into())).await;
    }

    // Send current online users
    let online_users = hub.get_online_users().await;
    let presence_msg = ServerMessage::PresenceUpdate {
        users: online_users,
    };
    if let Ok(json) = serde_json::to_string(&presence_msg) {
        let _ = sender.send(Message::Text(json.into())).await;
    }

    // Create chat service
    let chat_service = ChatService::new(state.db().inner().clone());

    // Spawn task to send outgoing messages
    let hub_clone = hub.clone();
    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            match serde_json::to_string(&msg) {
                Ok(json) => {
                    if sender.send(Message::Text(json.into())).await.is_err() {
                        break;
                    }
                }
                Err(e) => {
                    error!("Failed to serialize WebSocket message: {}", e);
                }
            }
        }
    });

    // Handle incoming messages
    let hub_clone2 = hub.clone();
    let recv_task = tokio::spawn(async move {
        while let Some(result) = receiver.next().await {
            match result {
                Ok(Message::Text(text)) => match serde_json::from_str::<ClientMessage>(&text) {
                    Ok(msg) => {
                        handle_client_message(&hub_clone2, &chat_service, session_id, user_id, msg)
                            .await;
                    }
                    Err(e) => {
                        warn!("Invalid WebSocket message: {}", e);
                        hub_clone2
                            .send_to_session(
                                session_id,
                                ServerMessage::error("invalid_message", "Failed to parse message"),
                            )
                            .await;
                    }
                },
                Ok(Message::Ping(data)) => {
                    // Pong is handled automatically by axum
                }
                Ok(Message::Close(_)) => {
                    break;
                }
                Err(e) => {
                    error!("WebSocket error: {}", e);
                    break;
                }
                _ => {}
            }
        }
    });

    // Wait for either task to complete
    tokio::select! {
        _ = send_task => {},
        _ = recv_task => {},
    }

    // Unregister connection
    hub.unregister(session_id).await;
    info!(
        "WebSocket disconnected: user={}, session={}",
        user_id, session_id
    );
}

/// Handle a message from the client
async fn handle_client_message(
    hub: &Arc<WebSocketHub>,
    chat_service: &ChatService,
    session_id: Uuid,
    user_id: Uuid,
    message: ClientMessage,
) {
    match message {
        ClientMessage::Ping => {
            hub.send_to_session(session_id, ServerMessage::Pong).await;
        }

        ClientMessage::Authenticate { .. } => {
            // Already authenticated via query param
        }

        ClientMessage::UpdateStatus { status } => {
            // Update user status (would need presence tracker update)
            hub.broadcast_except(
                session_id,
                ServerMessage::UserStatusChanged { user_id, status },
            )
            .await;
        }

        // File collaboration
        ClientMessage::OpenFile { file_path } => {
            hub.open_file(session_id, &file_path).await;
        }

        ClientMessage::CloseFile { file_path } => {
            hub.close_file(session_id, &file_path).await;
        }

        ClientMessage::MoveCursor {
            file_path,
            position,
        } => {
            hub.move_cursor(session_id, &file_path, position).await;
        }

        ClientMessage::UpdateSelection {
            file_path,
            selection,
        } => {
            hub.update_selection(session_id, &file_path, selection)
                .await;
        }

        ClientMessage::ApplyChanges { file_path, changes } => {
            if let Some((user_id, _, _, _)) = hub.get_connection(session_id).await {
                hub.broadcast_to_file(
                    &file_path,
                    ServerMessage::TextChanged {
                        user_id,
                        file_path: file_path.clone(),
                        changes,
                    },
                    Some(session_id),
                )
                .await;
            }
        }

        // Chat messages
        ClientMessage::SendMessage {
            conversation_id,
            content,
            content_type,
            reply_to_id,
        } => {
            // Verify user is participant
            if !chat_service
                .is_participant(conversation_id, user_id)
                .await
                .unwrap_or(false)
            {
                hub.send_to_session(
                    session_id,
                    ServerMessage::error("unauthorized", "Not a participant in this conversation"),
                )
                .await;
                return;
            }

            match chat_service
                .create_message(
                    conversation_id,
                    user_id,
                    &content,
                    content_type.as_deref(),
                    reply_to_id,
                )
                .await
            {
                Ok(msg) => {
                    if let Ok(Some(dto)) = chat_service.get_message_dto(msg.id, user_id).await {
                        hub.broadcast_to_conversation(
                            conversation_id,
                            ServerMessage::ChatMessage { message: dto },
                            None,
                        )
                        .await;
                    }
                }
                Err(e) => {
                    error!("Failed to create message: {}", e);
                    hub.send_to_session(
                        session_id,
                        ServerMessage::error("db_error", "Failed to send message"),
                    )
                    .await;
                }
            }
        }

        ClientMessage::EditMessage {
            message_id,
            content,
        } => {
            match chat_service
                .edit_message(message_id, user_id, &content)
                .await
            {
                Ok(msg) => {
                    hub.broadcast_to_conversation(
                        msg.conversation_id,
                        ServerMessage::ChatMessageEdited {
                            message_id,
                            content,
                            edited_at: msg.edited_at.unwrap_or_else(chrono::Utc::now),
                        },
                        None,
                    )
                    .await;
                }
                Err(e) => {
                    error!("Failed to edit message: {}", e);
                    hub.send_to_session(
                        session_id,
                        ServerMessage::error("db_error", "Failed to edit message"),
                    )
                    .await;
                }
            }
        }

        ClientMessage::DeleteMessage { message_id } => {
            if let Err(e) = chat_service.delete_message(message_id, user_id).await {
                error!("Failed to delete message: {}", e);
                hub.send_to_session(
                    session_id,
                    ServerMessage::error("db_error", "Failed to delete message"),
                )
                .await;
            } else {
                // We'd need to get conversation_id from message first in a real impl
                // For now, broadcast to session
                hub.send_to_session(session_id, ServerMessage::ChatMessageDeleted { message_id })
                    .await;
            }
        }

        ClientMessage::AddReaction { message_id, emoji } => {
            if let Err(e) = chat_service.add_reaction(message_id, user_id, &emoji).await {
                error!("Failed to add reaction: {}", e);
            } else {
                hub.send_to_session(
                    session_id,
                    ServerMessage::ReactionAdded {
                        message_id,
                        user_id,
                        emoji,
                    },
                )
                .await;
            }
        }

        ClientMessage::RemoveReaction { message_id, emoji } => {
            if let Err(e) = chat_service
                .remove_reaction(message_id, user_id, &emoji)
                .await
            {
                error!("Failed to remove reaction: {}", e);
            } else {
                hub.send_to_session(
                    session_id,
                    ServerMessage::ReactionRemoved {
                        message_id,
                        user_id,
                        emoji,
                    },
                )
                .await;
            }
        }

        ClientMessage::PinMessage { message_id } => {
            if let Err(e) = chat_service.pin_message(message_id).await {
                error!("Failed to pin message: {}", e);
            } else {
                hub.send_to_session(session_id, ServerMessage::MessagePinned { message_id })
                    .await;
            }
        }

        ClientMessage::UnpinMessage { message_id } => {
            if let Err(e) = chat_service.unpin_message(message_id).await {
                error!("Failed to unpin message: {}", e);
            } else {
                hub.send_to_session(session_id, ServerMessage::MessageUnpinned { message_id })
                    .await;
            }
        }

        ClientMessage::StartTyping { conversation_id } => {
            if let Some((_, username, _, _)) = hub.get_connection(session_id).await {
                hub.broadcast_to_conversation(
                    conversation_id,
                    ServerMessage::TypingStarted {
                        conversation_id,
                        user_id,
                        username,
                    },
                    Some(session_id),
                )
                .await;
            }
        }

        ClientMessage::StopTyping { conversation_id } => {
            hub.broadcast_to_conversation(
                conversation_id,
                ServerMessage::TypingStopped {
                    conversation_id,
                    user_id,
                },
                Some(session_id),
            )
            .await;
        }

        ClientMessage::MarkRead {
            conversation_id,
            message_id,
        } => {
            let _ = chat_service.mark_read(conversation_id, user_id).await;
        }

        ClientMessage::JoinConversation { conversation_id } => {
            // Verify access
            if chat_service
                .is_participant(conversation_id, user_id)
                .await
                .unwrap_or(false)
            {
                hub.subscribe_to_conversation(session_id, conversation_id)
                    .await;
            }
        }

        ClientMessage::LeaveConversation { conversation_id } => {
            hub.unsubscribe_from_conversation(session_id, conversation_id)
                .await;
        }
    }
}

/// User info from database
#[derive(sqlx::FromRow)]
struct UserInfo {
    username: String,
    display_name: String,
    avatar_url: Option<String>,
}

/// Get user info from database
async fn get_user_info(state: &AppState, user_id: Uuid) -> Option<UserInfo> {
    let pool = state.db().inner();

    sqlx::query_as::<_, UserInfo>(
        r#"
        SELECT username, COALESCE(display_name, username) as display_name,
               avatar_url
        FROM users WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .ok()
    .flatten()
}
