import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type {
  Queue,
  CreateQueueRequest,
  UpdateQueueRequest,
  QueueStats,
  Message,
  EnqueueMessageRequest,
  BatchEnqueueRequest,
  BatchEnqueueResponse,
  ReceiveMessagesRequest,
  Worker,
  WorkerGroup,
  RegisterWorkerRequest,
  WorkerHeartbeatRequest,
  Handler,
  CreateHandlerRequest,
  Subscription,
  CreateSubscriptionRequest,
  ScheduledJob,
  CreateScheduledJobRequest,
  Alert,
  AlertRule,
  CreateAlertRuleRequest,
  DashboardMetrics,
  MetricsQuery,
  TimeSeriesPoint,
  AuditLog,
  AuditLogQuery,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  ApiError,
} from '@/types';

// ============================================================================
// API Client Configuration
// ============================================================================

const API_BASE_URL = '/api/v1/queue-manager';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add request ID for tracing
      config.headers['X-Request-ID'] = crypto.randomUUID();

      // Add timestamp
      config.headers['X-Request-Time'] = new Date().toISOString();

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response) {
        const apiError: ApiError = {
          code: error.response.data?.code || 'UNKNOWN_ERROR',
          message: error.response.data?.message || error.message,
          details: error.response.data?.details,
          request_id: error.response.headers['x-request-id'],
        };
        return Promise.reject(apiError);
      }

      if (error.request) {
        return Promise.reject({
          code: 'NETWORK_ERROR',
          message: 'Network error - please check your connection',
        });
      }

      return Promise.reject({
        code: 'REQUEST_ERROR',
        message: error.message,
      });
    }
  );

  return client;
};

const apiClient = createApiClient();

// ============================================================================
// Helper Functions
// ============================================================================

