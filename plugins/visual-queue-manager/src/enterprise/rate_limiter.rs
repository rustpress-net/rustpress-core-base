//! Rate Limiting Service
//!
//! Provides rate limiting capabilities for API requests and queue operations.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Rate limiter service
pub struct RateLimiter {
    config: RateLimitConfig,
    buckets: Arc<RwLock<HashMap<String, TokenBucket>>>,
    sliding_windows: Arc<RwLock<HashMap<String, SlidingWindow>>>,
}

impl RateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        Self {
            config,
            buckets: Arc::new(RwLock::new(HashMap::new())),
            sliding_windows: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn initialize(&self) -> Result<(), super::EnterpriseError> {
        // Start background task to clean up expired entries
        if self.config.enabled {
            let buckets = self.buckets.clone();
            let windows = self.sliding_windows.clone();
            let cleanup_interval = self.config.cleanup_interval_seconds;

            tokio::spawn(async move {
                loop {
                    tokio::time::sleep(Duration::from_secs(cleanup_interval as u64)).await;
                    Self::cleanup_expired(&buckets, &windows).await;
                }
            });
        }

        Ok(())
    }

    /// Check if a request should be allowed
    pub async fn check(&self, key: &str) -> RateLimitResult {
        if !self.config.enabled {
            return RateLimitResult::allowed();
        }

        match self.config.algorithm {
            RateLimitAlgorithm::TokenBucket => self.check_token_bucket(key).await,
            RateLimitAlgorithm::SlidingWindow => self.check_sliding_window(key).await,
            RateLimitAlgorithm::FixedWindow => self.check_fixed_window(key).await,
            RateLimitAlgorithm::LeakyBucket => self.check_leaky_bucket(key).await,
        }
    }

    /// Check and consume a token
    pub async fn acquire(&self, key: &str) -> RateLimitResult {
        if !self.config.enabled {
            return RateLimitResult::allowed();
        }

        match self.config.algorithm {
            RateLimitAlgorithm::TokenBucket => self.acquire_token_bucket(key).await,
            RateLimitAlgorithm::SlidingWindow => self.acquire_sliding_window(key).await,
            RateLimitAlgorithm::FixedWindow => self.acquire_fixed_window(key).await,
            RateLimitAlgorithm::LeakyBucket => self.acquire_leaky_bucket(key).await,
        }
    }

    /// Check rate limit with custom limits
    pub async fn check_with_limits(
        &self,
        key: &str,
        requests_per_second: u32,
        burst_size: u32,
    ) -> RateLimitResult {
        if !self.config.enabled {
            return RateLimitResult::allowed();
        }

        let mut buckets = self.buckets.write().await;
        let bucket = buckets
            .entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(requests_per_second as f64, burst_size));

        bucket.check()
    }

    /// Acquire token with custom limits
    pub async fn acquire_with_limits(
        &self,
        key: &str,
        requests_per_second: u32,
        burst_size: u32,
    ) -> RateLimitResult {
        if !self.config.enabled {
            return RateLimitResult::allowed();
        }

        let mut buckets = self.buckets.write().await;
        let bucket = buckets
            .entry(key.to_string())
            .or_insert_with(|| TokenBucket::new(requests_per_second as f64, burst_size));

        bucket.acquire(1)
    }

    /// Get current rate limit status for a key
    pub async fn get_status(&self, key: &str) -> RateLimitStatus {
        let buckets = self.buckets.read().await;

        if let Some(bucket) = buckets.get(key) {
            RateLimitStatus {
                key: key.to_string(),
                remaining: bucket.available_tokens() as u64,
                limit: bucket.capacity as u64,
                reset_at: bucket.next_refill_time(),
                window_seconds: (1.0 / bucket.refill_rate) as u32,
            }
        } else {
            RateLimitStatus {
                key: key.to_string(),
                remaining: self.config.burst_size as u64,
                limit: self.config.burst_size as u64,
                reset_at: chrono::Utc::now(),
                window_seconds: 1,
            }
        }
    }

    /// Reset rate limit for a key
    pub async fn reset(&self, key: &str) {
        let mut buckets = self.buckets.write().await;
        buckets.remove(key);

        let mut windows = self.sliding_windows.write().await;
        windows.remove(key);
    }

    /// Get all active rate limit keys
    pub async fn list_keys(&self) -> Vec<String> {
        let buckets = self.buckets.read().await;
        buckets.keys().cloned().collect()
    }

    // Private implementation methods

    async fn check_token_bucket(&self, key: &str) -> RateLimitResult {
        let mut buckets = self.buckets.write().await;
        let bucket = buckets.entry(key.to_string()).or_insert_with(|| {
            TokenBucket::new(
                self.config.requests_per_second as f64,
                self.config.burst_size,
            )
        });

        bucket.check()
    }

    async fn acquire_token_bucket(&self, key: &str) -> RateLimitResult {
        let mut buckets = self.buckets.write().await;
        let bucket = buckets.entry(key.to_string()).or_insert_with(|| {
            TokenBucket::new(
                self.config.requests_per_second as f64,
                self.config.burst_size,
            )
        });

        bucket.acquire(1)
    }

    async fn check_sliding_window(&self, key: &str) -> RateLimitResult {
        let mut windows = self.sliding_windows.write().await;
        let window = windows.entry(key.to_string()).or_insert_with(|| {
            SlidingWindow::new(
                Duration::from_secs(self.config.window_seconds as u64),
                self.config.requests_per_second * self.config.window_seconds,
            )
        });

        window.check()
    }

    async fn acquire_sliding_window(&self, key: &str) -> RateLimitResult {
        let mut windows = self.sliding_windows.write().await;
        let window = windows.entry(key.to_string()).or_insert_with(|| {
            SlidingWindow::new(
                Duration::from_secs(self.config.window_seconds as u64),
                self.config.requests_per_second * self.config.window_seconds,
            )
        });

        window.acquire()
    }

    async fn check_fixed_window(&self, key: &str) -> RateLimitResult {
        // Fixed window uses the same sliding window but with aligned boundaries
        self.check_sliding_window(key).await
    }

    async fn acquire_fixed_window(&self, key: &str) -> RateLimitResult {
        self.acquire_sliding_window(key).await
    }

    async fn check_leaky_bucket(&self, key: &str) -> RateLimitResult {
        // Leaky bucket is similar to token bucket but with queue semantics
        self.check_token_bucket(key).await
    }

    async fn acquire_leaky_bucket(&self, key: &str) -> RateLimitResult {
        self.acquire_token_bucket(key).await
    }

    async fn cleanup_expired(
        buckets: &Arc<RwLock<HashMap<String, TokenBucket>>>,
        windows: &Arc<RwLock<HashMap<String, SlidingWindow>>>,
    ) {
        let now = Instant::now();
        let expiry = Duration::from_secs(300); // 5 minutes

        // Clean up token buckets
        {
            let mut buckets = buckets.write().await;
            buckets.retain(|_, bucket| now.duration_since(bucket.last_access) < expiry);
        }

        // Clean up sliding windows
        {
            let mut windows = windows.write().await;
            windows.retain(|_, window| now.duration_since(window.last_access) < expiry);
        }
    }
}

