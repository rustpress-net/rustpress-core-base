import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { auditApi } from '@api/client';
import type { AuditLog, AuditLogQuery } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal } from '@components/common';

export default function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const page = Number(searchParams.get('page') || '1');
  const action = searchParams.get('action') || '';
  const resourceType = searchParams.get('resource_type') || '';

  const query: AuditLogQuery = {
    action: action as AuditLogQuery['action'],
    resource_type: resourceType || undefined,
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', page, action, resourceType],
    queryFn: () => auditApi.list(query, { page, per_page: 50 }),
  });

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await auditApi.export(query, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (error) {
    return (
      <PageWrapper title="Audit Logs">
        <ErrorState message="Failed to load audit logs" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Audit Logs"
      subtitle="Track all system changes and user actions"
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => handleExport('json')}>
            Export JSON
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="select w-full sm:w-48"
            value={action}
            onChange={(e) => setSearchParams({ action: e.target.value, page: '1' })}
          >
            <option value="">All Actions</option>
            <optgroup label="Queue">
              <option value="queue.create">Queue Created</option>
              <option value="queue.update">Queue Updated</option>
              <option value="queue.delete">Queue Deleted</option>
              <option value="queue.pause">Queue Paused</option>
              <option value="queue.resume">Queue Resumed</option>
            </optgroup>
            <optgroup label="Message">
              <option value="message.enqueue">Message Enqueued</option>
              <option value="message.dequeue">Message Dequeued</option>
              <option value="message.ack">Message Acknowledged</option>
              <option value="message.nack">Message Rejected</option>
            </optgroup>
            <optgroup label="Worker">
              <option value="worker.register">Worker Registered</option>
              <option value="worker.deregister">Worker Deregistered</option>
            </optgroup>
            <optgroup label="Handler">
              <option value="handler.create">Handler Created</option>
              <option value="handler.update">Handler Updated</option>
              <option value="handler.delete">Handler Deleted</option>
            </optgroup>
          </select>

          <select
            className="select w-full sm:w-40"
            value={resourceType}
            onChange={(e) => setSearchParams({ resource_type: e.target.value, page: '1' })}
          >
            <option value="">All Resources</option>
            <option value="queue">Queues</option>
            <option value="message">Messages</option>
            <option value="worker">Workers</option>
            <option value="handler">Handlers</option>
            <option value="subscription">Subscriptions</option>
            <option value="job">Jobs</option>
          </select>
        </div>
      </Card>

      {/* Logs List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="No audit logs found"
            description="Actions will be logged here as they occur"
          />
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((log) => (
                  <tr key={log.id}>
                    <td className="text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td>
                      <span className="font-mono text-sm">
                        {log.resource_type}/{log.resource_id.slice(0, 8)}
                      </span>
                    </td>
                    <td>{log.user_name || 'System'}</td>
                    <td className="text-slate-400">{log.ip_address || '-'}</td>
                    <td>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                Page {data.meta.page} of {data.meta.total_pages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_prev}
                  onClick={() => setSearchParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.meta.has_next}
                  onClick={() => setSearchParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </PageWrapper>
  );
}

function ActionBadge({ action }: { action: string }) {
  const [resource, verb] = action.split('.');

  const getColor = () => {
    if (verb === 'create' || verb === 'register') return 'badge-success';
    if (verb === 'delete' || verb === 'deregister') return 'badge-danger';
    if (verb === 'update' || verb === 'pause' || verb === 'resume') return 'badge-warning';
    return 'badge-gray';
  };

  return (
    <span className={getColor()}>
      {action.replace('.', ' ')}
    </span>
  );
}

function AuditDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Audit Log Details" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400">ID</label>
            <p className="font-mono text-white">{log.id}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Timestamp</label>
            <p className="text-white">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Action</label>
            <p><ActionBadge action={log.action} /></p>
          </div>
          <div>
            <label className="text-sm text-slate-400">Resource</label>
            <p className="text-white font-mono">{log.resource_type}/{log.resource_id}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">User</label>
            <p className="text-white">{log.user_name || 'System'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-400">IP Address</label>
            <p className="text-white">{log.ip_address || 'N/A'}</p>
          </div>
        </div>

        {log.user_agent && (
          <div>
            <label className="text-sm text-slate-400">User Agent</label>
            <p className="text-white text-sm">{log.user_agent}</p>
          </div>
        )}

        {log.changes && Object.keys(log.changes).length > 0 && (
          <div>
            <label className="text-sm text-slate-400">Changes</label>
            <div className="mt-2 space-y-2">
              {Object.entries(log.changes).map(([field, change]) => (
                <div key={field} className="bg-slate-700/50 rounded p-3">
                  <p className="text-sm font-medium text-white mb-1">{field}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Old:</span>
                      <pre className="text-danger-400 mt-1">
                        {JSON.stringify(change.old, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400">New:</span>
                      <pre className="text-success-400 mt-1">
                        {JSON.stringify(change.new, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(log.metadata).length > 0 && (
          <div>
            <label className="text-sm text-slate-400">Metadata</label>
            <pre className="code-block mt-1">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
