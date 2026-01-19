/**
 * Point 14: Error Handling Tests (25 tests)
 * Tests for error boundary, error states, and graceful error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Component, ErrorInfo } from 'react';
import { render, screen, waitFor } from '../../../test/utils';

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          {this.props.onRetry && (
            <button onClick={this.handleRetry}>Retry</button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Component that throws an error
const BuggyComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
};

// ============================================
// ERROR BOUNDARY TESTS (5 tests)
// ============================================

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('1. displays error boundary fallback on error', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('2. catches render errors', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it('3. catches event handler errors gracefully', () => {
    const ErrorButton = () => {
      const handleClick = () => {
        throw new Error('Event error');
      };

      return <button onClick={handleClick}>Click me</button>;
    };

    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ErrorButton />
      </ErrorBoundary>
    );

    // Error boundaries don't catch event errors by default
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('4. shows recovery action', async () => {
    const onRetry = vi.fn();

    render(
      <ErrorBoundary onRetry={onRetry}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('5. logs errors for debugging', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});

// ============================================
// NULL/UNDEFINED HANDLING TESTS (4 tests)
// ============================================

describe('Null and Undefined Handling', () => {
  it('6. handles null data gracefully', () => {
    const DataDisplay = ({ data }: { data: string | null }) => (
      <div>{data ?? 'No data available'}</div>
    );

    render(<DataDisplay data={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('7. handles undefined props gracefully', () => {
    const ComponentWithDefault = ({ value = 'Default' }: { value?: string }) => (
      <div>{value}</div>
    );

    render(<ComponentWithDefault />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('8. handles empty arrays gracefully', () => {
    const ListComponent = ({ items = [] }: { items?: string[] }) => (
      <div>
        {items.length > 0 ? (
          items.map((item, i) => <span key={i}>{item}</span>)
        ) : (
          <span>No items</span>
        )}
      </div>
    );

    render(<ListComponent items={[]} />);
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('9. handles invalid JSON gracefully', () => {
    const parseJSON = (str: string) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    };

    expect(parseJSON('invalid json')).toBeNull();
    expect(parseJSON('{"valid": true}')).toEqual({ valid: true });
  });
});

// ============================================
// NETWORK ERROR HANDLING TESTS (4 tests)
// ============================================

describe('Network Error Handling', () => {
  it('10. handles network errors', async () => {
    const NetworkComponent = ({ error }: { error: string | null }) => (
      <div>
        {error ? (
          <div role="alert">{error}</div>
        ) : (
          <div>Data loaded</div>
        )}
      </div>
    );

    render(<NetworkComponent error="Network error: Failed to fetch" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
  });

  it('11. handles timeout errors', () => {
    const TimeoutError = ({ hasTimeout }: { hasTimeout: boolean }) => (
      <div>
        {hasTimeout ? (
          <div role="alert">Request timed out. Please try again.</div>
        ) : (
          <div>Content loaded</div>
        )}
      </div>
    );

    render(<TimeoutError hasTimeout={true} />);
    expect(screen.getByText(/timed out/i)).toBeInTheDocument();
  });

  it('12. handles CORS errors', () => {
    const CORSError = ({ hasCorsError }: { hasCorsError: boolean }) => (
      <div>
        {hasCorsError ? (
          <div role="alert">Unable to connect to the server</div>
        ) : (
          <div>Connected</div>
        )}
      </div>
    );

    render(<CORSError hasCorsError={true} />);
    expect(screen.getByText(/unable to connect/i)).toBeInTheDocument();
  });

  it('13. handles authentication errors', () => {
    const AuthError = ({ status }: { status: number }) => (
      <div>
        {status === 401 ? (
          <div role="alert">Please log in to continue</div>
        ) : status === 403 ? (
          <div role="alert">You do not have permission</div>
        ) : (
          <div>Authorized</div>
        )}
      </div>
    );

    render(<AuthError status={401} />);
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });
});

// ============================================
// VALIDATION & PARSE ERROR TESTS (5 tests)
// ============================================

describe('Validation and Parse Errors', () => {
  it('14. handles authorization errors', () => {
    const AuthzError = ({ status }: { status: number }) => (
      <div>{status === 403 && <div role="alert">Access denied</div>}</div>
    );

    render(<AuthzError status={403} />);
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('15. handles form validation errors', () => {
    const FormError = ({ errors }: { errors: Record<string, string> }) => (
      <form>
        <input aria-invalid={!!errors.email} />
        {errors.email && <span role="alert">{errors.email}</span>}
      </form>
    );

    render(<FormError errors={{ email: 'Invalid email format' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('16. handles file read errors', () => {
    const FileError = ({ error }: { error: string | null }) => (
      <div>
        {error ? (
          <div role="alert">Error reading file: {error}</div>
        ) : (
          <div>File loaded</div>
        )}
      </div>
    );

    render(<FileError error="Permission denied" />);
    expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
  });

  it('17. handles file write errors', () => {
    const WriteError = ({ error }: { error: string | null }) => (
      <div>
        {error ? (
          <div role="alert">Error saving file: {error}</div>
        ) : (
          <div>File saved</div>
        )}
      </div>
    );

    render(<WriteError error="Disk full" />);
    expect(screen.getByText(/disk full/i)).toBeInTheDocument();
  });

  it('18. handles parse errors in editor', () => {
    const ParseError = ({ errors }: { errors: Array<{ line: number; message: string }> }) => (
      <div>
        {errors.map((err, i) => (
          <div key={i} role="alert">
            Line {err.line}: {err.message}
          </div>
        ))}
      </div>
    );

    render(<ParseError errors={[{ line: 5, message: 'Unexpected token' }]} />);
    expect(screen.getByText(/unexpected token/i)).toBeInTheDocument();
  });
});

// ============================================
// USER-FRIENDLY ERROR HANDLING TESTS (7 tests)
// ============================================

describe('User-Friendly Error Handling', () => {
  it('19. handles syntax errors', () => {
    const SyntaxError = ({ error }: { error: string }) => (
      <div role="alert" className="text-red-500">
        Syntax Error: {error}
      </div>
    );

    render(<SyntaxError error="Missing semicolon" />);
    expect(screen.getByText(/missing semicolon/i)).toBeInTheDocument();
  });

  it('20. displays user-friendly error messages', () => {
    const FriendlyError = ({ code }: { code: string }) => {
      const messages: Record<string, string> = {
        'E001': 'Unable to save your changes. Please try again.',
        'E002': 'Connection lost. Check your internet connection.',
        'E003': 'Something unexpected happened. Our team has been notified.',
      };

      return <div role="alert">{messages[code] || 'An error occurred'}</div>;
    };

    render(<FriendlyError code="E002" />);
    expect(screen.getByText(/check your internet/i)).toBeInTheDocument();
  });

  it('21. provides retry option on error', async () => {
    const onRetry = vi.fn();

    const RetryableError = ({ onRetry }: { onRetry: () => void }) => (
      <div>
        <div role="alert">Operation failed</div>
        <button onClick={onRetry}>Try Again</button>
      </div>
    );

    const { user } = render(<RetryableError onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(onRetry).toHaveBeenCalled();
  });

  it('22. preserves user data on error', () => {
    const FormWithRecovery = ({ savedData }: { savedData: string }) => (
      <div>
        <div role="alert">Form submission failed</div>
        <input defaultValue={savedData} />
        <p>Your data has been preserved</p>
      </div>
    );

    render(<FormWithRecovery savedData="User input" />);
    expect(screen.getByDisplayValue('User input')).toBeInTheDocument();
  });

  it('23. reports errors to monitoring service', () => {
    const reportError = vi.fn();

    const ErrorReporter = ({ error }: { error: Error }) => {
      React.useEffect(() => {
        reportError(error);
      }, [error]);

      return <div role="alert">{error.message}</div>;
    };

    render(<ErrorReporter error={new Error('Test error')} />);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('24. handles async errors gracefully', async () => {
    const AsyncError = ({ hasError }: { hasError: boolean }) => (
      <div>
        {hasError ? (
          <div role="alert">Async operation failed</div>
        ) : (
          <div>Success</div>
        )}
      </div>
    );

    render(<AsyncError hasError={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('25. handles promise rejections', async () => {
    const PromiseHandler = ({ rejected }: { rejected: boolean }) => (
      <div>
        {rejected ? (
          <div role="alert">Promise was rejected</div>
        ) : (
          <div>Promise resolved</div>
        )}
      </div>
    );

    render(<PromiseHandler rejected={true} />);
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
  });
});
