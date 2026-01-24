// ============================================================================
// Queue Types
// ============================================================================

export type QueueType = 'standard' | 'fifo' | 'priority' | 'delayed';
export type QueueStatus = 'active' | 'paused' | 'draining' | 'archived';
export type DeliveryMode = 'at_least_once' | 'at_most_once' | 'exactly_once';

export interface Queue {
  id: string;
  name: string;
  description?: string;
  queue_type: QueueType;
  status: QueueStatus;
  max_size?: number;
  max_message_size: number;
  default_visibility_timeout: number;
  message_retention_seconds: number;
  delivery_mode: DeliveryMode;
  enable_deduplication: boolean;
  deduplication_window_seconds?: number;
  enable_dlq: boolean;
  dlq_queue_id?: string;
  max_receive_count: number;
  tags: Record<string, string>;
  created_at: string;
  updated_at: string;
  stats?: QueueStats;
}

export interface QueueStats {
  total_messages: number;
  visible_messages: number;
  in_flight_messages: number;
  delayed_messages: number;
  dlq_messages: number;
  messages_enqueued_today: number;
  messages_processed_today: number;
  average_processing_time_ms: number;
  oldest_message_age_seconds?: number;
}

export interface CreateQueueRequest {
  name: string;
  description?: string;
  queue_type: QueueType;
  max_size?: number;
  max_message_size?: number;
  default_visibility_timeout?: number;
  message_retention_seconds?: number;
  delivery_mode?: DeliveryMode;
  enable_deduplication?: boolean;
  deduplication_window_seconds?: number;
  enable_dlq?: boolean;
  dlq_queue_id?: string;
  max_receive_count?: number;
  tags?: Record<string, string>;
}

