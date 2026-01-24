//! Circuit Breaker Pattern Implementation
//!
//! Provides fault tolerance by preventing cascade failures.

use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};

/// Circuit breaker state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CircuitState {
    /// Circuit is closed, requests flow normally
    Closed,
    /// Circuit is open, requests are blocked
    Open,
    /// Circuit is testing if service has recovered
    HalfOpen,
}

/// Circuit breaker configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CircuitConfig {
    /// Number of failures before opening circuit
    pub failure_threshold: u32,
    /// Number of successes needed to close circuit in half-open state
    pub success_threshold: u32,
    /// Time to wait before transitioning from open to half-open
    pub timeout_secs: u64,
}

impl Default for CircuitConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 5,
            success_threshold: 2,
            timeout_secs: 60,
        }
    }
}

/// Circuit breaker implementation
#[derive(Debug)]
pub struct CircuitBreaker {
    config: CircuitConfig,
    state: CircuitState,
    failure_count: u32,
    success_count: u32,
    last_failure_time: Option<Instant>,
    last_state_change: Instant,
    total_requests: u64,
    total_failures: u64,
    total_successes: u64,
    total_rejections: u64,
}

impl CircuitBreaker {
    /// Create a new circuit breaker
    pub fn new(config: CircuitConfig) -> Self {
        Self {
            config,
            state: CircuitState::Closed,
            failure_count: 0,
            success_count: 0,
            last_failure_time: None,
            last_state_change: Instant::now(),
            total_requests: 0,
            total_failures: 0,
            total_successes: 0,
            total_rejections: 0,
        }
    }

    /// Check if a request can be executed
    pub fn can_execute(&self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Check if timeout has elapsed
                self.last_state_change.elapsed() >= Duration::from_secs(self.config.timeout_secs)
            }
            CircuitState::HalfOpen => true,
        }
    }

    /// Record a successful request
    pub fn record_success(&mut self) {
        self.total_requests += 1;
        self.total_successes += 1;

        match self.state {
            CircuitState::Closed => {
                // Reset failure count on success
                self.failure_count = 0;
            }
            CircuitState::HalfOpen => {
                self.success_count += 1;
                if self.success_count >= self.config.success_threshold {
                    self.transition_to(CircuitState::Closed);
                }
            }
            CircuitState::Open => {
                // Shouldn't happen, but handle gracefully
                self.transition_to(CircuitState::HalfOpen);
                self.success_count = 1;
            }
        }
    }

    /// Record a failed request
    pub fn record_failure(&mut self) {
        self.total_requests += 1;
        self.total_failures += 1;
        self.last_failure_time = Some(Instant::now());

        match self.state {
            CircuitState::Closed => {
                self.failure_count += 1;
                if self.failure_count >= self.config.failure_threshold {
                    self.transition_to(CircuitState::Open);
                }
            }
            CircuitState::HalfOpen => {
                // Single failure in half-open state reopens the circuit
                self.transition_to(CircuitState::Open);
            }
            CircuitState::Open => {
                // Already open, just update stats
            }
        }
    }

    /// Record a rejected request (circuit was open)
    pub fn record_rejection(&mut self) {
        self.total_requests += 1;
        self.total_rejections += 1;
    }

    /// Get current state
    pub fn state(&self) -> CircuitState {
        // Check if we should transition from open to half-open
        if self.state == CircuitState::Open {
            if self.last_state_change.elapsed() >= Duration::from_secs(self.config.timeout_secs) {
                return CircuitState::HalfOpen;
            }
        }
        self.state
    }

    /// Transition to a new state
    fn transition_to(&mut self, new_state: CircuitState) {
        if self.state != new_state {
            tracing::info!(
                "Circuit breaker transitioning from {:?} to {:?}",
                self.state,
                new_state
            );
            self.state = new_state;
            self.last_state_change = Instant::now();
            self.failure_count = 0;
            self.success_count = 0;
        }
    }

    /// Reset the circuit breaker to closed state
    pub fn reset(&mut self) {
        self.state = CircuitState::Closed;
        self.failure_count = 0;
        self.success_count = 0;
        self.last_failure_time = None;
        self.last_state_change = Instant::now();
    }

    /// Get circuit breaker statistics
    pub fn stats(&self) -> CircuitBreakerStats {
        CircuitBreakerStats {
            state: self.state(),
            failure_count: self.failure_count,
            success_count: self.success_count,
            total_requests: self.total_requests,
            total_failures: self.total_failures,
            total_successes: self.total_successes,
            total_rejections: self.total_rejections,
            last_failure_time: self.last_failure_time,
            time_in_current_state_secs: self.last_state_change.elapsed().as_secs(),
            config: self.config.clone(),
        }
    }

    /// Execute a function with circuit breaker protection
    pub async fn execute<F, T, E>(&mut self, f: F) -> Result<T, CircuitBreakerError<E>>
    where
        F: std::future::Future<Output = Result<T, E>>,
    {
        // Check if we can execute
        if !self.can_execute() {
            self.record_rejection();
            return Err(CircuitBreakerError::Open);
        }

        // If transitioning from open, move to half-open
        if self.state == CircuitState::Open {
            self.transition_to(CircuitState::HalfOpen);
        }

        // Execute the function
        match f.await {
            Ok(result) => {
                self.record_success();
                Ok(result)
            }
            Err(e) => {
                self.record_failure();
                Err(CircuitBreakerError::Inner(e))
            }
        }
    }
}