const buildQueryString = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.per_page) searchParams.append('per_page', params.per_page.toString());
  if (params.sort_by) searchParams.append('sort_by', params.sort_by);
  if (params.sort_order) searchParams.append('sort_order', params.sort_order);
  if (params.search) searchParams.append('search', params.search);
  if (params.status) searchParams.append('status', params.status);
  if (params.tags) {
    Object.entries(params.tags).forEach(([key, value]) => {
      searchParams.append(`tag.${key}`, value);
    });
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

// ============================================================================
// Queue API
// ============================================================================

export const queueApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<Queue>> => {
    const response = await apiClient.get<PaginatedResponse<Queue>>(
      `/queues${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.get<ApiResponse<Queue>>(`/queues/${id}`);
    return response.data;
  },

  create: async (data: CreateQueueRequest): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.post<ApiResponse<Queue>>('/queues', data);
    return response.data;
  },

  update: async (id: string, data: UpdateQueueRequest): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.patch<ApiResponse<Queue>>(`/queues/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/queues/${id}`);
  },

  pause: async (id: string): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.post<ApiResponse<Queue>>(`/queues/${id}/pause`);
    return response.data;
  },

  resume: async (id: string): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.post<ApiResponse<Queue>>(`/queues/${id}/resume`);
    return response.data;
  },

  purge: async (id: string): Promise<{ purged_count: number }> => {
    const response = await apiClient.post<{ purged_count: number }>(`/queues/${id}/purge`);
    return response.data;
  },

  getStats: async (id: string): Promise<ApiResponse<QueueStats>> => {
    const response = await apiClient.get<ApiResponse<QueueStats>>(`/queues/${id}/stats`);
    return response.data;
  },

  drain: async (id: string): Promise<ApiResponse<Queue>> => {
    const response = await apiClient.post<ApiResponse<Queue>>(`/queues/${id}/drain`);
    return response.data;
  },
};

// ============================================================================
// Message API
// ============================================================================

export const messageApi = {
  list: async (queueId: string, params: QueryParams = {}): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `/queues/${queueId}/messages${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (queueId: string, messageId: string): Promise<ApiResponse<Message>> => {
    const response = await apiClient.get<ApiResponse<Message>>(
      `/queues/${queueId}/messages/${messageId}`
    );
    return response.data;
  },

  enqueue: async (queueId: string, data: EnqueueMessageRequest): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/queues/${queueId}/messages`,
      data
    );
    return response.data;
  },

  enqueueBatch: async (
    queueId: string,
    data: BatchEnqueueRequest
  ): Promise<BatchEnqueueResponse> => {
    const response = await apiClient.post<BatchEnqueueResponse>(
      `/queues/${queueId}/messages/batch`,
      data
    );
    return response.data;
  },

  receive: async (
    queueId: string,
    params: ReceiveMessagesRequest = {}
  ): Promise<ApiResponse<Message[]>> => {
    const response = await apiClient.post<ApiResponse<Message[]>>(
      `/queues/${queueId}/messages/receive`,
      params
    );
    return response.data;
  },

  acknowledge: async (
    queueId: string,
    messageId: string,
    receiptHandle: string
  ): Promise<void> => {
    await apiClient.post(`/queues/${queueId}/messages/${messageId}/ack`, {
      receipt_handle: receiptHandle,
    });
  },

  nack: async (
    queueId: string,
    messageId: string,
    receiptHandle: string,
    visibilityTimeout?: number,
    reason?: string
  ): Promise<void> => {
    await apiClient.post(`/queues/${queueId}/messages/${messageId}/nack`, {
      receipt_handle: receiptHandle,
      visibility_timeout: visibilityTimeout,
      reason,
    });
  },

  delete: async (queueId: string, messageId: string): Promise<void> => {
    await apiClient.delete(`/queues/${queueId}/messages/${messageId}`);
  },

  retry: async (queueId: string, messageId: string): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/queues/${queueId}/messages/${messageId}/retry`
    );
    return response.data;
  },

  moveToDlq: async (queueId: string, messageId: string): Promise<void> => {
    await apiClient.post(`/queues/${queueId}/messages/${messageId}/move-to-dlq`);
  },
};

// ============================================================================
// Dead Letter Queue API
// ============================================================================

export const dlqApi = {
  list: async (queueId: string, params: QueryParams = {}): Promise<PaginatedResponse<Message>> => {
    const response = await apiClient.get<PaginatedResponse<Message>>(
      `/queues/${queueId}/dlq${buildQueryString(params)}`
    );
    return response.data;
  },

  retry: async (queueId: string, messageId: string): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/queues/${queueId}/dlq/${messageId}/retry`
    );
    return response.data;
  },

  retryAll: async (queueId: string): Promise<{ retried_count: number }> => {
    const response = await apiClient.post<{ retried_count: number }>(
      `/queues/${queueId}/dlq/retry-all`
    );
    return response.data;
  },

  purge: async (queueId: string): Promise<{ purged_count: number }> => {
    const response = await apiClient.post<{ purged_count: number }>(
      `/queues/${queueId}/dlq/purge`
    );
    return response.data;
  },

  export: async (queueId: string, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await apiClient.get(`/queues/${queueId}/dlq/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================================================
// Worker API
// ============================================================================

export const workerApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<Worker>> => {
    const response = await apiClient.get<PaginatedResponse<Worker>>(
      `/workers${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<Worker>> => {
    const response = await apiClient.get<ApiResponse<Worker>>(`/workers/${id}`);
    return response.data;
  },

  register: async (data: RegisterWorkerRequest): Promise<ApiResponse<Worker>> => {
    const response = await apiClient.post<ApiResponse<Worker>>('/workers', data);
    return response.data;
  },

  heartbeat: async (id: string, data: WorkerHeartbeatRequest): Promise<void> => {
    await apiClient.post(`/workers/${id}/heartbeat`, data);
  },

  deregister: async (id: string): Promise<void> => {
    await apiClient.delete(`/workers/${id}`);
  },

  drain: async (id: string): Promise<ApiResponse<Worker>> => {
    const response = await apiClient.post<ApiResponse<Worker>>(`/workers/${id}/drain`);
    return response.data;
  },

  // Worker Groups
  listGroups: async (params: QueryParams = {}): Promise<PaginatedResponse<WorkerGroup>> => {
    const response = await apiClient.get<PaginatedResponse<WorkerGroup>>(
      `/worker-groups${buildQueryString(params)}`
    );
    return response.data;
  },

  getGroup: async (id: string): Promise<ApiResponse<WorkerGroup>> => {
    const response = await apiClient.get<ApiResponse<WorkerGroup>>(`/worker-groups/${id}`);
    return response.data;
  },

  scaleGroup: async (id: string, targetWorkers: number): Promise<ApiResponse<WorkerGroup>> => {
    const response = await apiClient.post<ApiResponse<WorkerGroup>>(
      `/worker-groups/${id}/scale`,
      { target_workers: targetWorkers }
    );
    return response.data;
  },
};

// ============================================================================
// Handler API
// ============================================================================

export const handlerApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<Handler>> => {
    const response = await apiClient.get<PaginatedResponse<Handler>>(
      `/handlers${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.get<ApiResponse<Handler>>(`/handlers/${id}`);
    return response.data;
  },

  create: async (data: CreateHandlerRequest): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.post<ApiResponse<Handler>>('/handlers', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateHandlerRequest>): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.patch<ApiResponse<Handler>>(`/handlers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/handlers/${id}`);
  },

  enable: async (id: string): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.post<ApiResponse<Handler>>(`/handlers/${id}/enable`);
    return response.data;
  },

  disable: async (id: string): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.post<ApiResponse<Handler>>(`/handlers/${id}/disable`);
    return response.data;
  },

  test: async (id: string, payload?: unknown): Promise<{ success: boolean; response?: unknown; error?: string }> => {
    const response = await apiClient.post(`/handlers/${id}/test`, { payload });
    return response.data;
  },

  resetCircuitBreaker: async (id: string): Promise<ApiResponse<Handler>> => {
    const response = await apiClient.post<ApiResponse<Handler>>(
      `/handlers/${id}/reset-circuit-breaker`
    );
    return response.data;
  },
};

