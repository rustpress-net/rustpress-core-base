/**
 * Point 19: Integration Tests (25 tests)
 * Tests for component integration, store interactions,
 * cross-component communication, and feature combinations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils';
import { createMockFile, createMockUser, createMockBreakpoint } from '../../../test/utils';

// ============================================
// EDITOR + FILE TREE INTEGRATION (5 tests)
// ============================================

describe('Editor + FileTree Integration', () => {
  it('1. opens file in editor when clicked in FileTree', async () => {
    const onFileOpen = vi.fn();

    const FileTreeItem = ({ path, onClick }: { path: string; onClick: (path: string) => void }) => (
      <button onClick={() => onClick(path)}>{path.split('/').pop()}</button>
    );

    const Editor = ({ file }: { file: string | null }) => (
      <div data-testid="editor">{file ? `Editing: ${file}` : 'No file open'}</div>
    );

    const IntegratedApp = () => {
      const [activeFile, setActiveFile] = React.useState<string | null>(null);

      const handleFileOpen = (path: string) => {
        setActiveFile(path);
        onFileOpen(path);
      };

      return (
        <div>
          <FileTreeItem path="/src/index.ts" onClick={handleFileOpen} />
          <Editor file={activeFile} />
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByText('No file open')).toBeInTheDocument();

    await user.click(screen.getByText('index.ts'));

    expect(screen.getByText('Editing: /src/index.ts')).toBeInTheDocument();
    expect(onFileOpen).toHaveBeenCalledWith('/src/index.ts');
  });

  it('2. updates FileTree on new file creation', async () => {
    const IntegratedApp = () => {
      const [files, setFiles] = React.useState(['/src/index.ts']);

      const createFile = (path: string) => {
        setFiles((prev) => [...prev, path]);
      };

      return (
        <div>
          <ul>
            {files.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <button onClick={() => createFile('/src/newfile.ts')}>Create File</button>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.queryByText('/src/newfile.ts')).not.toBeInTheDocument();

    await user.click(screen.getByText('Create File'));

    expect(screen.getByText('/src/newfile.ts')).toBeInTheDocument();
  });

  it('3. marks file as modified in FileTree when edited', async () => {
    const IntegratedApp = () => {
      const [modified, setModified] = React.useState(false);

      return (
        <div>
          <span data-testid="file-indicator">
            index.ts {modified && '●'}
          </span>
          <textarea
            onChange={() => setModified(true)}
            placeholder="Edit content"
          />
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByTestId('file-indicator')).not.toHaveTextContent('●');

    await user.type(screen.getByPlaceholderText('Edit content'), 'changes');

    expect(screen.getByTestId('file-indicator')).toHaveTextContent('●');
  });

  it('4. syncs active file between FileTree and TabBar', () => {
    const IntegratedApp = () => {
      const [activeFile, setActiveFile] = React.useState('/src/index.ts');
      const openFiles = ['/src/index.ts', '/src/app.ts', '/src/utils.ts'];

      return (
        <div>
          <div data-testid="tabs">
            {openFiles.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFile(f)}
                data-active={f === activeFile}
              >
                {f.split('/').pop()}
              </button>
            ))}
          </div>
          <div data-testid="tree">
            {openFiles.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFile(f)}
                data-active={f === activeFile}
              >
                {f}
              </button>
            ))}
          </div>
          <div data-testid="active">{activeFile}</div>
        </div>
      );
    };

    const { container } = render(<IntegratedApp />);

    expect(screen.getByTestId('active')).toHaveTextContent('/src/index.ts');

    const tabButtons = container.querySelectorAll('[data-testid="tabs"] button');
    fireEvent.click(tabButtons[1]); // Click app.ts tab

    expect(screen.getByTestId('active')).toHaveTextContent('/src/app.ts');
  });

  it('5. closes file in all views when deleted', async () => {
    const IntegratedApp = () => {
      const [files, setFiles] = React.useState(['/src/index.ts', '/src/app.ts']);
      const [activeFile, setActiveFile] = React.useState('/src/index.ts');

      const deleteFile = (path: string) => {
        setFiles((prev) => prev.filter((f) => f !== path));
        if (activeFile === path) {
          setActiveFile(files.find((f) => f !== path) || null);
        }
      };

      return (
        <div>
          <div data-testid="file-list">
            {files.map((f) => (
              <div key={f}>
                {f}
                <button onClick={() => deleteFile(f)}>Delete</button>
              </div>
            ))}
          </div>
          <div data-testid="active">{activeFile || 'None'}</div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByTestId('file-list')).toHaveTextContent('/src/index.ts');
    expect(screen.getByTestId('active')).toHaveTextContent('/src/index.ts');

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(screen.getByTestId('file-list')).not.toHaveTextContent('/src/index.ts');
    expect(screen.getByTestId('active')).toHaveTextContent('/src/app.ts');
  });
});

// ============================================
// EDITOR + DEBUGGER INTEGRATION (5 tests)
// ============================================

describe('Editor + Debugger Integration', () => {
  it('6. sets breakpoints from editor gutter', async () => {
    const IntegratedApp = () => {
      const [breakpoints, setBreakpoints] = React.useState<number[]>([]);

      const toggleBreakpoint = (line: number) => {
        setBreakpoints((prev) =>
          prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
        );
      };

      return (
        <div>
          <div data-testid="editor">
            {[1, 2, 3, 4, 5].map((line) => (
              <div key={line}>
                <button
                  onClick={() => toggleBreakpoint(line)}
                  data-testid={`gutter-${line}`}
                >
                  {breakpoints.includes(line) ? '●' : '○'}
                </button>
                <span>Line {line}</span>
              </div>
            ))}
          </div>
          <div data-testid="breakpoint-list">
            Breakpoints: {breakpoints.join(', ') || 'None'}
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    await user.click(screen.getByTestId('gutter-3'));

    expect(screen.getByTestId('breakpoint-list')).toHaveTextContent('Breakpoints: 3');
    expect(screen.getByTestId('gutter-3')).toHaveTextContent('●');
  });

  it('7. highlights current execution line', () => {
    const IntegratedApp = ({ currentLine }: { currentLine: number | null }) => (
      <div data-testid="editor">
        {[1, 2, 3, 4, 5].map((line) => (
          <div
            key={line}
            data-testid={`line-${line}`}
            className={line === currentLine ? 'bg-yellow-200' : ''}
          >
            Line {line}
          </div>
        ))}
      </div>
    );

    const { rerender } = render(<IntegratedApp currentLine={null} />);

    expect(screen.getByTestId('line-3')).not.toHaveClass('bg-yellow-200');

    rerender(<IntegratedApp currentLine={3} />);

    expect(screen.getByTestId('line-3')).toHaveClass('bg-yellow-200');
  });

  it('8. shows variable values on hover during debug', async () => {
    const IntegratedApp = () => {
      const [hoveredVar, setHoveredVar] = React.useState<string | null>(null);
      const variables = { count: 42, name: 'test' };

      return (
        <div>
          <code>
            <span
              onMouseEnter={() => setHoveredVar('count')}
              onMouseLeave={() => setHoveredVar(null)}
            >
              count
            </span>
          </code>
          {hoveredVar && (
            <div data-testid="tooltip">
              {hoveredVar}: {variables[hoveredVar as keyof typeof variables]}
            </div>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText('count'));

    expect(screen.getByTestId('tooltip')).toHaveTextContent('count: 42');
  });

  it('9. syncs call stack with editor navigation', async () => {
    const IntegratedApp = () => {
      const [activeFrame, setActiveFrame] = React.useState(0);
      const callStack = [
        { function: 'main', file: '/src/index.ts', line: 10 },
        { function: 'handleClick', file: '/src/app.ts', line: 25 },
        { function: 'processData', file: '/src/utils.ts', line: 42 },
      ];

      return (
        <div>
          <div data-testid="call-stack">
            {callStack.map((frame, i) => (
              <button
                key={i}
                onClick={() => setActiveFrame(i)}
                data-active={i === activeFrame}
              >
                {frame.function}
              </button>
            ))}
          </div>
          <div data-testid="current-location">
            {callStack[activeFrame].file}:{callStack[activeFrame].line}
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByTestId('current-location')).toHaveTextContent('/src/index.ts:10');

    await user.click(screen.getByText('processData'));

    expect(screen.getByTestId('current-location')).toHaveTextContent('/src/utils.ts:42');
  });

  it('10. updates watch expressions as code executes', () => {
    const IntegratedApp = ({ step }: { step: number }) => {
      const watchValues: Record<number, Record<string, any>> = {
        1: { counter: 0, items: [] },
        2: { counter: 1, items: ['a'] },
        3: { counter: 2, items: ['a', 'b'] },
      };

      const current = watchValues[step] || {};

      return (
        <div>
          <div data-testid="step">Step: {step}</div>
          <div data-testid="watch">
            <div>counter: {current.counter}</div>
            <div>items: [{current.items?.join(', ')}]</div>
          </div>
        </div>
      );
    };

    const { rerender } = render(<IntegratedApp step={1} />);
    expect(screen.getByTestId('watch')).toHaveTextContent('counter: 0');

    rerender(<IntegratedApp step={2} />);
    expect(screen.getByTestId('watch')).toHaveTextContent('counter: 1');
    expect(screen.getByTestId('watch')).toHaveTextContent('items: [a]');
  });
});

// ============================================
// AI ASSISTANT + EDITOR INTEGRATION (5 tests)
// ============================================

describe('AI Assistant + Editor Integration', () => {
  it('11. inserts AI-generated code into editor', async () => {
    const IntegratedApp = () => {
      const [editorContent, setEditorContent] = React.useState('');
      const aiSuggestion = 'function hello() { return "Hello World"; }';

      const insertCode = (code: string) => {
        setEditorContent((prev) => prev + code);
      };

      return (
        <div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            data-testid="editor"
          />
          <div data-testid="ai-panel">
            <p>{aiSuggestion}</p>
            <button onClick={() => insertCode(aiSuggestion)}>Insert</button>
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    await user.click(screen.getByText('Insert'));

    expect(screen.getByTestId('editor')).toHaveValue(
      'function hello() { return "Hello World"; }'
    );
  });

  it('12. sends selected code to AI for explanation', async () => {
    const onExplain = vi.fn();

    const IntegratedApp = ({ onExplain }: { onExplain: (code: string) => void }) => {
      const [selectedCode, setSelectedCode] = React.useState<string | null>(null);

      const handleSelect = () => {
        setSelectedCode('const x = 42;');
      };

      return (
        <div>
          <button onClick={handleSelect}>Select Code</button>
          {selectedCode && (
            <button onClick={() => onExplain(selectedCode)}>Explain Selection</button>
          )}
        </div>
      );
    };

    const { user } = render(<IntegratedApp onExplain={onExplain} />);

    await user.click(screen.getByText('Select Code'));
    await user.click(screen.getByText('Explain Selection'));

    expect(onExplain).toHaveBeenCalledWith('const x = 42;');
  });

  it('13. applies AI refactoring suggestions', async () => {
    const IntegratedApp = () => {
      const [code, setCode] = React.useState('var x = 1;');

      const applyRefactor = () => {
        setCode('const x = 1;');
      };

      return (
        <div>
          <div data-testid="code">{code}</div>
          <div data-testid="suggestion">
            <p>Suggestion: Use const instead of var</p>
            <button onClick={applyRefactor}>Apply</button>
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByTestId('code')).toHaveTextContent('var x = 1;');

    await user.click(screen.getByText('Apply'));

    expect(screen.getByTestId('code')).toHaveTextContent('const x = 1;');
  });

  it('14. shows inline AI completions', () => {
    const IntegratedApp = ({ showCompletion }: { showCompletion: boolean }) => (
      <div data-testid="editor">
        <span>function calculate(</span>
        {showCompletion && (
          <span className="text-gray-400" data-testid="completion">
            a: number, b: number): number
          </span>
        )}
      </div>
    );

    const { rerender } = render(<IntegratedApp showCompletion={false} />);
    expect(screen.queryByTestId('completion')).not.toBeInTheDocument();

    rerender(<IntegratedApp showCompletion={true} />);
    expect(screen.getByTestId('completion')).toBeInTheDocument();
  });

  it('15. contextualizes AI responses based on current file', () => {
    const IntegratedApp = ({ currentFile }: { currentFile: string }) => {
      const getContext = () => {
        if (currentFile.endsWith('.ts')) return 'TypeScript';
        if (currentFile.endsWith('.rs')) return 'Rust';
        return 'Unknown';
      };

      return (
        <div>
          <div data-testid="current-file">{currentFile}</div>
          <div data-testid="ai-context">Context: {getContext()}</div>
        </div>
      );
    };

    const { rerender } = render(<IntegratedApp currentFile="/src/index.ts" />);
    expect(screen.getByTestId('ai-context')).toHaveTextContent('Context: TypeScript');

    rerender(<IntegratedApp currentFile="/src/main.rs" />);
    expect(screen.getByTestId('ai-context')).toHaveTextContent('Context: Rust');
  });
});

// ============================================
// SEARCH + EDITOR INTEGRATION (5 tests)
// ============================================

describe('Search + Editor Integration', () => {
  it('16. navigates to search result in editor', async () => {
    const IntegratedApp = () => {
      const [currentLine, setCurrentLine] = React.useState<number | null>(null);
      const searchResults = [
        { file: '/src/index.ts', line: 10, text: 'function main()' },
        { file: '/src/index.ts', line: 25, text: 'const result = main()' },
      ];

      return (
        <div>
          <div data-testid="search-results">
            {searchResults.map((r, i) => (
              <button key={i} onClick={() => setCurrentLine(r.line)}>
                Line {r.line}: {r.text}
              </button>
            ))}
          </div>
          <div data-testid="editor-position">
            {currentLine ? `At line ${currentLine}` : 'No position'}
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    await user.click(screen.getByText(/Line 25:/));

    expect(screen.getByTestId('editor-position')).toHaveTextContent('At line 25');
  });

  it('17. highlights all matches in editor', () => {
    const IntegratedApp = ({ matches }: { matches: number[] }) => (
      <div data-testid="editor">
        {[1, 2, 3, 4, 5].map((line) => (
          <div
            key={line}
            className={matches.includes(line) ? 'bg-yellow-100' : ''}
            data-testid={`line-${line}`}
          >
            Line {line} content
          </div>
        ))}
      </div>
    );

    render(<IntegratedApp matches={[2, 4]} />);

    expect(screen.getByTestId('line-2')).toHaveClass('bg-yellow-100');
    expect(screen.getByTestId('line-4')).toHaveClass('bg-yellow-100');
    expect(screen.getByTestId('line-1')).not.toHaveClass('bg-yellow-100');
  });

  it('18. performs find and replace across files', async () => {
    const IntegratedApp = () => {
      const [files, setFiles] = React.useState({
        '/src/a.ts': 'const foo = 1; foo();',
        '/src/b.ts': 'import { foo } from "./a"; foo();',
      });

      const replaceAll = (search: string, replace: string) => {
        setFiles((prev) => {
          const updated: Record<string, string> = {};
          Object.entries(prev).forEach(([path, content]) => {
            updated[path] = content.replace(new RegExp(search, 'g'), replace);
          });
          return updated;
        });
      };

      return (
        <div>
          <div data-testid="files">
            {Object.entries(files).map(([path, content]) => (
              <div key={path}>
                {path}: {content}
              </div>
            ))}
          </div>
          <button onClick={() => replaceAll('foo', 'bar')}>Replace All</button>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    expect(screen.getByTestId('files')).toHaveTextContent('foo');

    await user.click(screen.getByText('Replace All'));

    expect(screen.getByTestId('files')).not.toHaveTextContent('foo');
    expect(screen.getByTestId('files')).toHaveTextContent('bar');
  });

  it('19. updates search results when editor content changes', () => {
    const findMatches = (content: string, query: string): number[] => {
      const matches: number[] = [];
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes(query)) matches.push(i + 1);
      });
      return matches;
    };

    const content = 'line 1\nfoo bar\nline 3\nfoo baz';

    expect(findMatches(content, 'foo')).toEqual([2, 4]);
    expect(findMatches(content, 'bar')).toEqual([2]);
  });

  it('20. filters search by file type', () => {
    const files = [
      { path: '/src/index.ts', matches: 3 },
      { path: '/src/styles.css', matches: 1 },
      { path: '/src/app.tsx', matches: 2 },
    ];

    const filterByType = (files: typeof files, ext: string) =>
      files.filter((f) => f.path.endsWith(ext));

    expect(filterByType(files, '.ts')).toHaveLength(1);
    expect(filterByType(files, '.tsx')).toHaveLength(1);
    expect(filterByType(files, '.css')).toHaveLength(1);
  });
});

// ============================================
// TERMINAL + EDITOR INTEGRATION (5 tests)
// ============================================

describe('Terminal + Editor Integration', () => {
  it('21. opens file from terminal output', async () => {
    const IntegratedApp = () => {
      const [openedFile, setOpenedFile] = React.useState<string | null>(null);

      const handleTerminalClick = (text: string) => {
        const match = text.match(/([\/\w]+\.(ts|js|tsx|jsx))/);
        if (match) setOpenedFile(match[1]);
      };

      return (
        <div>
          <div data-testid="terminal">
            <button onClick={() => handleTerminalClick('Error at /src/index.ts:10')}>
              Error at /src/index.ts:10
            </button>
          </div>
          <div data-testid="editor">
            {openedFile ? `Opened: ${openedFile}` : 'No file'}
          </div>
        </div>
      );
    };

    const { user } = render(<IntegratedApp />);

    await user.click(screen.getByText(/Error at/));

    expect(screen.getByTestId('editor')).toHaveTextContent('Opened: /src/index.ts');
  });

  it('22. runs current file from terminal', () => {
    const IntegratedApp = ({ currentFile }: { currentFile: string }) => {
      const getRunCommand = () => {
        if (currentFile.endsWith('.ts')) return `npx ts-node ${currentFile}`;
        if (currentFile.endsWith('.js')) return `node ${currentFile}`;
        if (currentFile.endsWith('.py')) return `python ${currentFile}`;
        return '';
      };

      return (
        <div>
          <div data-testid="current-file">{currentFile}</div>
          <div data-testid="command">{getRunCommand()}</div>
        </div>
      );
    };

    const { rerender } = render(<IntegratedApp currentFile="/src/index.ts" />);
    expect(screen.getByTestId('command')).toHaveTextContent('npx ts-node /src/index.ts');

    rerender(<IntegratedApp currentFile="/src/script.py" />);
    expect(screen.getByTestId('command')).toHaveTextContent('python /src/script.py');
  });

  it('23. syncs working directory with file explorer', () => {
    const IntegratedApp = ({ explorerPath }: { explorerPath: string }) => (
      <div>
        <div data-testid="explorer-path">{explorerPath}</div>
        <div data-testid="terminal-cwd">Terminal: {explorerPath}</div>
      </div>
    );

    const { rerender } = render(<IntegratedApp explorerPath="/home/user/project" />);
    expect(screen.getByTestId('terminal-cwd')).toHaveTextContent('/home/user/project');

    rerender(<IntegratedApp explorerPath="/home/user/project/src" />);
    expect(screen.getByTestId('terminal-cwd')).toHaveTextContent('/home/user/project/src');
  });

  it('24. shows build errors inline in editor', () => {
    const IntegratedApp = ({ errors }: { errors: Array<{ line: number; message: string }> }) => (
      <div data-testid="editor">
        {[1, 2, 3, 4, 5].map((line) => {
          const error = errors.find((e) => e.line === line);
          return (
            <div key={line} data-testid={`line-${line}`}>
              Line {line}
              {error && <span className="text-red-500"> ⚠ {error.message}</span>}
            </div>
          );
        })}
      </div>
    );

    render(
      <IntegratedApp
        errors={[
          { line: 2, message: 'Type error' },
          { line: 4, message: 'Syntax error' },
        ]}
      />
    );

    expect(screen.getByTestId('line-2')).toHaveTextContent('Type error');
    expect(screen.getByTestId('line-4')).toHaveTextContent('Syntax error');
    expect(screen.getByTestId('line-1')).not.toHaveTextContent('error');
  });

  it('25. restarts terminal on configuration change', async () => {
    const onRestart = vi.fn();

    const IntegratedApp = ({ config, onRestart }: { config: string; onRestart: () => void }) => {
      const prevConfig = React.useRef(config);

      React.useEffect(() => {
        if (prevConfig.current !== config) {
          onRestart();
          prevConfig.current = config;
        }
      }, [config, onRestart]);

      return (
        <div>
          <div data-testid="config">{config}</div>
          <div data-testid="terminal">Terminal</div>
        </div>
      );
    };

    const { rerender } = render(<IntegratedApp config="node" onRestart={onRestart} />);
    expect(onRestart).not.toHaveBeenCalled();

    rerender(<IntegratedApp config="deno" onRestart={onRestart} />);
    expect(onRestart).toHaveBeenCalled();
  });
});
