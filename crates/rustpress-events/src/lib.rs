//! # RustPress Events
//!
//! Event bus and messaging system for decoupled component communication.

pub mod bus;
pub mod event;
pub mod subscriber;

pub use bus::EventBus;
pub use event::{DomainEvent, Event, EventType};
pub use subscriber::{EventHandler, Subscriber};