// ============================================================================
// Subscription API
// ============================================================================

export const subscriptionApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<Subscription>> => {
    const response = await apiClient.get<PaginatedResponse<Subscription>>(
      `/subscriptions${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<Subscription>> => {
    const response = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return response.data;
  },

  create: async (data: CreateSubscriptionRequest): Promise<ApiResponse<Subscription>> => {
    const response = await apiClient.post<ApiResponse<Subscription>>('/subscriptions', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateSubscriptionRequest>
  ): Promise<ApiResponse<Subscription>> => {
    const response = await apiClient.patch<ApiResponse<Subscription>>(
      `/subscriptions/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/subscriptions/${id}`);
  },

  enable: async (id: string): Promise<ApiResponse<Subscription>> => {
    const response = await apiClient.post<ApiResponse<Subscription>>(
      `/subscriptions/${id}/enable`
    );
    return response.data;
  },

  disable: async (id: string): Promise<ApiResponse<Subscription>> => {
    const response = await apiClient.post<ApiResponse<Subscription>>(
      `/subscriptions/${id}/disable`
    );
    return response.data;
  },
};

// ============================================================================
// Scheduled Job API
// ============================================================================

export const jobApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<ScheduledJob>> => {
    const response = await apiClient.get<PaginatedResponse<ScheduledJob>>(
      `/jobs${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<ScheduledJob>> => {
    const response = await apiClient.get<ApiResponse<ScheduledJob>>(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateScheduledJobRequest): Promise<ApiResponse<ScheduledJob>> => {
    const response = await apiClient.post<ApiResponse<ScheduledJob>>('/jobs', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateScheduledJobRequest>
  ): Promise<ApiResponse<ScheduledJob>> => {
    const response = await apiClient.patch<ApiResponse<ScheduledJob>>(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`);
  },

  pause: async (id: string): Promise<ApiResponse<ScheduledJob>> => {
    const response = await apiClient.post<ApiResponse<ScheduledJob>>(`/jobs/${id}/pause`);
    return response.data;
  },

  resume: async (id: string): Promise<ApiResponse<ScheduledJob>> => {
    const response = await apiClient.post<ApiResponse<ScheduledJob>>(`/jobs/${id}/resume`);
    return response.data;
  },

  trigger: async (id: string): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post<ApiResponse<Message>>(`/jobs/${id}/trigger`);
    return response.data;
  },
};

// ============================================================================
// Alert API
// ============================================================================

export const alertApi = {
  list: async (params: QueryParams = {}): Promise<PaginatedResponse<Alert>> => {
    const response = await apiClient.get<PaginatedResponse<Alert>>(
      `/alerts${buildQueryString(params)}`
    );
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`);
    return response.data;
  },

  acknowledge: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiClient.post<ApiResponse<Alert>>(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  resolve: async (id: string): Promise<ApiResponse<Alert>> => {
    const response = await apiClient.post<ApiResponse<Alert>>(`/alerts/${id}/resolve`);
    return response.data;
  },

  // Alert Rules
  listRules: async (params: QueryParams = {}): Promise<PaginatedResponse<AlertRule>> => {
    const response = await apiClient.get<PaginatedResponse<AlertRule>>(
      `/alert-rules${buildQueryString(params)}`
    );
    return response.data;
  },

  getRule: async (id: string): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.get<ApiResponse<AlertRule>>(`/alert-rules/${id}`);
    return response.data;
  },

  createRule: async (data: CreateAlertRuleRequest): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.post<ApiResponse<AlertRule>>('/alert-rules', data);
    return response.data;
  },

  updateRule: async (
    id: string,
    data: Partial<CreateAlertRuleRequest>
  ): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.patch<ApiResponse<AlertRule>>(`/alert-rules/${id}`, data);
    return response.data;
  },

  deleteRule: async (id: string): Promise<void> => {
    await apiClient.delete(`/alert-rules/${id}`);
  },

  enableRule: async (id: string): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.post<ApiResponse<AlertRule>>(`/alert-rules/${id}/enable`);
    return response.data;
  },

  disableRule: async (id: string): Promise<ApiResponse<AlertRule>> => {
    const response = await apiClient.post<ApiResponse<AlertRule>>(`/alert-rules/${id}/disable`);
    return response.data;
  },
};

// ============================================================================
// Metrics API
// ============================================================================

export const metricsApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/metrics/dashboard');
    return response.data;
  },

  query: async (query: MetricsQuery): Promise<ApiResponse<TimeSeriesPoint[]>> => {
    const response = await apiClient.post<ApiResponse<TimeSeriesPoint[]>>(
      '/metrics/query',
      query
    );
    return response.data;
  },

  getQueueMetrics: async (queueId: string): Promise<ApiResponse<import('@/types').QueueMetrics>> => {
    const response = await apiClient.get<ApiResponse<import('@/types').QueueMetrics>>(
      `/metrics/queues/${queueId}`
    );
    return response.data;
  },

  getWorkerMetrics: async (): Promise<ApiResponse<import('@/types').WorkerMetrics>> => {
    const response = await apiClient.get<ApiResponse<import('@/types').WorkerMetrics>>(
      '/metrics/workers'
    );
    return response.data;
  },

  getThroughput: async (
    period: '1h' | '6h' | '24h' | '7d' = '24h'
  ): Promise<ApiResponse<import('@/types').ThroughputData[]>> => {
    const response = await apiClient.get<ApiResponse<import('@/types').ThroughputData[]>>(
      `/metrics/throughput?period=${period}`
    );
    return response.data;
  },

  getLatency: async (
    period: '1h' | '6h' | '24h' | '7d' = '24h'
  ): Promise<ApiResponse<import('@/types').LatencyData[]>> => {
    const response = await apiClient.get<ApiResponse<import('@/types').LatencyData[]>>(
      `/metrics/latency?period=${period}`
    );
    return response.data;
  },

  getErrors: async (
    period: '1h' | '6h' | '24h' | '7d' = '24h'
  ): Promise<ApiResponse<import('@/types').ErrorData[]>> => {
    const response = await apiClient.get<ApiResponse<import('@/types').ErrorData[]>>(
      `/metrics/errors?period=${period}`
    );
    return response.data;
  },

  exportPrometheus: async (): Promise<string> => {
    const response = await apiClient.get('/metrics/prometheus', {
      responseType: 'text',
    });
    return response.data;
  },
};