/// Circuit breaker statistics
#[derive(Debug, Clone, Serialize)]
pub struct CircuitBreakerStats {
    pub state: CircuitState,
    pub failure_count: u32,
    pub success_count: u32,
    pub total_requests: u64,
    pub total_failures: u64,
    pub total_successes: u64,
    pub total_rejections: u64,
    #[serde(skip)]
    pub last_failure_time: Option<Instant>,
    pub time_in_current_state_secs: u64,
    pub config: CircuitConfig,
}

/// Circuit breaker error type
#[derive(Debug)]
pub enum CircuitBreakerError<E> {
    /// Circuit is open, request rejected
    Open,
    /// Inner error from the protected operation
    Inner(E),
}

impl<E: std::fmt::Display> std::fmt::Display for CircuitBreakerError<E> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CircuitBreakerError::Open => write!(f, "Circuit breaker is open"),
            CircuitBreakerError::Inner(e) => write!(f, "{}", e),
        }
    }
}

impl<E: std::error::Error> std::error::Error for CircuitBreakerError<E> {}

/// A sliding window circuit breaker that tracks failures over time
#[derive(Debug)]
pub struct SlidingWindowCircuitBreaker {
    config: SlidingWindowConfig,
    state: CircuitState,
    /// Timestamps of recent failures
    failures: Vec<Instant>,
    /// Timestamps of recent successes
    successes: Vec<Instant>,
    last_state_change: Instant,
}

/// Configuration for sliding window circuit breaker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlidingWindowConfig {
    /// Window size in seconds
    pub window_size_secs: u64,
    /// Failure rate threshold (0.0 - 1.0)
    pub failure_rate_threshold: f64,
    /// Minimum number of calls to evaluate
    pub minimum_calls: u32,
    /// Number of calls to permit in half-open state
    pub permitted_calls_in_half_open: u32,
    /// Wait duration in open state before transitioning to half-open
    pub wait_duration_secs: u64,
}

impl Default for SlidingWindowConfig {
    fn default() -> Self {
        Self {
            window_size_secs: 60,
            failure_rate_threshold: 0.5,
            minimum_calls: 10,
            permitted_calls_in_half_open: 3,
            wait_duration_secs: 30,
        }
    }
}

impl SlidingWindowCircuitBreaker {
    /// Create a new sliding window circuit breaker
    pub fn new(config: SlidingWindowConfig) -> Self {
        Self {
            config,
            state: CircuitState::Closed,
            failures: Vec::new(),
            successes: Vec::new(),
            last_state_change: Instant::now(),
        }
    }

