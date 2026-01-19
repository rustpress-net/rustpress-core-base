/**
 * Point 5: Debugging Features Tests (25 tests)
 * Tests for debugging UI components including BreakpointsPanel,
 * CallStackPanel, VariablesPanel, WatchExpressions, DebugConsole, and CallHierarchy
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface Breakpoint {
  id: string;
  file: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
}

interface Variable {
  name: string;
  value: string;
  type: string;
}

interface WatchExpression {
  id: string;
  expression: string;
  value: string;
  type: string;
}

interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: number;
}

interface HierarchyItem {
  name: string;
  file: string;
  line: number;
}

interface CallHierarchyData {
  item: HierarchyItem;
  incoming: HierarchyItem[];
  outgoing: HierarchyItem[];
}

// ============================================
// MOCK COMPONENTS
// ============================================

interface BreakpointsPanelProps {
  breakpoints: Breakpoint[];
  onAddBreakpoint: () => void;
  onRemoveBreakpoint: (id: string) => void;
  onToggleBreakpoint: (id: string) => void;
  onEditCondition: (id: string) => void;
  onNavigate: (breakpoint: Breakpoint) => void;
}

const BreakpointsPanel: React.FC<BreakpointsPanelProps> = ({
  breakpoints,
  onAddBreakpoint,
  onRemoveBreakpoint,
  onToggleBreakpoint,
  onEditCondition,
}) => (
  <div data-testid="breakpoints-panel">
    <h3>Breakpoints</h3>
    <button title="Add breakpoint" onClick={onAddBreakpoint}>+</button>
    {breakpoints.map((bp) => (
      <div key={bp.id} className="breakpoint-item">
        <input
          type="checkbox"
          checked={bp.enabled}
          onChange={() => onToggleBreakpoint(bp.id)}
        />
        <span>{bp.file.split('/').pop()} line {bp.line}</span>
        {bp.condition && <span className="condition">{bp.condition}</span>}
        <button title="Edit condition" onClick={() => onEditCondition(bp.id)}>Edit</button>
        <button title="Remove breakpoint" onClick={() => onRemoveBreakpoint(bp.id)}>x</button>
      </div>
    ))}
  </div>
);

interface CallStackPanelProps {
  frames: StackFrame[];
  activeFrameId: string;
  onSelectFrame: (id: string) => void;
}

const CallStackPanel: React.FC<CallStackPanelProps> = ({
  frames,
  activeFrameId,
  onSelectFrame,
}) => (
  <div data-testid="call-stack-panel">
    <h3>Call Stack</h3>
    {frames.map((frame) => (
      <div
        key={frame.id}
        className={frame.id === activeFrameId ? 'active bg-blue-100' : ''}
        onClick={() => onSelectFrame(frame.id)}
      >
        <span>{frame.name}</span>
        <span className="file">{frame.file}:{frame.line}</span>
      </div>
    ))}
  </div>
);

interface VariablesPanelProps {
  variables: Variable[];
  onExpandVariable: (name: string) => void;
  onEditVariable: (name: string, value: string) => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({
  variables,
  onExpandVariable,
  onEditVariable,
}) => (
  <div data-testid="variables-panel">
    <h3>Variables</h3>
    {variables.map((variable, i) => (
      <div key={i} className="variable-item">
        <button onClick={() => onExpandVariable(variable.name)}>{variable.name}</button>
        <span onDoubleClick={() => onEditVariable(variable.name, variable.value)}>
          {variable.value}
        </span>
        <span className="type">{variable.type}</span>
      </div>
    ))}
  </div>
);

interface WatchExpressionsProps {
  expressions: WatchExpression[];
  onAddExpression: () => void;
  onRemoveExpression: (id: string) => void;
  onEditExpression: (id: string) => void;
}

const WatchExpressions: React.FC<WatchExpressionsProps> = ({
  expressions,
  onAddExpression,
  onRemoveExpression,
}) => (
  <div data-testid="watch-expressions">
    <h3>Watch</h3>
    <button title="Add expression" onClick={onAddExpression}>+</button>
    {expressions.map((expr) => (
      <div key={expr.id} className="expression-item">
        <span>{expr.expression}</span>
        <span className="value">{expr.value}</span>
        <button title="Remove expression" onClick={() => onRemoveExpression(expr.id)}>x</button>
      </div>
    ))}
  </div>
);

interface DebugConsoleProps {
  logs: LogEntry[];
  onExecute: (command: string) => void;
  onClear: () => void;
}

const DebugConsole: React.FC<DebugConsoleProps> = ({ logs, onExecute, onClear }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onExecute(input);
      setInput('');
    }
  };

  return (
    <div data-testid="debug-console">
      <h3>Debug Console</h3>
      <button title="Clear console" onClick={onClear}>Clear</button>
      <div className="logs">
        {logs.map((log) => (
          <div key={log.id} className={`log-${log.type}`}>
            {log.type === 'error' ? 'Error: ' : log.type === 'warn' ? 'Warning: ' : ''}
            {log.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Evaluate expression..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
    </div>
  );
};

interface CallHierarchyProps {
  hierarchy: CallHierarchyData;
  onSelectItem: (item: HierarchyItem) => void;
}

const CallHierarchy: React.FC<CallHierarchyProps> = ({ hierarchy, onSelectItem }) => (
  <div data-testid="call-hierarchy">
    <h3>Call Hierarchy</h3>
    <div className="current-item">
      <strong>{hierarchy.item.name}</strong>
    </div>
    <div className="incoming">
      <h4>Incoming Calls</h4>
      {hierarchy.incoming.map((item, i) => (
        <div key={i} onClick={() => onSelectItem(item)}>
          {item.name}
        </div>
      ))}
    </div>
    <div className="outgoing">
      <h4>Outgoing Calls</h4>
      {hierarchy.outgoing.map((item, i) => (
        <div key={i} onClick={() => onSelectItem(item)}>
          {item.name}
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// TEST DATA HELPERS
// ============================================

const createMockBreakpoint = (overrides: Partial<Breakpoint> = {}): Breakpoint => ({
  id: 'bp-1',
  file: '/src/index.ts',
  line: 10,
  enabled: true,
  ...overrides,
});

const createMockStackFrame = (overrides: Partial<StackFrame> = {}): StackFrame => ({
  id: 'frame-1',
  name: 'main',
  file: '/src/index.ts',
  line: 10,
  ...overrides,
});

const createMockVariable = (overrides: Partial<Variable> = {}): Variable => ({
  name: 'count',
  value: '42',
  type: 'number',
  ...overrides,
});

// ============================================
// BREAKPOINTS PANEL TESTS (6 tests)
// ============================================

describe('BreakpointsPanel', () => {
  const breakpoints = [
    createMockBreakpoint({ id: 'bp-1', file: '/src/index.ts', line: 10, enabled: true }),
    createMockBreakpoint({ id: 'bp-2', file: '/src/utils.ts', line: 25, enabled: false }),
  ];

  const defaultProps = {
    breakpoints,
    onAddBreakpoint: vi.fn(),
    onRemoveBreakpoint: vi.fn(),
    onToggleBreakpoint: vi.fn(),
    onEditCondition: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders BreakpointsPanel with breakpoints list', () => {
    render(<BreakpointsPanel {...defaultProps} />);

    expect(screen.getByText(/Breakpoints/i)).toBeInTheDocument();
    expect(screen.getByText(/index\.ts.*line 10/i)).toBeInTheDocument();
  });

  it('2. adds breakpoint via add button', async () => {
    const onAddBreakpoint = vi.fn();
    const { user } = render(<BreakpointsPanel {...defaultProps} onAddBreakpoint={onAddBreakpoint} />);

    const addButton = screen.getByTitle(/add/i);
    await user.click(addButton);

    expect(onAddBreakpoint).toHaveBeenCalled();
  });

  it('3. removes breakpoint on delete action', async () => {
    const onRemoveBreakpoint = vi.fn();
    const { user } = render(<BreakpointsPanel {...defaultProps} onRemoveBreakpoint={onRemoveBreakpoint} />);

    const removeButtons = screen.getAllByTitle(/remove/i);
    await user.click(removeButtons[0]);

    expect(onRemoveBreakpoint).toHaveBeenCalledWith('bp-1');
  });

  it('4. toggles breakpoint enabled state', async () => {
    const onToggleBreakpoint = vi.fn();
    const { user } = render(<BreakpointsPanel {...defaultProps} onToggleBreakpoint={onToggleBreakpoint} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    await user.click(checkbox);

    expect(onToggleBreakpoint).toHaveBeenCalledWith('bp-1');
  });

  it('5. shows conditional breakpoint indicator', () => {
    const conditionalBreakpoints = [
      createMockBreakpoint({ id: 'bp-1', condition: 'x > 5' }),
    ];
    render(<BreakpointsPanel {...defaultProps} breakpoints={conditionalBreakpoints} />);

    expect(screen.getByText(/x > 5/)).toBeInTheDocument();
  });

  it('6. edits breakpoint condition', async () => {
    const onEditCondition = vi.fn();
    const { user } = render(<BreakpointsPanel {...defaultProps} onEditCondition={onEditCondition} />);

    const editButtons = screen.getAllByTitle(/edit/i);
    await user.click(editButtons[0]);

    expect(onEditCondition).toHaveBeenCalled();
  });
});

// ============================================
// CALL STACK PANEL TESTS (4 tests)
// ============================================

describe('CallStackPanel', () => {
  const frames = [
    createMockStackFrame({ id: 'frame-1', name: 'onClick', file: '/src/Button.tsx', line: 15 }),
    createMockStackFrame({ id: 'frame-2', name: 'handleSubmit', file: '/src/Form.tsx', line: 42 }),
    createMockStackFrame({ id: 'frame-3', name: 'main', file: '/src/index.ts', line: 5 }),
  ];

  const defaultProps = {
    frames,
    activeFrameId: 'frame-1',
    onSelectFrame: vi.fn(),
  };

  it('7. renders CallStackPanel with stack frames', () => {
    render(<CallStackPanel {...defaultProps} />);

    expect(screen.getByText(/Call Stack/i)).toBeInTheDocument();
    expect(screen.getByText(/onClick/i)).toBeInTheDocument();
  });

  it('8. displays all stack frames', () => {
    render(<CallStackPanel {...defaultProps} />);

    expect(screen.getByText(/onClick/)).toBeInTheDocument();
    expect(screen.getByText(/handleSubmit/)).toBeInTheDocument();
    expect(screen.getByText(/main/)).toBeInTheDocument();
  });

  it('9. navigates to frame on click', async () => {
    const onSelectFrame = vi.fn();
    const { user } = render(<CallStackPanel {...defaultProps} onSelectFrame={onSelectFrame} />);

    await user.click(screen.getByText(/handleSubmit/));

    expect(onSelectFrame).toHaveBeenCalledWith('frame-2');
  });

  it('10. highlights current/active frame', () => {
    render(<CallStackPanel {...defaultProps} />);

    const activeFrame = screen.getByText(/onClick/).closest('div');
    expect(activeFrame).toHaveClass('active');
  });
});

// ============================================
// VARIABLES PANEL TESTS (4 tests)
// ============================================

describe('VariablesPanel', () => {
  const variables = [
    createMockVariable({ name: 'count', value: '42', type: 'number' }),
    createMockVariable({ name: 'user', value: '{...}', type: 'object' }),
    createMockVariable({ name: 'items', value: '[...]', type: 'array' }),
  ];

  const defaultProps = {
    variables,
    onExpandVariable: vi.fn(),
    onEditVariable: vi.fn(),
  };

  it('11. renders VariablesPanel with variables', () => {
    render(<VariablesPanel {...defaultProps} />);

    expect(screen.getByText(/Variables/i)).toBeInTheDocument();
    expect(screen.getByText(/count/)).toBeInTheDocument();
  });

  it('12. displays variable values', () => {
    render(<VariablesPanel {...defaultProps} />);

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('13. expands nested objects on click', async () => {
    const onExpandVariable = vi.fn();
    const { user } = render(<VariablesPanel {...defaultProps} onExpandVariable={onExpandVariable} />);

    const userVar = screen.getByText(/user/);
    await user.click(userVar);

    expect(onExpandVariable).toHaveBeenCalledWith('user');
  });

  it('14. edits variable value inline', async () => {
    const onEditVariable = vi.fn();
    const { user } = render(<VariablesPanel {...defaultProps} onEditVariable={onEditVariable} />);

    const valueElement = screen.getByText(/42/);
    await user.dblClick(valueElement);

    expect(onEditVariable).toHaveBeenCalled();
  });
});

// ============================================
// WATCH EXPRESSIONS TESTS (4 tests)
// ============================================

describe('WatchExpressions', () => {
  const expressions: WatchExpression[] = [
    { id: 'w-1', expression: 'user.name', value: '"John"', type: 'string' },
    { id: 'w-2', expression: 'items.length', value: '5', type: 'number' },
  ];

  const defaultProps = {
    expressions,
    onAddExpression: vi.fn(),
    onRemoveExpression: vi.fn(),
    onEditExpression: vi.fn(),
  };

  it('15. renders WatchExpressions panel', () => {
    render(<WatchExpressions {...defaultProps} />);

    expect(screen.getByText(/Watch/i)).toBeInTheDocument();
  });

  it('16. adds new watch expression', async () => {
    const onAddExpression = vi.fn();
    const { user } = render(<WatchExpressions {...defaultProps} onAddExpression={onAddExpression} />);

    const addButton = screen.getByTitle(/add/i);
    await user.click(addButton);

    expect(onAddExpression).toHaveBeenCalled();
  });

  it('17. removes watch expression', async () => {
    const onRemoveExpression = vi.fn();
    const { user } = render(<WatchExpressions {...defaultProps} onRemoveExpression={onRemoveExpression} />);

    const removeButtons = screen.getAllByTitle(/remove/i);
    await user.click(removeButtons[0]);

    expect(onRemoveExpression).toHaveBeenCalledWith('w-1');
  });

  it('18. evaluates and displays expression result', () => {
    render(<WatchExpressions {...defaultProps} />);

    expect(screen.getByText(/user\.name/)).toBeInTheDocument();
    expect(screen.getByText(/"John"/)).toBeInTheDocument();
  });
});

// ============================================
// DEBUG CONSOLE TESTS (4 tests)
// ============================================

describe('DebugConsole', () => {
  const logs: LogEntry[] = [
    { id: 'log-1', type: 'log', message: 'Application started', timestamp: Date.now() },
    { id: 'log-2', type: 'error', message: 'Something went wrong', timestamp: Date.now() },
    { id: 'log-3', type: 'warn', message: 'Deprecated API', timestamp: Date.now() },
  ];

  const defaultProps = {
    logs,
    onExecute: vi.fn(),
    onClear: vi.fn(),
  };

  it('19. renders DebugConsole', () => {
    render(<DebugConsole {...defaultProps} />);

    expect(screen.getByText(/Console|Debug/i)).toBeInTheDocument();
  });

  it('20. executes console commands', async () => {
    const onExecute = vi.fn();
    const { user } = render(<DebugConsole {...defaultProps} onExecute={onExecute} />);

    const input = screen.getByPlaceholderText(/evaluate|expression/i);
    await user.type(input, 'console.log("test")');
    await user.keyboard('{Enter}');

    expect(onExecute).toHaveBeenCalledWith('console.log("test")');
  });

  it('21. displays console output with different types', () => {
    render(<DebugConsole {...defaultProps} />);

    expect(screen.getByText(/Application started/)).toBeInTheDocument();
    expect(screen.getByText(/Error.*Something went wrong/i)).toBeInTheDocument();
  });

  it('22. clears console on clear button', async () => {
    const onClear = vi.fn();
    const { user } = render(<DebugConsole {...defaultProps} onClear={onClear} />);

    const clearButton = screen.getByTitle(/clear/i);
    await user.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });
});

// ============================================
// CALL HIERARCHY TESTS (3 tests)
// ============================================

describe('CallHierarchy', () => {
  const hierarchy: CallHierarchyData = {
    item: { name: 'processData', file: '/src/utils.ts', line: 50 },
    incoming: [
      { name: 'handleSubmit', file: '/src/Form.tsx', line: 30 },
      { name: 'validate', file: '/src/validators.ts', line: 15 },
    ],
    outgoing: [
      { name: 'transformData', file: '/src/transform.ts', line: 10 },
      { name: 'saveToDb', file: '/src/db.ts', line: 25 },
    ],
  };

  const defaultProps = {
    hierarchy,
    onSelectItem: vi.fn(),
  };

  it('23. renders CallHierarchy panel', () => {
    render(<CallHierarchy {...defaultProps} />);

    expect(screen.getByText('Call Hierarchy')).toBeInTheDocument();
    expect(screen.getByText('processData')).toBeInTheDocument();
  });

  it('24. shows incoming calls', () => {
    render(<CallHierarchy {...defaultProps} />);

    expect(screen.getByText(/handleSubmit/)).toBeInTheDocument();
    expect(screen.getByText(/validate/)).toBeInTheDocument();
  });

  it('25. shows outgoing calls', () => {
    render(<CallHierarchy {...defaultProps} />);

    expect(screen.getByText(/transformData/)).toBeInTheDocument();
    expect(screen.getByText(/saveToDb/)).toBeInTheDocument();
  });
});
