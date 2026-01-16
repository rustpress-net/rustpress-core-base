import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'overdue' | 'declined';
export type AssignmentPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ContentType = 'post' | 'page' | 'review' | 'edit' | 'research' | 'design' | 'other';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department?: string;
  skills: string[];
  workload: number; // 0-100 percentage
  availability: 'available' | 'busy' | 'away' | 'offline';
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  assigneeId: string;
  assignerId: string;
  contentId?: string;
  contentTitle?: string;
  dueDate: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface AssignmentManagerConfig {
  allowSelfAssignment: boolean;
  requireDueDate: boolean;
  notifyOnAssignment: boolean;
  maxAssignmentsPerMember: number;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface AssignmentManagerContextValue {
  assignments: Assignment[];
  teamMembers: TeamMember[];
  currentUserId: string;
  selectedAssignment: Assignment | null;
  filterStatus: AssignmentStatus | null;
  filterAssignee: string | null;
  filterPriority: AssignmentPriority | null;
  viewMode: 'list' | 'board' | 'workload';
  setSelectedAssignment: (assignment: Assignment | null) => void;
  setFilterStatus: (status: AssignmentStatus | null) => void;
  setFilterAssignee: (id: string | null) => void;
  setFilterPriority: (priority: AssignmentPriority | null) => void;
  setViewMode: (mode: 'list' | 'board' | 'workload') => void;
  createAssignment: (data: Omit<Assignment, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  acceptAssignment: (id: string) => void;
  declineAssignment: (id: string, reason?: string) => void;
  completeAssignment: (id: string) => void;
  reassign: (id: string, newAssigneeId: string) => void;
  getAssignmentsForMember: (memberId: string) => Assignment[];
  getMemberWorkload: (memberId: string) => number;
  config: AssignmentManagerConfig;
}

const AssignmentManagerContext = createContext<AssignmentManagerContextValue | null>(null);

export const useAssignmentManager = () => {
  const context = useContext(AssignmentManagerContext);
  if (!context) {
    throw new Error('useAssignmentManager must be used within an AssignmentManagerProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  badge: {
    padding: '0.25rem 0.625rem',
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  viewTabs: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '0.25rem',
  },
  viewTab: {
    padding: '0.5rem 0.875rem',
    border: 'none',
    background: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  viewTabActive: {
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  toolbar: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  filterSelect: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    minWidth: '140px',
  },
  searchInput: {
    padding: '0.5rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    width: '200px',
    outline: 'none',
  },
  content: {
    padding: '1.5rem',
  },
  listView: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  assignmentCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  assigneeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f1f5f9',
    borderRadius: '9999px',
  },
  avatar: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
  },
  avatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
  },
  dueDate: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  dueDateOverdue: {
    color: '#ef4444',
  },
  boardView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    alignItems: 'start',
  },
  boardColumn: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '0.75rem',
    minHeight: '400px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    padding: '0 0.25rem',
  },
  columnTitle: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  columnCount: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    backgroundColor: '#e2e8f0',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  boardCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    cursor: 'grab',
  },
  workloadView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  memberCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  memberHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  memberRole: {
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  availabilityBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 500,
  },
  workloadBar: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
  },
  progressBarContainer: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  workloadLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  memberAssignments: {
    padding: '0.75rem',
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  miniAssignment: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    marginBottom: '0.375rem',
    fontSize: '0.8125rem',
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
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  closeButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '4px',
  },
  modalBody: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.375rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  memberSelectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  memberSelectItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  memberSelectItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  modalFooter: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#64748b',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#374151',
  },
};

