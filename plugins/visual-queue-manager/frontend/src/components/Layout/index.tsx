import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@store/index';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Page wrapper component for consistent page structure
interface PageWrapperProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, subtitle, action, children }: PageWrapperProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-white">{title}</h3>
      {description && <p className="text-slate-400 mt-1 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Error state component
interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
}

export function ErrorState({ title = 'Error', message, retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-danger-500/10 rounded-full flex items-center justify-center text-danger-500 mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="text-slate-400 mt-1 text-center max-w-sm">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 btn-secondary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
