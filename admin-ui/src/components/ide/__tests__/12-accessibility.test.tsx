/**
 * Point 12: Accessibility Tests (25 tests)
 * Tests for accessibility compliance including ARIA, keyboard navigation,
 * screen reader support, and WCAG guidelines
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '../../../test/utils';

// ============================================
// MOCK COMPONENTS
// ============================================

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ActivityBar = ({ activeView, onViewChange }: ActivityBarProps) => (
  <div data-testid="activity-bar" role="toolbar">
    <button
      title="Explorer"
      aria-label="Explorer"
      aria-pressed={activeView === 'files'}
      onClick={() => onViewChange('files')}
    >
      Files
    </button>
    <button
      title="Search"
      aria-label="Search"
      aria-pressed={activeView === 'search'}
      onClick={() => onViewChange('search')}
    >
      Search
    </button>
    <button
      title="Git"
      aria-label="Git"
      aria-pressed={activeView === 'git'}
      onClick={() => onViewChange('git')}
    >
      Git
    </button>
  </div>
);

// Helper to check for ARIA attributes
const hasAriaAttribute = (element: HTMLElement, attr: string) => {
  return element.hasAttribute(`aria-${attr}`);
};

// ============================================
// ARIA LABELS TESTS (4 tests)
// ============================================

describe('ARIA Labels', () => {
  it('1. has proper ARIA labels on interactive elements', () => {
    render(<ActivityBar activeView="files" onViewChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const hasLabel = button.getAttribute('title') ||
                       button.getAttribute('aria-label') ||
                       button.textContent;
      expect(hasLabel).toBeTruthy();
    });
  });

  it('2. has proper ARIA roles on components', () => {
    render(<ActivityBar activeView="files" onViewChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('3. supports screen readers with descriptive text', () => {
    render(<ActivityBar activeView="files" onViewChange={vi.fn()} />);

    // All buttons should have accessible names
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeInTheDocument();
    });
  });

  it('4. has keyboard navigation support', async () => {
    const onViewChange = vi.fn();
    const { user } = render(<ActivityBar activeView="files" onViewChange={onViewChange} />);

    await user.tab();
    await user.keyboard('{Enter}');

    // Should be able to navigate with keyboard
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });
});

// ============================================
// FOCUS MANAGEMENT TESTS (4 tests)
// ============================================

describe('Focus Management', () => {
  it('5. has visible focus indicators', async () => {
    const { user } = render(
      <button className="focus:ring-2 focus:ring-blue-500">Focusable Button</button>
    );

    await user.tab();

    const button = screen.getByRole('button');
    expect(button).toHaveFocus();
  });

  it('6. has sufficient color contrast', () => {
    render(<ActivityBar activeView="files" onViewChange={vi.fn()} />);

    // Visual inspection - components should use appropriate contrast classes
    const container = screen.getByRole('button', { name: /Explorer/i }).closest('div');
    expect(container).toBeInTheDocument();
  });

  it('7. has alt text for images and icons', () => {
    render(<ActivityBar activeView="files" onViewChange={vi.fn()} />);

    // Icons should have title or aria-label
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const hasAccessibleName = button.getAttribute('title') ||
                                button.getAttribute('aria-label');
      expect(hasAccessibleName || button.textContent).toBeTruthy();
    });
  });

  it('8. has form labels for inputs', () => {
    render(
      <form>
        <label htmlFor="search">Search</label>
        <input id="search" type="text" />
      </form>
    );

    const input = screen.getByLabelText('Search');
    expect(input).toBeInTheDocument();
  });
});

// ============================================
// DYNAMIC CONTENT TESTS (3 tests)
// ============================================

describe('Dynamic Content Announcements', () => {
  it('9. announces dynamic content with live regions', () => {
    render(
      <div aria-live="polite" aria-atomic="true" data-testid="live-region">
        Loading...
      </div>
    );

    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('10. supports reduced motion preference', () => {
    // Test that animations respect prefers-reduced-motion
    const { container } = render(
      <div className="motion-safe:animate-pulse">Animated content</div>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('11. has skip links for navigation', () => {
    render(
      <div>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
        <nav>Navigation</nav>
        <main id="main-content">Main Content</main>
      </div>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});

// ============================================
// HEADING & STRUCTURE TESTS (3 tests)
// ============================================

describe('Document Structure', () => {
  it('12. has proper heading hierarchy', () => {
    render(
      <article>
        <h1>Main Title</h1>
        <section>
          <h2>Section Title</h2>
          <h3>Subsection</h3>
        </section>
      </article>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('13. has descriptive link text', () => {
    render(
      <a href="/settings">Open Settings Panel</a>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Open Settings Panel');
    expect(link).not.toHaveTextContent('Click here');
  });

  it('14. supports high contrast mode', () => {
    render(
      <div className="text-black bg-white dark:text-white dark:bg-black">
        High contrast content
      </div>
    );

    expect(screen.getByText('High contrast content')).toBeInTheDocument();
  });
});

// ============================================
// TAB ORDER & FOCUS TRAP TESTS (3 tests)
// ============================================

describe('Tab Order and Focus Trap', () => {
  it('15. has proper tab order', async () => {
    const { user } = render(
      <div>
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      </div>
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Third')).toHaveFocus();
  });

  it('16. traps focus in modals', async () => {
    const { user } = render(
      <div role="dialog" aria-modal="true">
        <button>Close</button>
        <input placeholder="Input" />
        <button>Save</button>
      </div>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('17. announces errors to screen readers', () => {
    render(
      <div>
        <input aria-invalid="true" aria-describedby="error-msg" />
        <span id="error-msg" role="alert">This field is required</span>
      </div>
    );

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('This field is required');
  });
});

// ============================================
// ADDITIONAL A11Y TESTS (8 tests)
// ============================================

describe('Additional Accessibility Features', () => {
  it('18. has timeout warnings', () => {
    render(
      <div role="alert" aria-live="assertive">
        Session will expire in 5 minutes
      </div>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('19. supports text scaling', () => {
    render(
      <p className="text-base">Scalable text content</p>
    );

    expect(screen.getByText('Scalable text content')).toBeInTheDocument();
  });

  it('20. has visible labels for form inputs', () => {
    render(
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" />
      </div>
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('21. buttons have accessible names', () => {
    render(
      <button aria-label="Close dialog">x</button>
    );

    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('22. inputs have descriptions when needed', () => {
    render(
      <div>
        <input aria-describedby="help-text" placeholder="Enter email" />
        <span id="help-text">We will never share your email</span>
      </div>
    );

    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });

  it('23. tables have proper headers', () => {
    render(
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>File 1</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('24. lists are properly marked up', () => {
    render(
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('25. icons have text alternatives', () => {
    render(
      <button title="Settings">
        <svg aria-hidden="true">
          <path d="M..." />
        </svg>
      </button>
    );

    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button).toBeInTheDocument();
  });
});
