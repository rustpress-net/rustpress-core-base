//! Retry Policy Module
//!
//! Provides configurable retry strategies with backoff algorithms.

use std::time::Duration;
use serde::{Serialize, Deserialize};
use rand::Rng;

/// Retry strategy
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RetryStrategy {
    /// Fixed delay between retries
    Fixed {
        delay_ms: u64,
    },
    /// Linear increase in delay
    Linear {
        initial_delay_ms: u64,
        increment_ms: u64,
        max_delay_ms: u64,
    },
    /// Exponential backoff
    ExponentialBackoff {
        base_delay_ms: u64,
        max_delay_ms: u64,
        multiplier: f64,
    },
    /// Exponential backoff with jitter
    ExponentialBackoffWithJitter {
        base_delay_ms: u64,
        max_delay_ms: u64,
        multiplier: f64,
        jitter_factor: f64,
    },
    /// Decorrelated jitter (AWS recommended)
    DecorrelatedJitter {
        base_delay_ms: u64,
        max_delay_ms: u64,
    },
    /// Custom delays for each retry
    Custom {
        delays_ms: Vec<u64>,
    },
}

impl Default for RetryStrategy {
    fn default() -> Self {
        RetryStrategy::ExponentialBackoff {
            base_delay_ms: 1000,
            max_delay_ms: 60000,
            multiplier: 2.0,
        }
    }
}

/// Retry policy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    /// Maximum number of retry attempts
    pub max_attempts: u32,
    /// Retry strategy to use
    pub strategy: RetryStrategy,
    /// Retryable error codes (HTTP status codes, etc.)
    pub retryable_errors: Vec<String>,
    /// Non-retryable error codes
    pub non_retryable_errors: Vec<String>,
}

impl RetryPolicy {
    /// Create a new retry policy
    pub fn new(max_attempts: u32, strategy: RetryStrategy) -> Self {
        Self {
            max_attempts,
            strategy,
            retryable_errors: vec![
                "408".to_string(), // Request Timeout
                "429".to_string(), // Too Many Requests
                "500".to_string(), // Internal Server Error
                "502".to_string(), // Bad Gateway
                "503".to_string(), // Service Unavailable
                "504".to_string(), // Gateway Timeout
            ],
            non_retryable_errors: vec![
                "400".to_string(), // Bad Request
                "401".to_string(), // Unauthorized
                "403".to_string(), // Forbidden
                "404".to_string(), // Not Found
                "422".to_string(), // Unprocessable Entity
            ],
        }
    }

    /// Calculate delay for a given attempt number (0-indexed)
    pub fn calculate_delay(&self, attempt: u32) -> u64 {
        if attempt >= self.max_attempts {
            return 0;
        }

        match &self.strategy {
            RetryStrategy::Fixed { delay_ms } => *delay_ms,

            RetryStrategy::Linear {
                initial_delay_ms,
                increment_ms,
                max_delay_ms,
            } => {
                let delay = initial_delay_ms + (attempt as u64 * increment_ms);
                delay.min(*max_delay_ms)
            }

            RetryStrategy::ExponentialBackoff {
                base_delay_ms,
                max_delay_ms,
                multiplier,
            } => {
                let delay = (*base_delay_ms as f64) * multiplier.powi(attempt as i32);
                (delay as u64).min(*max_delay_ms)
            }

            RetryStrategy::ExponentialBackoffWithJitter {
                base_delay_ms,
                max_delay_ms,
                multiplier,
                jitter_factor,
            } => {
                let base_delay = (*base_delay_ms as f64) * multiplier.powi(attempt as i32);
                let jitter_range = base_delay * jitter_factor;
                let jitter = rand::thread_rng().gen_range(-jitter_range..jitter_range);
                let delay = (base_delay + jitter).max(0.0) as u64;
                delay.min(*max_delay_ms)
            }

            RetryStrategy::DecorrelatedJitter {
                base_delay_ms,
                max_delay_ms,
            } => {
                // Decorrelated jitter: sleep = min(cap, random_between(base, sleep * 3))
                let prev_delay = if attempt == 0 {
                    *base_delay_ms
                } else {
                    self.calculate_delay_internal(attempt - 1, *base_delay_ms, *max_delay_ms)
                };
                let max = prev_delay * 3;
                let delay = rand::thread_rng().gen_range(*base_delay_ms..=max);
                delay.min(*max_delay_ms)
            }

            RetryStrategy::Custom { delays_ms } => {
                delays_ms.get(attempt as usize).copied().unwrap_or(0)
            }
        }
    }

    /// Internal helper for decorrelated jitter
    fn calculate_delay_internal(&self, attempt: u32, base: u64, max: u64) -> u64 {
        if attempt == 0 {
            return base;
        }
        let prev = self.calculate_delay_internal(attempt - 1, base, max);
        let max_val = prev * 3;
        rand::thread_rng().gen_range(base..=max_val).min(max)
    }