    /// Clean up old entries outside the window
    fn cleanup(&mut self) {
        let cutoff = Instant::now() - Duration::from_secs(self.config.window_size_secs);
        self.failures.retain(|&t| t > cutoff);
        self.successes.retain(|&t| t > cutoff);
    }

    /// Calculate current failure rate
    fn failure_rate(&self) -> f64 {
        let total = self.failures.len() + self.successes.len();
        if total == 0 {
            return 0.0;
        }
        self.failures.len() as f64 / total as f64
    }

    /// Check if a request can be executed
    pub fn can_execute(&self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                self.last_state_change.elapsed() >= Duration::from_secs(self.config.wait_duration_secs)
            }
            CircuitState::HalfOpen => {
                // Only permit limited calls in half-open state
                let recent_calls = self.failures.len() + self.successes.len();
                recent_calls < self.config.permitted_calls_in_half_open as usize
            }
        }
    }

    /// Record a successful request
    pub fn record_success(&mut self) {
        self.cleanup();
        self.successes.push(Instant::now());

        match self.state {
            CircuitState::HalfOpen => {
                // Check if we have enough successes to close
                let recent_successes: usize = self.successes.iter()
                    .filter(|&&t| t > self.last_state_change)
                    .count();
                if recent_successes >= self.config.permitted_calls_in_half_open as usize {
                    self.state = CircuitState::Closed;
                    self.last_state_change = Instant::now();
                    self.failures.clear();
                    self.successes.clear();
                }
            }
            _ => {}
        }
    }

    /// Record a failed request
    pub fn record_failure(&mut self) {
        self.cleanup();
        self.failures.push(Instant::now());

        match self.state {
            CircuitState::Closed => {
                let total = self.failures.len() + self.successes.len();
                if total >= self.config.minimum_calls as usize {
                    if self.failure_rate() >= self.config.failure_rate_threshold {
                        self.state = CircuitState::Open;
                        self.last_state_change = Instant::now();
                    }
                }
            }
            CircuitState::HalfOpen => {
                // Any failure in half-open state opens the circuit
                self.state = CircuitState::Open;
                self.last_state_change = Instant::now();
            }
            _ => {}
        }
    }

    /// Get current state
    pub fn state(&self) -> CircuitState {
        if self.state == CircuitState::Open {
            if self.last_state_change.elapsed() >= Duration::from_secs(self.config.wait_duration_secs) {
                return CircuitState::HalfOpen;
            }
        }
        self.state
    }

    /// Reset to closed state
    pub fn reset(&mut self) {
        self.state = CircuitState::Closed;
        self.failures.clear();
        self.successes.clear();
        self.last_state_change = Instant::now();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circuit_breaker_closed() {
        let config = CircuitConfig {
            failure_threshold: 3,
            success_threshold: 2,
            timeout_secs: 10,
        };
        let mut cb = CircuitBreaker::new(config);

        assert_eq!(cb.state(), CircuitState::Closed);
        assert!(cb.can_execute());
    }

    #[test]
    fn test_circuit_breaker_opens_after_failures() {
        let config = CircuitConfig {
            failure_threshold: 3,
            success_threshold: 2,
            timeout_secs: 10,
        };
        let mut cb = CircuitBreaker::new(config);

        cb.record_failure();
        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Closed);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);
        assert!(!cb.can_execute());
    }

    #[test]
    fn test_success_resets_failure_count() {
        let config = CircuitConfig {
            failure_threshold: 3,
            success_threshold: 2,
            timeout_secs: 10,
        };
        let mut cb = CircuitBreaker::new(config);

        cb.record_failure();
        cb.record_failure();
        cb.record_success();

        assert_eq!(cb.state(), CircuitState::Closed);
        assert_eq!(cb.failure_count, 0);
    }
}