// ============================================================================
// Audit API
// ============================================================================

export const auditApi = {
  list: async (
    query: AuditLogQuery = {},
    params: QueryParams = {}
  ): Promise<PaginatedResponse<AuditLog>> => {
    const searchParams = new URLSearchParams();

    if (query.action) searchParams.append('action', query.action);
    if (query.resource_type) searchParams.append('resource_type', query.resource_type);
    if (query.resource_id) searchParams.append('resource_id', query.resource_id);
    if (query.user_id) searchParams.append('user_id', query.user_id);
    if (query.start_time) searchParams.append('start_time', query.start_time);
    if (query.end_time) searchParams.append('end_time', query.end_time);

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    const url = `/audit${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<PaginatedResponse<AuditLog>>(url);
    return response.data;
  },

  get: async (id: string): Promise<ApiResponse<AuditLog>> => {
    const response = await apiClient.get<ApiResponse<AuditLog>>(`/audit/${id}`);
    return response.data;
  },

  export: async (
    query: AuditLogQuery = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> => {
    const searchParams = new URLSearchParams();

    if (query.action) searchParams.append('action', query.action);
    if (query.resource_type) searchParams.append('resource_type', query.resource_type);
    if (query.start_time) searchParams.append('start_time', query.start_time);
    if (query.end_time) searchParams.append('end_time', query.end_time);
    searchParams.append('format', format);

    const response = await apiClient.get(`/audit/export?${searchParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================================================
// Health API
// ============================================================================

export const healthApi = {
  check: async (): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime_seconds: number;
    components: Record<string, { status: string; latency_ms: number }>;
  }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  ready: async (): Promise<{ ready: boolean }> => {
    const response = await apiClient.get('/health/ready');
    return response.data;
  },

  live: async (): Promise<{ alive: boolean }> => {
    const response = await apiClient.get('/health/live');
    return response.data;
  },
};

// ============================================================================
// Export default client for custom requests
// ============================================================================

export default apiClient;