export interface UpdateQueueRequest {
  description?: string;
  max_size?: number;
  max_message_size?: number;
  default_visibility_timeout?: number;
  message_retention_seconds?: number;
  enable_dlq?: boolean;
  dlq_queue_id?: string;
  max_receive_count?: number;
  tags?: Record<string, string>;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface Message {
  id: string;
  queue_id: string;
  body: string;
  content_type: string;
  priority: number;
  status: MessageStatus;
  attempts: number;
  max_attempts: number;
  visible_at: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  deduplication_id?: string;
  group_id?: string;
  correlation_id?: string;
  headers: Record<string, string>;
  attributes: Record<string, unknown>;
  error_message?: string;
  processing_time_ms?: number;
}

export interface EnqueueMessageRequest {
  body: string;
  content_type?: string;
  priority?: number;
  delay_seconds?: number;
  deduplication_id?: string;
  group_id?: string;
  correlation_id?: string;
  headers?: Record<string, string>;
  attributes?: Record<string, unknown>;
}

export interface BatchEnqueueRequest {
  messages: EnqueueMessageRequest[];
}

export interface BatchEnqueueResponse {
  successful: Array<{ id: string; sequence_number: number }>;
  failed: Array<{ index: number; error: string }>;
}

export interface ReceiveMessagesRequest {
  max_messages?: number;
  visibility_timeout?: number;
  wait_time_seconds?: number;
}

export interface AcknowledgeMessageRequest {
  receipt_handle: string;
}

export interface NackMessageRequest {
  receipt_handle: string;
  visibility_timeout?: number;
  reason?: string;
}

// ============================================================================
// Worker Types
// ============================================================================

export type WorkerStatus = 'active' | 'idle' | 'draining' | 'offline';

export interface Worker {
  id: string;
  name: string;
  group_id?: string;
  status: WorkerStatus;
  hostname: string;
  process_id: number;
  concurrency: number;
  active_jobs: number;
  total_processed: number;
  total_failed: number;
  last_heartbeat: string;
  started_at: string;
  queues: string[];
  tags: Record<string, string>;
  capabilities: string[];
  version: string;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

export interface WorkerGroup {
  id: string;
  name: string;
  description?: string;
  min_workers: number;
  max_workers: number;
  current_workers: number;
  active_workers: number;
  scaling_policy: ScalingPolicy;
  queues: string[];
  tags: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ScalingPolicy {
  enabled: boolean;
  target_queue_depth: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  cooldown_seconds: number;
}

export interface RegisterWorkerRequest {
  name: string;
  group_id?: string;
  hostname: string;
  process_id: number;
  concurrency: number;
  queues: string[];
  tags?: Record<string, string>;
  capabilities?: string[];
  version: string;
}

export interface WorkerHeartbeatRequest {
  active_jobs: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
}

// ============================================================================
// Handler Types
// ============================================================================

export type HandlerType = 'http' | 'webhook' | 'lambda' | 'internal';
export type CircuitState = 'closed' | 'open' | 'half_open';

export interface Handler {
  id: string;
  name: string;
  description?: string;
  handler_type: HandlerType;
  endpoint: string;
  method: string;
  timeout_ms: number;
  retry_policy: RetryPolicy;
  circuit_breaker: CircuitBreakerConfig;
  circuit_state: CircuitState;
  headers: Record<string, string>;
  auth_config?: AuthConfig;
  enabled: boolean;
  total_invocations: number;
  successful_invocations: number;
  failed_invocations: number;
  average_latency_ms: number;
  created_at: string;
  updated_at: string;
}

export interface RetryPolicy {
  max_attempts: number;
  strategy: 'fixed' | 'linear' | 'exponential' | 'exponential_jitter';
  initial_delay_ms: number;
  max_delay_ms: number;
  multiplier: number;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failure_threshold: number;
  success_threshold: number;
  timeout_ms: number;
  half_open_requests: number;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
  credentials?: Record<string, string>;
}

export interface CreateHandlerRequest {
  name: string;
  description?: string;
  handler_type: HandlerType;
  endpoint: string;
  method?: string;
  timeout_ms?: number;
  retry_policy?: Partial<RetryPolicy>;
  circuit_breaker?: Partial<CircuitBreakerConfig>;
  headers?: Record<string, string>;
  auth_config?: AuthConfig;
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface Subscription {
  id: string;
  name: string;
  queue_id: string;
  handler_id: string;
  filter_expression?: string;
  routing_key?: string;
  priority: number;
  batch_size: number;
  batch_timeout_ms: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  queue?: Queue;
  handler?: Handler;
}

export interface CreateSubscriptionRequest {
  name: string;
  queue_id: string;
  handler_id: string;
  filter_expression?: string;
  routing_key?: string;
  priority?: number;
  batch_size?: number;
  batch_timeout_ms?: number;
}

// ============================================================================
// Scheduled Job Types
// ============================================================================

export type JobScheduleType = 'cron' | 'interval' | 'once';
export type JobStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface ScheduledJob {
  id: string;
  name: string;
  description?: string;
  schedule_type: JobScheduleType;
  cron_expression?: string;
  interval_seconds?: number;
  run_at?: string;
  queue_id: string;
  message_template: string;
  status: JobStatus;
  timezone: string;
  last_run_at?: string;
  next_run_at?: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledJobRequest {
  name: string;
  description?: string;
  schedule_type: JobScheduleType;
  cron_expression?: string;
  interval_seconds?: number;
  run_at?: string;
  queue_id: string;
  message_template: string;
  timezone?: string;
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'pagerduty';

export interface Alert {
  id: string;
  rule_id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  resource_type: string;
  resource_id: string;
  triggered_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  severity: AlertSeverity;
  condition: AlertCondition;
  notification_channels: NotificationChannel[];
  cooldown_seconds: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  threshold: number;
  duration_seconds: number;
  resource_type?: string;
  resource_id?: string;
}

export interface CreateAlertRuleRequest {
  name: string;
  description?: string;
  severity: AlertSeverity;
  condition: AlertCondition;
  notification_channels: NotificationChannel[];
  cooldown_seconds?: number;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface DashboardMetrics {
  overview: OverviewMetrics;
  queues: QueueMetrics[];
  workers: WorkerMetrics;
  throughput: ThroughputData[];
  latency: LatencyData[];
  errors: ErrorData[];
}

export interface OverviewMetrics {
  total_queues: number;
  active_queues: number;
  total_messages: number;
  messages_in_flight: number;
  total_workers: number;
  active_workers: number;
  messages_per_second: number;
  average_latency_ms: number;
  error_rate: number;
  uptime_seconds: number;
}

export interface QueueMetrics {
  queue_id: string;
  queue_name: string;
  depth: number;
  in_flight: number;
  enqueue_rate: number;
  dequeue_rate: number;
  error_rate: number;
  average_wait_time_ms: number;
  average_processing_time_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
}

export interface WorkerMetrics {
  total: number;
  active: number;
  idle: number;
  offline: number;
  total_processed: number;
  total_failed: number;
  average_utilization: number;
}

export interface ThroughputData {
  timestamp: string;
  enqueued: number;
  processed: number;
  failed: number;
}

export interface LatencyData {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
  average: number;
}

export interface ErrorData {
  timestamp: string;
  count: number;
  rate: number;
  types: Record<string, number>;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface MetricsQuery {
  metric: string;
  start_time: string;
  end_time: string;
  step?: string;
  queue_id?: string;
  worker_id?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

// ============================================================================
// Audit Types
// ============================================================================

export type AuditAction =
  | 'queue.create' | 'queue.update' | 'queue.delete' | 'queue.pause' | 'queue.resume'
  | 'message.enqueue' | 'message.dequeue' | 'message.ack' | 'message.nack' | 'message.delete'
  | 'worker.register' | 'worker.deregister' | 'worker.update'
  | 'handler.create' | 'handler.update' | 'handler.delete'
  | 'subscription.create' | 'subscription.update' | 'subscription.delete'
  | 'job.create' | 'job.update' | 'job.delete' | 'job.trigger'
  | 'alert.acknowledge' | 'alert.resolve'
  | 'config.update';

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  user_id?: string;
  user_name?: string;
  ip_address?: string;
  user_agent?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface AuditLogQuery {
  action?: AuditAction;
  resource_type?: string;
  resource_id?: string;
  user_id?: string;
  start_time?: string;
  end_time?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ResponseMeta {
  request_id: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  request_id?: string;
}

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  tags?: Record<string, string>;
}

export type QueryParams = PaginationParams & SortParams & FilterParams;

// ============================================================================
// WebSocket Types
// ============================================================================

export type WebSocketEventType =
  | 'queue.updated' | 'queue.deleted'
  | 'message.enqueued' | 'message.processed' | 'message.failed'
  | 'worker.registered' | 'worker.heartbeat' | 'worker.offline'
  | 'alert.triggered' | 'alert.resolved'
  | 'metrics.updated';

export interface WebSocketEvent {
  type: WebSocketEventType;
  timestamp: string;
  data: unknown;
}

export interface WebSocketSubscription {
  channel: string;
  filters?: Record<string, string>;
}

// ============================================================================
// UI State Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'grid' | 'list' | 'table';

export interface UIPreferences {
  theme: ThemeMode;
  sidebar_collapsed: boolean;
  default_view_mode: ViewMode;
  refresh_interval: number;
  notifications_enabled: boolean;
  sound_enabled: boolean;
}

export interface FilterState {
  search: string;
  status: string[];
  queue_type: string[];
  date_range: { start: string; end: string } | null;
  tags: string[];
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