/// Token bucket implementation
struct TokenBucket {
    tokens: f64,
    capacity: u32,
    refill_rate: f64, // tokens per second
    last_refill: Instant,
    last_access: Instant,
}

impl TokenBucket {
    fn new(refill_rate: f64, capacity: u32) -> Self {
        let now = Instant::now();
        Self {
            tokens: capacity as f64,
            capacity,
            refill_rate,
            last_refill: now,
            last_access: now,
        }
    }

    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        self.tokens = (self.tokens + elapsed * self.refill_rate).min(self.capacity as f64);
        self.last_refill = now;
        self.last_access = now;
    }

    fn check(&mut self) -> RateLimitResult {
        self.refill();

        if self.tokens >= 1.0 {
            RateLimitResult {
                allowed: true,
                remaining: self.tokens as u64,
                retry_after: None,
                limit: self.capacity as u64,
            }
        } else {
            let wait_time = (1.0 - self.tokens) / self.refill_rate;
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs_f64(wait_time)),
                limit: self.capacity as u64,
            }
        }
    }

    fn acquire(&mut self, count: u32) -> RateLimitResult {
        self.refill();

        if self.tokens >= count as f64 {
            self.tokens -= count as f64;
            RateLimitResult {
                allowed: true,
                remaining: self.tokens as u64,
                retry_after: None,
                limit: self.capacity as u64,
            }
        } else {
            let wait_time = (count as f64 - self.tokens) / self.refill_rate;
            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after: Some(Duration::from_secs_f64(wait_time)),
                limit: self.capacity as u64,
            }
        }
    }

    fn available_tokens(&self) -> f64 {
        let elapsed = Instant::now()
            .duration_since(self.last_refill)
            .as_secs_f64();
        (self.tokens + elapsed * self.refill_rate).min(self.capacity as f64)
    }

    fn next_refill_time(&self) -> chrono::DateTime<chrono::Utc> {
        let tokens_needed = self.capacity as f64 - self.available_tokens();
        let seconds_until_full = tokens_needed / self.refill_rate;
        chrono::Utc::now() + chrono::Duration::milliseconds((seconds_until_full * 1000.0) as i64)
    }
}

/// Sliding window implementation
struct SlidingWindow {
    window_size: Duration,
    max_requests: u32,
    requests: Vec<Instant>,
    last_access: Instant,
}

impl SlidingWindow {
    fn new(window_size: Duration, max_requests: u32) -> Self {
        Self {
            window_size,
            max_requests,
            requests: Vec::new(),
            last_access: Instant::now(),
        }
    }

    fn cleanup(&mut self) {
        let cutoff = Instant::now() - self.window_size;
        self.requests.retain(|&t| t > cutoff);
        self.last_access = Instant::now();
    }

