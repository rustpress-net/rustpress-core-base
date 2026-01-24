import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi, queueApi } from '@api/client';
import type { ScheduledJob, CreateScheduledJobRequest, JobScheduleType } from '@/types';
import { PageWrapper, EmptyState, ErrorState } from '@components/Layout';
import { Button, Card, LoadingSpinner, Modal, StatusBadge } from '@components/common';
import { SearchInput } from '@components/common/Input';

export default function ScheduledJobs() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: () => jobApi.list({ search: searchQuery || undefined }),
    refetchInterval: 10000,
  });

  const deleteMutation = useMutation({
    mutationFn: jobApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted');
    },
    onError: () => toast.error('Failed to delete job'),
  });

  const pauseMutation = useMutation({
    mutationFn: jobApi.pause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job paused');
    },
    onError: () => toast.error('Failed to pause job'),
  });

  const resumeMutation = useMutation({
    mutationFn: jobApi.resume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job resumed');
    },
    onError: () => toast.error('Failed to resume job'),
  });

  const triggerMutation = useMutation({
    mutationFn: jobApi.trigger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job triggered');
    },
    onError: () => toast.error('Failed to trigger job'),
  });

  if (error) {
    return (
      <PageWrapper title="Scheduled Jobs">
        <ErrorState message="Failed to load scheduled jobs" retry={refetch} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Scheduled Jobs"
      subtitle="Manage recurring and one-time scheduled tasks"
      action={
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Job
        </Button>
      }
    >
      {/* Filters */}
      <Card padding="sm">
        <SearchInput
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
      </Card>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No scheduled jobs found"
            description="Create a job to schedule recurring tasks"
            action={<Button onClick={() => setShowCreateModal(true)}>Create Job</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPause={() => pauseMutation.mutate(job.id)}
              onResume={() => resumeMutation.mutate(job.id)}
              onTrigger={() => triggerMutation.mutate(job.id)}
              onDelete={() => {
                if (confirm('Delete this job?')) {
                  deleteMutation.mutate(job.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </PageWrapper>
  );
}

// Job Card
interface JobCardProps {
  job: ScheduledJob;
  onPause: () => void;
  onResume: () => void;
  onTrigger: () => void;
  onDelete: () => void;
}

function JobCard({ job, onPause, onResume, onTrigger, onDelete }: JobCardProps) {
  const successRate = job.total_runs > 0
    ? (job.successful_runs / job.total_runs) * 100
    : 100;

  return (
    <Card className="hover:border-slate-600 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-semibold text-white">{job.name}</span>
            <StatusBadge status={job.status} />
            <span className="badge-primary">{job.schedule_type}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            {job.cron_expression && (
              <span className="font-mono bg-slate-700/50 px-2 py-0.5 rounded">
                {job.cron_expression}
              </span>
            )}
            {job.interval_seconds && (
              <span>Every {job.interval_seconds}s</span>
            )}
            <span>TZ: {job.timezone}</span>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-slate-400">Next Run</p>
            <p className="text-white">
              {job.next_run_at
                ? new Date(job.next_run_at).toLocaleString()
                : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400">Last Run</p>
            <p className="text-white">
              {job.last_run_at
                ? new Date(job.last_run_at).toLocaleString()
                : 'Never'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{job.total_runs}</p>
            <p className="text-slate-400">Runs</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${successRate >= 95 ? 'text-success-500' : 'text-danger-500'}`}>
              {successRate.toFixed(0)}%
            </p>
            <p className="text-slate-400">Success</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onTrigger}>
            Run Now
          </Button>
          {job.status === 'active' ? (
            <Button variant="ghost" size="sm" onClick={onPause}>
              Pause
            </Button>
          ) : job.status === 'paused' ? (
            <Button variant="ghost" size="sm" onClick={onResume}>
              Resume
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <svg className="w-4 h-4 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Create Job Modal
function CreateJobModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateScheduledJobRequest>({
    name: '',
    schedule_type: 'cron',
    queue_id: '',
    message_template: '{}',
    timezone: 'UTC',
  });

  const queuesQuery = useQuery({
    queryKey: ['queues-list'],
    queryFn: () => queueApi.list({ per_page: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: jobApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created');
      onClose();
    },
    onError: () => toast.error('Failed to create job'),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Scheduled Job"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => createMutation.mutate(formData)}
            loading={createMutation.isPending}
            disabled={!formData.name || !formData.queue_id}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
          <input
            type="text"
            className="input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Schedule Type</label>
          <select
            className="select"
            value={formData.schedule_type}
            onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as JobScheduleType })}
          >
            <option value="cron">Cron Expression</option>
            <option value="interval">Fixed Interval</option>
            <option value="once">One-time</option>
          </select>
        </div>

        {formData.schedule_type === 'cron' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Cron Expression</label>
            <input
              type="text"
              className="input font-mono"
              value={formData.cron_expression || ''}
              onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
              placeholder="0 * * * *"
            />
            <p className="text-xs text-slate-400 mt-1">e.g., "0 * * * *" for every hour</p>
          </div>
        )}

        {formData.schedule_type === 'interval' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Interval (seconds)</label>
            <input
              type="number"
              className="input"
              value={formData.interval_seconds || 60}
              onChange={(e) => setFormData({ ...formData, interval_seconds: Number(e.target.value) })}
              min={1}
            />
          </div>
        )}

        {formData.schedule_type === 'once' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Run At</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.run_at || ''}
              onChange={(e) => setFormData({ ...formData, run_at: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Queue</label>
          <select
            className="select"
            value={formData.queue_id}
            onChange={(e) => setFormData({ ...formData, queue_id: e.target.value })}
            required
          >
            <option value="">Select a queue</option>
            {queuesQuery.data?.data.map((queue) => (
              <option key={queue.id} value={queue.id}>{queue.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Message Template</label>
          <textarea
            className="input min-h-[100px] font-mono"
            value={formData.message_template}
            onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
            placeholder='{"type": "scheduled", "data": {}}'
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
          <select
            className="select"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
