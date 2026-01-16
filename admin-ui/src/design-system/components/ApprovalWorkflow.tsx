import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'skipped';
export type StepType = 'review' | 'approval' | 'sign_off' | 'publish' | 'custom';

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface ApprovalStep {
  id: string;
  name: string;
  type: StepType;
  description?: string;
  order: number;
  requiredReviewers: number;
  assignedReviewers: Reviewer[];
  status: ApprovalStatus;
  completedBy?: Reviewer;
  completedAt?: Date;
  comments?: ApprovalComment[];
  canSkip: boolean;
  autoApproveAfterHours?: number;
}

export interface ApprovalComment {
  id: string;
  author: Reviewer;
  content: string;
  createdAt: Date;
  type: 'comment' | 'approval' | 'rejection' | 'change_request';
}

export interface ApprovalRequest {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  steps: ApprovalStep[];
  currentStepIndex: number;
  requestedBy: Reviewer;
  requestedAt: Date;
  completedAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate?: Date;
}

export interface ApprovalWorkflowConfig {
  allowBulkApproval: boolean;
  requireCommentOnReject: boolean;
  autoAdvanceOnApprove: boolean;
  notifyOnStatusChange: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ApprovalWorkflowContextValue {
  requests: ApprovalRequest[];
  currentUser: Reviewer;
  selectedRequest: ApprovalRequest | null;
  filterStatus: string | null;
  setSelectedRequest: (request: ApprovalRequest | null) => void;
  setFilterStatus: (status: string | null) => void;
  approveStep: (requestId: string, stepId: string, comment?: string) => void;
  rejectStep: (requestId: string, stepId: string, comment: string) => void;
  requestChanges: (requestId: string, stepId: string, comment: string) => void;
  skipStep: (requestId: string, stepId: string) => void;
  addComment: (requestId: string, stepId: string, comment: string) => void;
  reassignStep: (requestId: string, stepId: string, reviewerId: string) => void;
  getMyPendingRequests: () => ApprovalRequest[];
  getRequestsAwaitingMe: () => ApprovalRequest[];
  config: ApprovalWorkflowConfig;
}

const ApprovalWorkflowContext = createContext<ApprovalWorkflowContextValue | null>(null);

export const useApprovalWorkflow = () => {
  const context = useContext(ApprovalWorkflowContext);
  if (!context) {
    throw new Error('useApprovalWorkflow must be used within an ApprovalWorkflowProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '1.5rem',
    minHeight: '600px',
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  badge: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  },
  filterTabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
  },
  filterTab: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    background: 'none',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s',
  },
  filterTabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  requestList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.5rem',
  },
  requestItem: {
    padding: '0.875rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  requestItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  requestTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.375rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  requestMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  priorityDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  stepIndicator: {
    fontSize: '0.6875rem',
    color: '#94a3b8',
  },
  mainContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  contentHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  contentTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  contentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  contentBody: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.5rem',
  },
  stepsContainer: {
    position: 'relative' as const,
  },
  stepConnector: {
    position: 'absolute' as const,
    left: '18px',
    top: '40px',
    bottom: '20px',
    width: '2px',
    backgroundColor: '#e2e8f0',
  },
  stepCard: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative' as const,
  },
  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid #e2e8f0',
  },
  stepContentActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  stepName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  stepDescription: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '0.75rem',
  },
  reviewersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  reviewerAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
    boxShadow: '0 0 0 1px #e2e8f0',
  },
  moreReviewers: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#64748b',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  approveButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  rejectButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  changesButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  skipButton: {
    padding: '0.625rem 1rem',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  commentsSection: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  commentsTitle: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.75rem',
  },
  comment: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  commentAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  commentText: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  commentTime: {
    fontSize: '0.6875rem',
    color: '#94a3b8',
  },
  commentInput: {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  completedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#10b981',
  },
  timeline: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  timelineTitle: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.75rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    fontSize: '0.8125rem',
  },
  timelineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '0.25rem',
    flexShrink: 0,
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '1rem',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

