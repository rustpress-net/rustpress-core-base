import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WorkflowStage = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
export type WorkflowAction = 'submit' | 'approve' | 'reject' | 'request_changes' | 'publish' | 'unpublish' | 'schedule';

export interface WorkflowStep {
  id: WorkflowStage;
  label: string;
  description: string;
  icon: string;
  color: string;
  requiredRole?: string[];
  actions: WorkflowAction[];
}

export interface WorkflowTransition {
  id: string;
  from: WorkflowStage;
  to: WorkflowStage;
  action: WorkflowAction;
  timestamp: Date;
  user: WorkflowUser;
  comment?: string;
}

export interface WorkflowUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'author' | 'editor' | 'reviewer' | 'admin';
}

export interface WorkflowComment {
  id: string;
  user: WorkflowUser;
  content: string;
  timestamp: Date;
  stage: WorkflowStage;
  isResolved?: boolean;
}

export interface WorkflowConfig {
  enableReview?: boolean;
  requireApproval?: boolean;
  autoPublish?: boolean;
  notifyOnTransition?: boolean;
  allowSkipReview?: boolean;
  reviewers?: WorkflowUser[];
  stages?: WorkflowStep[];
}

export interface WorkflowState {
  currentStage: WorkflowStage;
  transitions: WorkflowTransition[];
  comments: WorkflowComment[];
  assignedReviewer?: WorkflowUser;
  submittedAt?: Date;
  approvedAt?: Date;
  publishedAt?: Date;
  scheduledFor?: Date;
}

interface WorkflowContextType {
  state: WorkflowState;
  setState: React.Dispatch<React.SetStateAction<WorkflowState>>;
  config: WorkflowConfig;
  currentUser: WorkflowUser;
  availableActions: WorkflowAction[];
  executeAction: (action: WorkflowAction, comment?: string) => void;
  addComment: (content: string) => void;
  resolveComment: (commentId: string) => void;
  assignReviewer: (reviewer: WorkflowUser) => void;
  canExecuteAction: (action: WorkflowAction) => boolean;
}

// ============================================================================
// DEFAULT STAGES
// ============================================================================

const defaultStages: WorkflowStep[] = [
  {
    id: 'draft',
    label: 'Draft',
    description: 'Content is being created',
    icon: '📝',
    color: 'gray',
    actions: ['submit'],
  },
  {
    id: 'review',
    label: 'In Review',
    description: 'Awaiting editorial review',
    icon: '👁️',
    color: 'yellow',
    requiredRole: ['editor', 'reviewer', 'admin'],
    actions: ['approve', 'reject', 'request_changes'],
  },
  {
    id: 'approved',
    label: 'Approved',
    description: 'Ready for publishing',
    icon: '✅',
    color: 'green',
    requiredRole: ['editor', 'admin'],
    actions: ['publish', 'schedule'],
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    description: 'Scheduled for future publishing',
    icon: '📅',
    color: 'blue',
    actions: ['publish', 'unpublish'],
  },
  {
    id: 'published',
    label: 'Published',
    description: 'Live and visible to readers',
    icon: '🌐',
    color: 'green',
    actions: ['unpublish'],
  },
];

// ============================================================================
// CONTEXT
// ============================================================================