    /// Check if should retry
    pub fn should_retry(&self, attempt: u32) -> bool {
        attempt < self.max_attempts
    }

    /// Check if an error is retryable
    pub fn is_retryable_error(&self, error_code: &str) -> bool {
        if self.non_retryable_errors.contains(&error_code.to_string()) {
            return false;
        }
        if self.retryable_errors.is_empty() {
            return true; // If no specific errors defined, retry all
        }
        self.retryable_errors.contains(&error_code.to_string())
    }

    /// Get delay as Duration
    pub fn get_delay_duration(&self, attempt: u32) -> Duration {
        Duration::from_millis(self.calculate_delay(attempt))
    }
}

/// Backoff calculator for use in retry loops
pub struct BackoffCalculator {
    policy: RetryPolicy,
    current_attempt: u32,
    last_delay: u64,
}

impl BackoffCalculator {
    /// Create a new backoff calculator
    pub fn new(policy: RetryPolicy) -> Self {
        Self {
            policy,
            current_attempt: 0,
            last_delay: 0,
        }
    }

    /// Get the next delay, returning None if max attempts exceeded
    pub fn next_delay(&mut self) -> Option<Duration> {
        if self.current_attempt >= self.policy.max_attempts {
            return None;
        }

        let delay = self.policy.calculate_delay(self.current_attempt);
        self.last_delay = delay;
        self.current_attempt += 1;

        Some(Duration::from_millis(delay))
    }

    /// Reset the calculator
    pub fn reset(&mut self) {
        self.current_attempt = 0;
        self.last_delay = 0;
    }

    /// Get current attempt number
    pub fn current_attempt(&self) -> u32 {
        self.current_attempt
    }

    /// Check if more retries are available
    pub fn has_more_retries(&self) -> bool {
        self.current_attempt < self.policy.max_attempts
    }
}

/// Retry context for tracking retry state
#[derive(Debug, Clone, Serialize)]
pub struct RetryContext {
    pub attempt: u32,
    pub max_attempts: u32,
    pub last_error: Option<String>,
    pub total_delay_ms: u64,
    pub started_at: chrono::DateTime<chrono::Utc>,
}

impl RetryContext {
    /// Create a new retry context
    pub fn new(max_attempts: u32) -> Self {
        Self {
            attempt: 0,
            max_attempts,
            last_error: None,
            total_delay_ms: 0,
            started_at: chrono::Utc::now(),
        }
    }

    /// Record a failure
    pub fn record_failure(&mut self, error: &str, delay_ms: u64) {
        self.attempt += 1;
        self.last_error = Some(error.to_string());
        self.total_delay_ms += delay_ms;
    }

    /// Check if should continue retrying
    pub fn should_continue(&self) -> bool {
        self.attempt < self.max_attempts
    }

    /// Get remaining attempts
    pub fn remaining_attempts(&self) -> u32 {
        self.max_attempts.saturating_sub(self.attempt)
    }
}

/// Execute a function with retry logic
pub async fn retry_with_backoff<F, Fut, T, E>(
    policy: &RetryPolicy,
    operation_name: &str,
    mut f: F,
) -> Result<T, E>
where
    F: FnMut() -> Fut,
    Fut: std::future::Future<Output = Result<T, E>>,
    E: std::fmt::Display,
{
    let mut attempt = 0;

    loop {
        match f().await {
            Ok(result) => return Ok(result),
            Err(e) => {
                attempt += 1;

                if attempt >= policy.max_attempts {
                    tracing::error!(
                        "Operation '{}' failed after {} attempts: {}",
                        operation_name,
                        attempt,
                        e
                    );
                    return Err(e);
                }

                let delay = policy.calculate_delay(attempt - 1);
                tracing::warn!(
                    "Operation '{}' failed (attempt {}/{}), retrying in {}ms: {}",
                    operation_name,
                    attempt,
                    policy.max_attempts,
                    delay,
                    e
                );

                tokio::time::sleep(Duration::from_millis(delay)).await;
            }
        }
    }
}

/// Builder for creating retry policies
pub struct RetryPolicyBuilder {
    max_attempts: u32,
    strategy: RetryStrategy,
    retryable_errors: Vec<String>,
    non_retryable_errors: Vec<String>,
}

impl RetryPolicyBuilder {
    /// Create a new builder with default values
    pub fn new() -> Self {
        Self {
            max_attempts: 3,
            strategy: RetryStrategy::default(),
            retryable_errors: Vec::new(),
            non_retryable_errors: Vec::new(),
        }
    }

