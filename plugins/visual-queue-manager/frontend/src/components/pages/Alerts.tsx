import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { alertApi } from '@api/client';
import type { Alert, AlertSeverity } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, CardHeader, LoadingSpinner, StatusBadge } from '@components/common';

export default function Alerts() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', statusFilter],
    queryFn: () => alertApi.list({ status: statusFilter || undefined }),
    refetchInterval: 10000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: alertApi.acknowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: () => toast.error('Failed to acknowledge alert'),
  });

  const resolveMutation = useMutation({
    mutationFn: alertApi.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved');
    },
    onError: () => toast.error('Failed to resolve alert'),
  });

  const filteredAlerts = data?.data.filter((alert) => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    return true;
  }) || [];

  // Group by severity
  const alertsBySeverity = {
    critical: filteredAlerts.filter(a => a.severity === 'critical' && a.status === 'active'),
    error: filteredAlerts.filter(a => a.severity === 'error' && a.status === 'active'),
    warning: filteredAlerts.filter(a => a.severity === 'warning' && a.status === 'active'),
    info: filteredAlerts.filter(a => a.severity === 'info' && a.status === 'active'),
  };

  if (error) {
    return (
      <PageWrapper title="Alerts">
        <ErrorState message="Failed to load alerts" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Alerts"
      subtitle="Monitor and respond to system alerts"
    >
      {/* Alert Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={alertsBySeverity.critical.length > 0 ? 'border-danger-500 glow-danger' : ''}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-500/10 rounded-lg">
              <svg className="w-6 h-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-danger-500">{alertsBySeverity.critical.length}</p>
              <p className="text-sm text-slate-400">Critical</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-500/10 rounded-lg">
              <svg className="w-6 h-6 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertsBySeverity.error.length}</p>
              <p className="text-sm text-slate-400">Errors</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-500/10 rounded-lg">
              <svg className="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertsBySeverity.warning.length}</p>
              <p className="text-sm text-slate-400">Warnings</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{alertsBySeverity.info.length}</p>
              <p className="text-sm text-slate-400">Info</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="select w-full sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            className="select w-full sm:w-40"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </Card>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No alerts"
            description="All systems are operating normally"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={() => acknowledgeMutation.mutate(alert.id)}
              onResolve={() => resolveMutation.mutate(alert.id)}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

// Alert Card
interface AlertCardProps {
  alert: Alert;
  onAcknowledge: () => void;
  onResolve: () => void;
}

function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const severityColors: Record<AlertSeverity, string> = {
    critical: 'border-l-danger-500 bg-danger-500/5',
    error: 'border-l-danger-400 bg-danger-400/5',
    warning: 'border-l-warning-500 bg-warning-500/5',
    info: 'border-l-primary-500 bg-primary-500/5',
  };

  return (
    <Card
      className={`border-l-4 ${severityColors[alert.severity]}`}
      padding="md"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
            <span className="text-sm text-slate-400">
              {new Date(alert.triggered_at).toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white">{alert.title}</h3>
          <p className="text-slate-400 mt-1">{alert.message}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
            <span>Resource: {alert.resource_type}/{alert.resource_id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alert.status === 'active' && (
            <Button variant="secondary" size="sm" onClick={onAcknowledge}>
              Acknowledge
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button variant="success" size="sm" onClick={onResolve}>
              Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const colors: Record<AlertSeverity, string> = {
    critical: 'bg-danger-500 text-white',
    error: 'bg-danger-400 text-white',
    warning: 'bg-warning-500 text-slate-900',
    info: 'bg-primary-500 text-white',
  };

  return (
    <span className={`badge ${colors[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
}