const priorityColors: Record<AssignmentPriority, string> = {
  low: '#94a3b8',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const statusColors: Record<AssignmentStatus, { bg: string; text: string }> = {
  pending: { bg: '#f1f5f9', text: '#64748b' },
  accepted: { bg: '#dbeafe', text: '#1d4ed8' },
  in_progress: { bg: '#fef3c7', text: '#92400e' },
  completed: { bg: '#dcfce7', text: '#166534' },
  overdue: { bg: '#fee2e2', text: '#dc2626' },
  declined: { bg: '#fce7f3', text: '#be185d' },
};

const availabilityColors: Record<string, { bg: string; text: string }> = {
  available: { bg: '#dcfce7', text: '#166534' },
  busy: { bg: '#fef3c7', text: '#92400e' },
  away: { bg: '#f1f5f9', text: '#64748b' },
  offline: { bg: '#fee2e2', text: '#dc2626' },
};

// ============================================================================
// PROVIDER
// ============================================================================

interface AssignmentManagerProviderProps {
  children: React.ReactNode;
  initialAssignments?: Assignment[];
  teamMembers?: TeamMember[];
  currentUserId?: string;
  config?: Partial<AssignmentManagerConfig>;
  onAssignmentCreate?: (assignment: Assignment) => void;
  onAssignmentUpdate?: (assignment: Assignment) => void;
  onAssignmentDelete?: (id: string) => void;
}

export const AssignmentManagerProvider: React.FC<AssignmentManagerProviderProps> = ({
  children,
  initialAssignments = [],
  teamMembers = [],
  currentUserId = 'current-user',
  config: configOverrides = {},
  onAssignmentCreate,
  onAssignmentUpdate,
  onAssignmentDelete,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<AssignmentPriority | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'workload'>('list');

  const config: AssignmentManagerConfig = {
    allowSelfAssignment: true,
    requireDueDate: true,
    notifyOnAssignment: true,
    maxAssignmentsPerMember: 10,
    ...configOverrides,
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterAssignee && a.assigneeId !== filterAssignee) return false;
      if (filterPriority && a.priority !== filterPriority) return false;
      return true;
    });
  }, [assignments, filterStatus, filterAssignee, filterPriority]);

  const getAssignmentsForMember = useCallback((memberId: string) => {
    return assignments.filter(a => a.assigneeId === memberId);
  }, [assignments]);

  const getMemberWorkload = useCallback((memberId: string) => {
    const memberAssignments = getAssignmentsForMember(memberId);
    const activeAssignments = memberAssignments.filter(
      a => ['pending', 'accepted', 'in_progress'].includes(a.status)
    );
    return Math.min(100, (activeAssignments.length / config.maxAssignmentsPerMember) * 100);
  }, [getAssignmentsForMember, config.maxAssignmentsPerMember]);

  const createAssignment = useCallback((data: Omit<Assignment, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => {
    const newAssignment: Assignment = {
      ...data,
      id: `assign-${Date.now()}`,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAssignments(prev => [...prev, newAssignment]);
    onAssignmentCreate?.(newAssignment);
  }, [onAssignmentCreate]);

  const updateAssignment = useCallback((id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...updates, updatedAt: new Date() };
        onAssignmentUpdate?.(updated);
        return updated;
      }
      return a;
    }));
  }, [onAssignmentUpdate]);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    if (selectedAssignment?.id === id) setSelectedAssignment(null);
    onAssignmentDelete?.(id);
  }, [selectedAssignment, onAssignmentDelete]);

  const acceptAssignment = useCallback((id: string) => {
    updateAssignment(id, { status: 'accepted' });
  }, [updateAssignment]);

  const declineAssignment = useCallback((id: string, reason?: string) => {
    updateAssignment(id, { status: 'declined', notes: reason });
  }, [updateAssignment]);

  const completeAssignment = useCallback((id: string) => {
    updateAssignment(id, { status: 'completed', progress: 100, completedAt: new Date() });
  }, [updateAssignment]);

  const reassign = useCallback((id: string, newAssigneeId: string) => {
    updateAssignment(id, { assigneeId: newAssigneeId, status: 'pending' });
  }, [updateAssignment]);

  const value: AssignmentManagerContextValue = {
    assignments: filteredAssignments,
    teamMembers,
    currentUserId,
    selectedAssignment,
    filterStatus,
    filterAssignee,
    filterPriority,
    viewMode,
    setSelectedAssignment,
    setFilterStatus,
    setFilterAssignee,
    setFilterPriority,
    setViewMode,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    acceptAssignment,
    declineAssignment,
    completeAssignment,
    reassign,
    getAssignmentsForMember,
    getMemberWorkload,
    config,
  };

  return (
    <AssignmentManagerContext.Provider value={value}>
      {children}
    </AssignmentManagerContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const AssignmentToolbar: React.FC = () => {
  const {
    viewMode, setViewMode,
    filterStatus, setFilterStatus,
    filterAssignee, setFilterAssignee,
    filterPriority, setFilterPriority,
    teamMembers,
    assignments,
  } = useAssignmentManager();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const views = ['list', 'board', 'workload'] as const;
  const statuses: (AssignmentStatus | 'all')[] = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'overdue'];
  const priorities: (AssignmentPriority | 'all')[] = ['all', 'low', 'normal', 'high', 'urgent'];

  return (
    <>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Assignments</h2>
          <span style={styles.badge}>{assignments.length} total</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={styles.viewTabs}>
            {views.map(view => (
              <button
                key={view}
                style={{
                  ...styles.viewTab,
                  ...(viewMode === view ? styles.viewTabActive : {}),
                }}
                onClick={() => setViewMode(view)}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
          <button style={styles.addButton} onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Assignment
          </button>
        </div>
      </div>

      <div style={styles.toolbar}>
        <select
          value={filterStatus || 'all'}
          onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : e.target.value as AssignmentStatus)}
          style={styles.filterSelect}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status.replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={filterAssignee || 'all'}
          onChange={(e) => setFilterAssignee(e.target.value === 'all' ? null : e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Assignees</option>
          {teamMembers.map(member => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>

        <select
          value={filterPriority || 'all'}
          onChange={(e) => setFilterPriority(e.target.value === 'all' ? null : e.target.value as AssignmentPriority)}
          style={styles.filterSelect}
        >
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priorities' : priority}
            </option>
          ))}
        </select>
      </div>

      {showCreateModal && (
        <CreateAssignmentModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};

export const AssignmentCard: React.FC<{
  assignment: Assignment;
  compact?: boolean;
  onClick?: () => void;
}> = ({ assignment, compact, onClick }) => {
  const { teamMembers, currentUserId, acceptAssignment, completeAssignment } = useAssignmentManager();
  const assignee = teamMembers.find(m => m.id === assignment.assigneeId);
  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
  const status = isOverdue && assignment.status !== 'completed' ? 'overdue' : assignment.status;
  const statusStyle = statusColors[status];
  const isAssignedToMe = assignment.assigneeId === currentUserId;

  if (compact) {
    return (
      <motion.div
        style={styles.boardCard}
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        layout
        drag
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ ...styles.priorityDot, backgroundColor: priorityColors[assignment.priority] }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1e293b' }}>
            {assignment.title}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {assignee && (
            <img src={assignee.avatar} alt={assignee.name} style={styles.avatar} />
          )}
          <span style={{ ...styles.dueDate, ...(isOverdue ? styles.dueDateOverdue : {}) }}>
            {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={styles.assignmentCard}
      onClick={onClick}
      whileHover={{ backgroundColor: '#f8fafc' }}
      layout
    >
      <div style={styles.cardLeft}>
        <div style={styles.cardTitle}>
          <div style={{ ...styles.priorityDot, backgroundColor: priorityColors[assignment.priority] }} />
          {assignment.title}
        </div>
        <div style={styles.cardMeta}>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {status.replace('_', ' ')}
          </span>
          <span>{assignment.type}</span>
          {assignment.estimatedHours && (
            <span>{assignment.estimatedHours}h estimated</span>
          )}
        </div>
        {isAssignedToMe && assignment.status === 'pending' && (
          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.actionButton, backgroundColor: '#dcfce7', color: '#166534' }}
              onClick={(e) => { e.stopPropagation(); acceptAssignment(assignment.id); }}
            >
              Accept
            </button>
            <button
              style={{ ...styles.actionButton, backgroundColor: '#fee2e2', color: '#dc2626' }}
              onClick={(e) => e.stopPropagation()}
            >
              Decline
            </button>
          </div>
        )}
        {isAssignedToMe && assignment.status === 'in_progress' && (
          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.actionButton, backgroundColor: '#dcfce7', color: '#166534' }}
              onClick={(e) => { e.stopPropagation(); completeAssignment(assignment.id); }}
            >
              Mark Complete
            </button>
          </div>
        )}
      </div>
      <div style={styles.cardRight}>
        {assignee && (
          <div style={styles.assigneeChip}>
            <img src={assignee.avatar} alt={assignee.name} style={styles.avatar} />
            <span style={{ fontSize: '0.75rem' }}>{assignee.name}</span>
          </div>
        )}
        <span style={{ ...styles.dueDate, ...(isOverdue ? styles.dueDateOverdue : {}) }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </motion.div>
  );
};

export const ListView: React.FC = () => {
  const { assignments, setSelectedAssignment } = useAssignmentManager();

  if (assignments.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No assignments found</p>
      </div>
    );
  }

  return (
    <div style={styles.listView}>
      {assignments.map(assignment => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onClick={() => setSelectedAssignment(assignment)}
        />
      ))}
    </div>
  );
};

export const BoardView: React.FC = () => {
  const { assignments, setSelectedAssignment } = useAssignmentManager();

  const columns: { status: AssignmentStatus; title: string }[] = [
    { status: 'pending', title: 'Pending' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'completed', title: 'Completed' },
  ];

  return (
    <div style={styles.boardView}>
      {columns.map(column => {
        const columnAssignments = assignments.filter(a => {
          if (column.status === 'pending') {
            return a.status === 'pending' || a.status === 'accepted';
          }
          return a.status === column.status;
        });

        return (
          <div key={column.status} style={styles.boardColumn}>
            <div style={styles.columnHeader}>
              <span style={styles.columnTitle}>{column.title}</span>
              <span style={styles.columnCount}>{columnAssignments.length}</span>
            </div>
            {columnAssignments.map(assignment => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                compact
                onClick={() => setSelectedAssignment(assignment)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const WorkloadView: React.FC = () => {
  const { teamMembers, getAssignmentsForMember, getMemberWorkload, setSelectedAssignment } = useAssignmentManager();

  const getWorkloadColor = (workload: number) => {
    if (workload < 50) return '#10b981';
    if (workload < 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={styles.workloadView}>
      {teamMembers.map(member => {
        const memberAssignments = getAssignmentsForMember(member.id);
        const activeAssignments = memberAssignments.filter(
          a => ['pending', 'accepted', 'in_progress'].includes(a.status)
        );
        const workload = getMemberWorkload(member.id);
        const availStyle = availabilityColors[member.availability];

        return (
          <div key={member.id} style={styles.memberCard}>
            <div style={styles.memberHeader}>
              <img src={member.avatar} alt={member.name} style={styles.avatarLarge} />
              <div style={styles.memberInfo}>
                <div style={styles.memberName}>{member.name}</div>
                <div style={styles.memberRole}>{member.role}</div>
              </div>
              <span
                style={{
                  ...styles.availabilityBadge,
                  backgroundColor: availStyle.bg,
                  color: availStyle.text,
                }}
              >
                {member.availability}
              </span>
            </div>
            <div style={styles.workloadBar}>
              <div style={styles.progressBarContainer}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${workload}%`,
                    backgroundColor: getWorkloadColor(workload),
                  }}
                />
              </div>
              <div style={styles.workloadLabel}>
                <span>Workload</span>
                <span>{Math.round(workload)}%</span>
              </div>
            </div>
            <div style={styles.memberAssignments}>
              {activeAssignments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem', padding: '1rem' }}>
                  No active assignments
                </div>
              ) : (
                activeAssignments.slice(0, 5).map(assignment => (
                  <div
                    key={assignment.id}
                    style={styles.miniAssignment}
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    <div style={{ ...styles.priorityDot, backgroundColor: priorityColors[assignment.priority] }} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {assignment.title}
                    </span>
                    <span style={styles.dueDate}>
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
              {activeAssignments.length > 5 && (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                  +{activeAssignments.length - 5} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const CreateAssignmentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { teamMembers, currentUserId, createAssignment } = useAssignmentManager();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'post' as ContentType,
    priority: 'normal' as AssignmentPriority,
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId || !formData.dueDate) return;

    createAssignment({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      assigneeId: formData.assigneeId,
      assignerId: currentUserId,
      dueDate: new Date(formData.dueDate),
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  const typeOptions: ContentType[] = ['post', 'page', 'review', 'edit', 'research', 'design', 'other'];
  const priorityOptions: AssignmentPriority[] = ['low', 'normal', 'high', 'urgent'];

  return (
    <div style={styles.modal} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Create Assignment</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={styles.input}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ContentType }))}
                  style={styles.select}
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as AssignmentPriority }))}
                  style={styles.select}
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To *</label>
              <div style={styles.memberSelectGrid}>
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    style={{
                      ...styles.memberSelectItem,
                      ...(formData.assigneeId === member.id ? styles.memberSelectItemActive : {}),
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, assigneeId: member.id }))}
                  >
                    <img src={member.avatar} alt={member.name} style={styles.avatar} />
                    <span style={{ fontSize: '0.8125rem' }}>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Hours</label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  style={styles.input}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={styles.textarea}
                placeholder="Describe the assignment..."
              />
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Create Assignment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AssignmentManager: React.FC = () => {
  const { viewMode } = useAssignmentManager();

  return (
    <div style={styles.container}>
      <AssignmentToolbar />
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ListView />
            </motion.div>
          )}
          {viewMode === 'board' && (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BoardView />
            </motion.div>
          )}
          {viewMode === 'workload' && (
            <motion.div key="workload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WorkloadView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssignmentManager;