const priorityColors: Record<string, string> = {
  low: '#94a3b8',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: '#f1f5f9', text: '#64748b', icon: '#94a3b8' },
  approved: { bg: '#dcfce7', text: '#166534', icon: '#10b981' },
  rejected: { bg: '#fee2e2', text: '#dc2626', icon: '#ef4444' },
  changes_requested: { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' },
  skipped: { bg: '#e0e7ff', text: '#4338ca', icon: '#6366f1' },
  in_progress: { bg: '#dbeafe', text: '#1d4ed8', icon: '#3b82f6' },
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ApprovalWorkflowProviderProps {
  children: React.ReactNode;
  initialRequests?: ApprovalRequest[];
  currentUser?: Reviewer;
  config?: Partial<ApprovalWorkflowConfig>;
  onApprove?: (requestId: string, stepId: string) => void;
  onReject?: (requestId: string, stepId: string, comment: string) => void;
  onRequestChanges?: (requestId: string, stepId: string, comment: string) => void;
}

export const ApprovalWorkflowProvider: React.FC<ApprovalWorkflowProviderProps> = ({
  children,
  initialRequests = [],
  currentUser = { id: 'current', name: 'Current User', email: 'user@example.com', avatar: '', role: 'Editor' },
  config: configOverrides = {},
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(initialRequests[0] || null);
  const [filterStatus, setFilterStatus] = useState<string | null>('pending');

  const config: ApprovalWorkflowConfig = {
    allowBulkApproval: true,
    requireCommentOnReject: true,
    autoAdvanceOnApprove: true,
    notifyOnStatusChange: true,
    ...configOverrides,
  };

  const updateRequest = useCallback((requestId: string, updater: (request: ApprovalRequest) => ApprovalRequest) => {
    setRequests(prev => prev.map(r => r.id === requestId ? updater(r) : r));
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? updater(prev) : null);
    }
  }, [selectedRequest]);

  const approveStep = useCallback((requestId: string, stepId: string, comment?: string) => {
    updateRequest(requestId, request => {
      const stepIndex = request.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return request;

      const updatedSteps = [...request.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: 'approved',
        completedBy: currentUser,
        completedAt: new Date(),
        comments: comment ? [
          ...(updatedSteps[stepIndex].comments || []),
          { id: `c-${Date.now()}`, author: currentUser, content: comment, createdAt: new Date(), type: 'approval' }
        ] : updatedSteps[stepIndex].comments,
      };

      // Auto advance if configured
      let nextStepIndex = request.currentStepIndex;
      if (config.autoAdvanceOnApprove && stepIndex === request.currentStepIndex) {
        nextStepIndex = Math.min(stepIndex + 1, request.steps.length - 1);
      }

      // Check if all steps are approved
      const allApproved = updatedSteps.every(s => s.status === 'approved' || s.status === 'skipped');

      return {
        ...request,
        steps: updatedSteps,
        currentStepIndex: nextStepIndex,
        status: allApproved ? 'approved' : 'in_progress',
        completedAt: allApproved ? new Date() : undefined,
      };
    });
    onApprove?.(requestId, stepId);
  }, [currentUser, config.autoAdvanceOnApprove, updateRequest, onApprove]);

  const rejectStep = useCallback((requestId: string, stepId: string, comment: string) => {
    updateRequest(requestId, request => {
      const stepIndex = request.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return request;

      const updatedSteps = [...request.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: 'rejected',
        completedBy: currentUser,
        completedAt: new Date(),
        comments: [
          ...(updatedSteps[stepIndex].comments || []),
          { id: `c-${Date.now()}`, author: currentUser, content: comment, createdAt: new Date(), type: 'rejection' }
        ],
      };

      return {
        ...request,
        steps: updatedSteps,
        status: 'rejected',
      };
    });
    onReject?.(requestId, stepId, comment);
  }, [currentUser, updateRequest, onReject]);

  const requestChanges = useCallback((requestId: string, stepId: string, comment: string) => {
    updateRequest(requestId, request => {
      const stepIndex = request.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return request;

      const updatedSteps = [...request.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: 'changes_requested',
        comments: [
          ...(updatedSteps[stepIndex].comments || []),
          { id: `c-${Date.now()}`, author: currentUser, content: comment, createdAt: new Date(), type: 'change_request' }
        ],
      };

      return {
        ...request,
        steps: updatedSteps,
        status: 'pending',
      };
    });
    onRequestChanges?.(requestId, stepId, comment);
  }, [currentUser, updateRequest, onRequestChanges]);

  const skipStep = useCallback((requestId: string, stepId: string) => {
    updateRequest(requestId, request => {
      const stepIndex = request.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1 || !request.steps[stepIndex].canSkip) return request;

      const updatedSteps = [...request.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        status: 'skipped',
        completedBy: currentUser,
        completedAt: new Date(),
      };

      const nextStepIndex = Math.min(stepIndex + 1, request.steps.length - 1);

      return {
        ...request,
        steps: updatedSteps,
        currentStepIndex: nextStepIndex,
      };
    });
  }, [currentUser, updateRequest]);

  const addComment = useCallback((requestId: string, stepId: string, comment: string) => {
    updateRequest(requestId, request => {
      const stepIndex = request.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return request;

      const updatedSteps = [...request.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        comments: [
          ...(updatedSteps[stepIndex].comments || []),
          { id: `c-${Date.now()}`, author: currentUser, content: comment, createdAt: new Date(), type: 'comment' }
        ],
      };

      return { ...request, steps: updatedSteps };
    });
  }, [currentUser, updateRequest]);

  const reassignStep = useCallback((requestId: string, stepId: string, reviewerId: string) => {
    // Implementation would add/change reviewer
  }, []);

  const getMyPendingRequests = useCallback(() => {
    return requests.filter(r => r.requestedBy.id === currentUser.id && r.status !== 'approved');
  }, [requests, currentUser]);

  const getRequestsAwaitingMe = useCallback(() => {
    return requests.filter(r => {
      const currentStep = r.steps[r.currentStepIndex];
      return currentStep?.assignedReviewers.some(rev => rev.id === currentUser.id) &&
        currentStep.status === 'pending';
    });
  }, [requests, currentUser]);

  const value: ApprovalWorkflowContextValue = {
    requests,
    currentUser,
    selectedRequest,
    filterStatus,
    setSelectedRequest,
    setFilterStatus,
    approveStep,
    rejectStep,
    requestChanges,
    skipStep,
    addComment,
    reassignStep,
    getMyPendingRequests,
    getRequestsAwaitingMe,
    config,
  };

  return (
    <ApprovalWorkflowContext.Provider value={value}>
      {children}
    </ApprovalWorkflowContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const RequestList: React.FC = () => {
  const {
    requests, selectedRequest, setSelectedRequest,
    filterStatus, setFilterStatus,
    getRequestsAwaitingMe,
  } = useApprovalWorkflow();

  const awaitingMe = getRequestsAwaitingMe();

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'awaiting') {
      return awaitingMe;
    }
    if (!filterStatus || filterStatus === 'all') return requests;
    return requests.filter(r => r.status === filterStatus);
  }, [requests, filterStatus, awaitingMe]);

  const filters = [
    { id: 'awaiting', label: 'Awaiting Me' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h3 style={styles.sidebarTitle}>Approval Requests</h3>
        {awaitingMe.length > 0 && (
          <span style={styles.badge}>{awaitingMe.length}</span>
        )}
      </div>

      <div style={styles.filterTabs}>
        {filters.map(filter => (
          <button
            key={filter.id}
            style={{
              ...styles.filterTab,
              ...(filterStatus === filter.id ? styles.filterTabActive : {}),
            }}
            onClick={() => setFilterStatus(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div style={styles.requestList}>
        {filteredRequests.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No requests found</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <motion.div
              key={request.id}
              style={{
                ...styles.requestItem,
                ...(selectedRequest?.id === request.id ? styles.requestItemActive : {}),
              }}
              onClick={() => setSelectedRequest(request)}
              whileHover={{ backgroundColor: '#f8fafc' }}
            >
              <div style={styles.requestTitle}>{request.contentTitle}</div>
              <div style={styles.requestMeta}>
                <div style={{ ...styles.priorityDot, backgroundColor: priorityColors[request.priority] }} />
                <span>{request.contentType}</span>
                <span style={styles.stepIndicator}>
                  Step {request.currentStepIndex + 1}/{request.steps.length}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export const StepCard: React.FC<{
  step: ApprovalStep;
  isCurrentStep: boolean;
  requestId: string;
}> = ({ step, isCurrentStep, requestId }) => {
  const { currentUser, approveStep, rejectStep, requestChanges, skipStep, addComment } = useApprovalWorkflow();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes' | 'comment' | null>(null);

  const statusStyle = statusColors[step.status];
  const isReviewer = step.assignedReviewers.some(r => r.id === currentUser.id);
  const canAct = isCurrentStep && isReviewer && step.status === 'pending';

  const handleAction = (type: 'approve' | 'reject' | 'changes') => {
    if (type === 'approve') {
      approveStep(requestId, step.id, comment || undefined);
      setComment('');
      setShowCommentInput(false);
    } else {
      setActionType(type);
      setShowCommentInput(true);
    }
  };

  const submitAction = () => {
    if (!comment.trim()) return;
    if (actionType === 'reject') {
      rejectStep(requestId, step.id, comment);
    } else if (actionType === 'changes') {
      requestChanges(requestId, step.id, comment);
    } else {
      addComment(requestId, step.id, comment);
    }
    setComment('');
    setShowCommentInput(false);
    setActionType(null);
  };

  return (
    <div style={styles.stepCard}>
      <div
        style={{
          ...styles.stepIcon,
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
        }}
      >
        {step.status === 'approved' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : step.status === 'rejected' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{step.order}</span>
        )}
      </div>

      <div
        style={{
          ...styles.stepContent,
          ...(isCurrentStep ? styles.stepContentActive : {}),
        }}
      >
        <div style={styles.stepHeader}>
          <div>
            <div style={styles.stepName}>{step.name}</div>
            {step.description && (
              <div style={styles.stepDescription}>{step.description}</div>
            )}
          </div>
          {step.status !== 'pending' && (
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              {step.status.replace('_', ' ')}
            </span>
          )}
        </div>

        <div style={styles.reviewersRow}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reviewers:</span>
          {step.assignedReviewers.slice(0, 4).map((reviewer, idx) => (
            <img
              key={reviewer.id}
              src={reviewer.avatar}
              alt={reviewer.name}
              style={{
                ...styles.reviewerAvatar,
                marginLeft: idx > 0 ? '-8px' : '0',
              }}
              title={reviewer.name}
            />
          ))}
          {step.assignedReviewers.length > 4 && (
            <div style={styles.moreReviewers}>+{step.assignedReviewers.length - 4}</div>
          )}
        </div>

        {step.completedBy && step.completedAt && (
          <div style={styles.completedBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {step.status === 'approved' ? 'Approved' : step.status === 'skipped' ? 'Skipped' : 'Completed'} by {step.completedBy.name}
          </div>
        )}

        {canAct && (
          <div style={styles.actionButtons}>
            <button style={styles.approveButton} onClick={() => handleAction('approve')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Approve
            </button>
            <button style={styles.changesButton} onClick={() => handleAction('changes')}>
              Request Changes
            </button>
            <button style={styles.rejectButton} onClick={() => handleAction('reject')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reject
            </button>
            {step.canSkip && (
              <button style={styles.skipButton} onClick={() => skipStep(requestId, step.id)}>
                Skip
              </button>
            )}
          </div>
        )}

        {showCommentInput && (
          <div style={{ marginTop: '1rem' }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionType === 'reject' ? 'Reason for rejection (required)...' :
                actionType === 'changes' ? 'Describe requested changes...' : 'Add a comment...'}
              style={{ ...styles.commentInput, minHeight: '80px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowCommentInput(false);
                  setActionType(null);
                  setComment('');
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.submitButton,
                  backgroundColor: actionType === 'reject' ? '#ef4444' :
                    actionType === 'changes' ? '#f59e0b' : '#3b82f6',
                }}
                onClick={submitAction}
                disabled={!comment.trim()}
              >
                {actionType === 'reject' ? 'Confirm Rejection' :
                  actionType === 'changes' ? 'Request Changes' : 'Add Comment'}
              </button>
            </div>
          </div>
        )}

        {step.comments && step.comments.length > 0 && (
          <div style={styles.commentsSection}>
            <div style={styles.commentsTitle}>Comments ({step.comments.length})</div>
            {step.comments.map(c => (
              <div key={c.id} style={styles.comment}>
                <img src={c.author.avatar} alt={c.author.name} style={styles.commentAvatar} />
                <div style={styles.commentContent}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={styles.commentAuthor}>{c.author.name}</span>
                    <span style={styles.commentTime}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={styles.commentText}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const RequestDetails: React.FC = () => {
  const { selectedRequest } = useApprovalWorkflow();

  if (!selectedRequest) {
    return (
      <div style={styles.mainContent}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <p>Select a request to view details</p>
        </div>
      </div>
    );
  }

  const statusStyle = statusColors[selectedRequest.status];

  return (
    <div style={styles.mainContent}>
      <div style={styles.contentHeader}>
        <h2 style={styles.contentTitle}>{selectedRequest.contentTitle}</h2>
        <div style={styles.contentMeta}>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {selectedRequest.status.replace('_', ' ')}
          </span>
          <span>Type: {selectedRequest.contentType}</span>
          <span>Requested by: {selectedRequest.requestedBy.name}</span>
          {selectedRequest.dueDate && (
            <span>Due: {new Date(selectedRequest.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div style={styles.contentBody}>
        <div style={styles.stepsContainer}>
          <div style={styles.stepConnector} />
          {selectedRequest.steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              isCurrentStep={index === selectedRequest.currentStepIndex}
              requestId={selectedRequest.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ApprovalWorkflow: React.FC = () => {
  return (
    <div style={styles.container}>
      <RequestList />
      <RequestDetails />
    </div>
  );
};

export default ApprovalWorkflow;