    fn check(&mut self) -> RateLimitResult {
        self.cleanup();

        let current_count = self.requests.len() as u32;
        if current_count < self.max_requests {
            RateLimitResult {
                allowed: true,
                remaining: (self.max_requests - current_count) as u64,
                retry_after: None,
                limit: self.max_requests as u64,
            }
        } else {
            let oldest = self.requests.first().copied();
            let retry_after = oldest.map(|t| {
                let elapsed = Instant::now().duration_since(t);
                if elapsed < self.window_size {
                    self.window_size - elapsed
                } else {
                    Duration::ZERO
                }
            });

            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after,
                limit: self.max_requests as u64,
            }
        }
    }

    fn acquire(&mut self) -> RateLimitResult {
        self.cleanup();

        let current_count = self.requests.len() as u32;
        if current_count < self.max_requests {
            self.requests.push(Instant::now());
            RateLimitResult {
                allowed: true,
                remaining: (self.max_requests - current_count - 1) as u64,
                retry_after: None,
                limit: self.max_requests as u64,
            }
        } else {
            let oldest = self.requests.first().copied();
            let retry_after = oldest.map(|t| {
                let elapsed = Instant::now().duration_since(t);
                if elapsed < self.window_size {
                    self.window_size - elapsed
                } else {
                    Duration::ZERO
                }
            });

            RateLimitResult {
                allowed: false,
                remaining: 0,
                retry_after,
                limit: self.max_requests as u64,
            }
        }
    }
}

/// Rate limit configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub enabled: bool,
    pub algorithm: RateLimitAlgorithm,
    pub requests_per_second: u32,
    pub burst_size: u32,
    pub window_seconds: u32,
    pub cleanup_interval_seconds: u32,
    pub per_tenant_limits: bool,
    pub per_queue_limits: bool,
    pub per_user_limits: bool,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            algorithm: RateLimitAlgorithm::TokenBucket,
            requests_per_second: 100,
            burst_size: 50,
            window_seconds: 1,
            cleanup_interval_seconds: 60,
            per_tenant_limits: true,
            per_queue_limits: true,
            per_user_limits: false,
        }
    }
}

/// Rate limiting algorithms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RateLimitAlgorithm {
    TokenBucket,
    SlidingWindow,
    FixedWindow,
    LeakyBucket,
}

/// Result of a rate limit check
#[derive(Debug, Clone)]
pub struct RateLimitResult {
    pub allowed: bool,
    pub remaining: u64,
    pub retry_after: Option<Duration>,
    pub limit: u64,
}

impl RateLimitResult {
    pub fn allowed() -> Self {
        Self {
            allowed: true,
            remaining: u64::MAX,
            retry_after: None,
            limit: u64::MAX,
        }
    }

    /// Convert to HTTP headers
    pub fn to_headers(&self) -> HashMap<String, String> {
        let mut headers = HashMap::new();
        headers.insert("X-RateLimit-Limit".to_string(), self.limit.to_string());
        headers.insert(
            "X-RateLimit-Remaining".to_string(),
            self.remaining.to_string(),
        );

        if let Some(retry_after) = self.retry_after {
            headers.insert("Retry-After".to_string(), retry_after.as_secs().to_string());
        }

        headers
    }
}

/// Rate limit status for a key
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitStatus {
    pub key: String,
    pub remaining: u64,
    pub limit: u64,
    pub reset_at: chrono::DateTime<chrono::Utc>,
    pub window_seconds: u32,
}

/// Rate limit key builder
pub struct RateLimitKey;

impl RateLimitKey {
    /// Build key for tenant-level rate limiting
    pub fn tenant(tenant_id: &str) -> String {
        format!("tenant:{}", tenant_id)
    }

    /// Build key for queue-level rate limiting
    pub fn queue(queue_id: &str) -> String {
        format!("queue:{}", queue_id)
    }

    /// Build key for user-level rate limiting
    pub fn user(user_id: &str) -> String {
        format!("user:{}", user_id)
    }

    /// Build key for API endpoint rate limiting
    pub fn endpoint(method: &str, path: &str) -> String {
        format!("endpoint:{}:{}", method, path)
    }

    /// Build key for IP-based rate limiting
    pub fn ip(ip: &str) -> String {
        format!("ip:{}", ip)
    }

    /// Build composite key
    pub fn composite(parts: &[&str]) -> String {
        parts.join(":")
    }
}

/// Middleware for rate limiting HTTP requests
pub struct RateLimitMiddleware {
    limiter: Arc<RateLimiter>,
    key_extractor: Box<dyn Fn(&str, &str) -> String + Send + Sync>,
}

impl RateLimitMiddleware {
    pub fn new(limiter: Arc<RateLimiter>) -> Self {
        Self {
            limiter,
            key_extractor: Box::new(|method, path| RateLimitKey::endpoint(method, path)),
        }
    }

    pub fn with_key_extractor<F>(mut self, extractor: F) -> Self
    where
        F: Fn(&str, &str) -> String + Send + Sync + 'static,
    {
        self.key_extractor = Box::new(extractor);
        self
    }

    pub async fn check_request(&self, method: &str, path: &str) -> RateLimitResult {
        let key = (self.key_extractor)(method, path);
        self.limiter.acquire(&key).await
    }
}