    /// Set maximum attempts
    pub fn max_attempts(mut self, attempts: u32) -> Self {
        self.max_attempts = attempts;
        self
    }

    /// Use fixed delay strategy
    pub fn fixed_delay(mut self, delay_ms: u64) -> Self {
        self.strategy = RetryStrategy::Fixed { delay_ms };
        self
    }

    /// Use linear backoff strategy
    pub fn linear_backoff(
        mut self,
        initial_delay_ms: u64,
        increment_ms: u64,
        max_delay_ms: u64,
    ) -> Self {
        self.strategy = RetryStrategy::Linear {
            initial_delay_ms,
            increment_ms,
            max_delay_ms,
        };
        self
    }

    /// Use exponential backoff strategy
    pub fn exponential_backoff(
        mut self,
        base_delay_ms: u64,
        max_delay_ms: u64,
        multiplier: f64,
    ) -> Self {
        self.strategy = RetryStrategy::ExponentialBackoff {
            base_delay_ms,
            max_delay_ms,
            multiplier,
        };
        self
    }

    /// Use exponential backoff with jitter
    pub fn exponential_with_jitter(
        mut self,
        base_delay_ms: u64,
        max_delay_ms: u64,
        multiplier: f64,
        jitter_factor: f64,
    ) -> Self {
        self.strategy = RetryStrategy::ExponentialBackoffWithJitter {
            base_delay_ms,
            max_delay_ms,
            multiplier,
            jitter_factor,
        };
        self
    }

    /// Use decorrelated jitter strategy
    pub fn decorrelated_jitter(mut self, base_delay_ms: u64, max_delay_ms: u64) -> Self {
        self.strategy = RetryStrategy::DecorrelatedJitter {
            base_delay_ms,
            max_delay_ms,
        };
        self
    }

    /// Set custom delays
    pub fn custom_delays(mut self, delays_ms: Vec<u64>) -> Self {
        self.strategy = RetryStrategy::Custom { delays_ms };
        self
    }

    /// Add retryable error codes
    pub fn retryable_errors(mut self, errors: Vec<String>) -> Self {
        self.retryable_errors = errors;
        self
    }

    /// Add non-retryable error codes
    pub fn non_retryable_errors(mut self, errors: Vec<String>) -> Self {
        self.non_retryable_errors = errors;
        self
    }

    /// Build the retry policy
    pub fn build(self) -> RetryPolicy {
        RetryPolicy {
            max_attempts: self.max_attempts,
            strategy: self.strategy,
            retryable_errors: self.retryable_errors,
            non_retryable_errors: self.non_retryable_errors,
        }
    }
}

impl Default for RetryPolicyBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fixed_delay() {
        let policy = RetryPolicy::new(
            3,
            RetryStrategy::Fixed { delay_ms: 1000 },
        );

        assert_eq!(policy.calculate_delay(0), 1000);
        assert_eq!(policy.calculate_delay(1), 1000);
        assert_eq!(policy.calculate_delay(2), 1000);
    }

    #[test]
    fn test_exponential_backoff() {
        let policy = RetryPolicy::new(
            5,
            RetryStrategy::ExponentialBackoff {
                base_delay_ms: 100,
                max_delay_ms: 10000,
                multiplier: 2.0,
            },
        );

        assert_eq!(policy.calculate_delay(0), 100);
        assert_eq!(policy.calculate_delay(1), 200);
        assert_eq!(policy.calculate_delay(2), 400);
        assert_eq!(policy.calculate_delay(3), 800);
    }

    #[test]
    fn test_max_delay_cap() {
        let policy = RetryPolicy::new(
            10,
            RetryStrategy::ExponentialBackoff {
                base_delay_ms: 1000,
                max_delay_ms: 5000,
                multiplier: 2.0,
            },
        );

        assert_eq!(policy.calculate_delay(5), 5000); // Would be 32000 uncapped
    }

    #[test]
    fn test_linear_backoff() {
        let policy = RetryPolicy::new(
            5,
            RetryStrategy::Linear {
                initial_delay_ms: 100,
                increment_ms: 100,
                max_delay_ms: 500,
            },
        );

        assert_eq!(policy.calculate_delay(0), 100);
        assert_eq!(policy.calculate_delay(1), 200);
        assert_eq!(policy.calculate_delay(2), 300);
        assert_eq!(policy.calculate_delay(4), 500); // Capped at max (100 + 4*100 = 500)
    }

    #[test]
    fn test_builder() {
        let policy = RetryPolicyBuilder::new()
            .max_attempts(5)
            .exponential_backoff(100, 10000, 2.0)
            .build();

        assert_eq!(policy.max_attempts, 5);
        assert!(policy.should_retry(4));
        assert!(!policy.should_retry(5));
    }
}