const WorkflowContext = createContext<WorkflowContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface WorkflowProviderProps {
  children: React.ReactNode;
  initialState?: Partial<WorkflowState>;
  initialConfig?: WorkflowConfig;
  currentUser: WorkflowUser;
  onTransition?: (transition: WorkflowTransition) => void;
  onPublish?: () => void;
  onSchedule?: (date: Date) => void;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
  initialState,
  initialConfig = {},
  currentUser,
  onTransition,
  onPublish,
  onSchedule,
}) => {
  const [state, setState] = useState<WorkflowState>({
    currentStage: 'draft',
    transitions: [],
    comments: [],
    ...initialState,
  });

  const config: WorkflowConfig = {
    enableReview: true,
    requireApproval: true,
    autoPublish: false,
    notifyOnTransition: true,
    allowSkipReview: false,
    stages: defaultStages,
    reviewers: [],
    ...initialConfig,
  };

  const stages = config.stages || defaultStages;

  const currentStageConfig = useMemo(() =>
    stages.find(s => s.id === state.currentStage),
    [stages, state.currentStage]
  );

  const availableActions = useMemo((): WorkflowAction[] => {
    if (!currentStageConfig) return [];

    const actions = currentStageConfig.actions.filter(action => {
      // Check role requirements
      if (currentStageConfig.requiredRole) {
        if (!currentStageConfig.requiredRole.includes(currentUser.role)) {
          return false;
        }
      }
      return true;
    });

    // Add skip review option if allowed
    if (state.currentStage === 'draft' && config.allowSkipReview &&
        (currentUser.role === 'editor' || currentUser.role === 'admin')) {
      if (!actions.includes('approve')) {
        actions.push('approve');
      }
    }

    return actions;
  }, [currentStageConfig, currentUser, state.currentStage, config.allowSkipReview]);

  const canExecuteAction = useCallback((action: WorkflowAction): boolean => {
    return availableActions.includes(action);
  }, [availableActions]);

  const executeAction = useCallback((action: WorkflowAction, comment?: string) => {
    let nextStage: WorkflowStage = state.currentStage;

    switch (action) {
      case 'submit':
        nextStage = config.enableReview ? 'review' : 'approved';
        break;
      case 'approve':
        nextStage = 'approved';
        break;
      case 'reject':
      case 'request_changes':
        nextStage = 'draft';
        break;
      case 'publish':
        nextStage = 'published';
        onPublish?.();
        break;
      case 'schedule':
        nextStage = 'scheduled';
        break;
      case 'unpublish':
        nextStage = 'draft';
        break;
    }

    const transition: WorkflowTransition = {
      id: `trans-${Date.now()}`,
      from: state.currentStage,
      to: nextStage,
      action,
      timestamp: new Date(),
      user: currentUser,
      comment,
    };

    setState(prev => ({
      ...prev,
      currentStage: nextStage,
      transitions: [...prev.transitions, transition],
      submittedAt: action === 'submit' ? new Date() : prev.submittedAt,
      approvedAt: action === 'approve' ? new Date() : prev.approvedAt,
      publishedAt: action === 'publish' ? new Date() : prev.publishedAt,
    }));

    onTransition?.(transition);
  }, [state.currentStage, currentUser, config.enableReview, onTransition, onPublish]);

  const addComment = useCallback((content: string) => {
    const comment: WorkflowComment = {
      id: `comment-${Date.now()}`,
      user: currentUser,
      content,
      timestamp: new Date(),
      stage: state.currentStage,
      isResolved: false,
    };

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));
  }, [currentUser, state.currentStage]);

  const resolveComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c =>
        c.id === commentId ? { ...c, isResolved: true } : c
      ),
    }));
  }, []);

  const assignReviewer = useCallback((reviewer: WorkflowUser) => {
    setState(prev => ({
      ...prev,
      assignedReviewer: reviewer,
    }));
  }, []);

  return (
    <WorkflowContext.Provider value={{
      state,
      setState,
      config,
      currentUser,
      availableActions,
      executeAction,
      addComment,
      resolveComment,
      assignReviewer,
      canExecuteAction,
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  gray: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-400' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', border: 'border-green-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-400' },
};

const actionLabels: Record<WorkflowAction, { label: string; icon: string }> = {
  submit: { label: 'Submit for Review', icon: '📤' },
  approve: { label: 'Approve', icon: '✅' },
  reject: { label: 'Reject', icon: '❌' },
  request_changes: { label: 'Request Changes', icon: '📝' },
  publish: { label: 'Publish Now', icon: '🚀' },
  unpublish: { label: 'Unpublish', icon: '📥' },
  schedule: { label: 'Schedule', icon: '📅' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Stage Progress
export const StageProgress: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, config } = useWorkflow();
  const stages = config.stages || defaultStages;

  const currentIndex = stages.findIndex(s => s.id === state.currentStage);

  return (
    <div className={`flex items-center ${className}`}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const colors = stageColors[stage.color];

        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? `${colors.bg} ${colors.text} ring-2 ring-offset-2 ring-blue-500`
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : stage.icon}
              </motion.div>
              <span className={`text-xs mt-1 font-medium ${
                isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}>
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Current Stage Card
export const CurrentStageCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, config } = useWorkflow();
  const stages = config.stages || defaultStages;
  const currentStage = stages.find(s => s.id === state.currentStage);

  if (!currentStage) return null;

  const colors = stageColors[currentStage.color];

  return (
    <div className={`rounded-lg p-4 ${colors.bg} border-l-4 ${colors.border} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{currentStage.icon}</span>
        <div>
          <h4 className={`font-semibold ${colors.text}`}>
            {currentStage.label}
          </h4>
          <p className={`text-sm opacity-75 ${colors.text}`}>
            {currentStage.description}
          </p>
        </div>
      </div>

      {state.assignedReviewer && state.currentStage === 'review' && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
          {state.assignedReviewer.avatar ? (
            <img src={state.assignedReviewer.avatar} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs">
              {state.assignedReviewer.name[0]}
            </div>
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {state.assignedReviewer.name}
          </span>
        </div>
      )}
    </div>
  );
};

// Action Buttons
export const ActionButtons: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { availableActions, executeAction, canExecuteAction } = useWorkflow();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [actionComment, setActionComment] = useState('');
  const [activeAction, setActiveAction] = useState<WorkflowAction | null>(null);

  const handleAction = (action: WorkflowAction) => {
    if (action === 'schedule') {
      setShowScheduleModal(true);
      return;
    }

    if (action === 'reject' || action === 'request_changes') {
      setActiveAction(action);
      return;
    }

    executeAction(action);
  };

  const submitWithComment = () => {
    if (activeAction) {
      executeAction(activeAction, actionComment);
      setActiveAction(null);
      setActionComment('');
    }
  };

  const primaryActions: WorkflowAction[] = ['publish', 'approve', 'submit'];
  const primaryAction = availableActions.find(a => primaryActions.includes(a));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary Action */}
      {primaryAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleAction(primaryAction)}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
        >
          <span>{actionLabels[primaryAction].icon}</span>
          {actionLabels[primaryAction].label}
        </motion.button>
      )}

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-2">
        {availableActions
          .filter(a => a !== primaryAction)
          .map((action) => (
            <button
              key={action}
              onClick={() => handleAction(action)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                action === 'reject'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{actionLabels[action].icon}</span>
              {actionLabels[action].label}
            </button>
          ))}
      </div>

      {/* Comment Modal for Reject/Request Changes */}
      <AnimatePresence>
        {activeAction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {actionLabels[activeAction].label}
            </h4>
            <textarea
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              placeholder="Add a comment explaining your decision..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={submitWithComment}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  activeAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {actionLabels[activeAction].label}
              </button>
              <button
                onClick={() => { setActiveAction(null); setActionComment(''); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reviewer Assignment
export const ReviewerAssignment: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, config, assignReviewer } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);

  if (state.currentStage !== 'review' || !config.reviewers?.length) return null;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Assign Reviewer
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
      >
        {state.assignedReviewer ? (
          <div className="flex items-center gap-2">
            {state.assignedReviewer.avatar ? (
              <img src={state.assignedReviewer.avatar} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                {state.assignedReviewer.name[0]}
              </div>
            )}
            <span className="text-gray-900 dark:text-white">{state.assignedReviewer.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a reviewer...</span>
        )}
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
          >
            {config.reviewers?.map((reviewer) => (
              <button
                key={reviewer.id}
                onClick={() => { assignReviewer(reviewer); setIsOpen(false); }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  state.assignedReviewer?.id === reviewer.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {reviewer.avatar ? (
                  <img src={reviewer.avatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {reviewer.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{reviewer.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{reviewer.role}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Transition History
export const TransitionHistory: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = useWorkflow();

  if (state.transitions.length === 0) return null;

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Activity History
      </h4>
      <div className="space-y-3">
        {[...state.transitions].reverse().map((transition) => (
          <div key={transition.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {transition.user.avatar ? (
                <img src={transition.user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {transition.user.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{transition.user.name}</span>
                {' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {actionLabels[transition.action].label.toLowerCase()}
                </span>
              </p>
              {transition.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  "{transition.comment}"
                </p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">
                {formatRelativeTime(transition.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Comments Section
export const CommentsSection: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, addComment, resolveComment, currentUser } = useWorkflow();
  const [newComment, setNewComment] = useState('');

  const unresolvedComments = state.comments.filter(c => !c.isResolved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className={className}>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Review Comments {unresolvedComments.length > 0 && `(${unresolvedComments.length})`}
      </h4>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {state.comments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg ${
              comment.isResolved
                ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                    {comment.user.name[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.user.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(comment.timestamp)}
                </span>
              </div>
              {!comment.isResolved && (
                <button
                  onClick={() => resolveComment(comment.id)}
                  className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Resolve
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {comment.content}
            </p>
          </div>
        ))}

        {state.comments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Add
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PublishingWorkflow: React.FC<{
  initialState?: Partial<WorkflowState>;
  initialConfig?: WorkflowConfig;
  currentUser: WorkflowUser;
  onTransition?: (transition: WorkflowTransition) => void;
  onPublish?: () => void;
  onSchedule?: (date: Date) => void;
  className?: string;
}> = ({
  initialState,
  initialConfig,
  currentUser,
  onTransition,
  onPublish,
  onSchedule,
  className = '',
}) => {
  return (
    <WorkflowProvider
      initialState={initialState}
      initialConfig={initialConfig}
      currentUser={currentUser}
      onTransition={onTransition}
      onPublish={onPublish}
      onSchedule={onSchedule}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Publishing Workflow
          </h3>
          <StageProgress />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <CurrentStageCard />
          <ReviewerAssignment />
          <ActionButtons />
        </div>

        {/* Activity & Comments */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransitionHistory />
            <CommentsSection />
          </div>
        </div>
      </div>
    </WorkflowProvider>
  );
};

export default PublishingWorkflow;
