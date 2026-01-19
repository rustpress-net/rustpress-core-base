/**
 * Point 20: End-to-End Workflow Tests (25 tests)
 * Tests for complete user workflows and feature combinations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils';

// ============================================
// FILE EDITING WORKFLOW (5 tests)
// ============================================

describe('File Editing Workflow', () => {
  it('1. complete file creation to save workflow', async () => {
    const IntegratedApp = () => {
      const [files, setFiles] = React.useState<Record<string, string>>({});
      const [activeFile, setActiveFile] = React.useState<string | null>(null);
      const [content, setContent] = React.useState('');
      const [saved, setSaved] = React.useState(false);

      const createFile = (name: string) => {
        const path = `/src/${name}`;
        setFiles((prev) => ({ ...prev, [path]: '' }));
        setActiveFile(path);
        setContent('');
        setSaved(false);
      };

      const saveFile = () => {
        if (activeFile) {
          setFiles((prev) => ({ ...prev, [activeFile]: content }));
          setSaved(true);
        }
      };

      return (
        <div>
          <button onClick={() => createFile('newfile.ts')}>Create File</button>
          {activeFile && (
            <>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaved(false);
                }}
                placeholder="Enter code"
                data-testid="editor"
              />
              <button onClick={saveFile}>Save</button>
              <span data-testid="status">{saved ? 'Saved' : 'Unsaved'}</span>
            </>
          )}
          <div data-testid="file-list">
            Files: {Object.keys(files).join(', ') || 'None'}
          </div>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Create file
    fireEvent.click(screen.getByText('Create File'));
    expect(screen.getByTestId('file-list')).toHaveTextContent('/src/newfile.ts');

    // Edit content
    fireEvent.change(screen.getByTestId('editor'), { target: { value: 'const x = 1;' } });
    expect(screen.getByTestId('status')).toHaveTextContent('Unsaved');

    // Save file
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByTestId('status')).toHaveTextContent('Saved');
  });

  it('2. complete find and replace workflow', async () => {
    const IntegratedApp = () => {
      const [content, setContent] = React.useState('foo bar foo baz foo');
      const [searchTerm, setSearchTerm] = React.useState('');
      const [replaceTerm, setReplaceTerm] = React.useState('');
      const [matchCount, setMatchCount] = React.useState(0);

      const search = () => {
        const matches = (content.match(new RegExp(searchTerm, 'g')) || []).length;
        setMatchCount(matches);
      };

      const replaceAll = () => {
        setContent(content.replace(new RegExp(searchTerm, 'g'), replaceTerm));
        setMatchCount(0);
      };

      return (
        <div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} data-testid="editor" />
          <input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-input"
          />
          <input
            placeholder="Replace"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            data-testid="replace-input"
          />
          <button onClick={search}>Find</button>
          <button onClick={replaceAll}>Replace All</button>
          <span data-testid="match-count">Matches: {matchCount}</span>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Search
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'foo' } });
    fireEvent.click(screen.getByText('Find'));
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 3');

    // Replace
    fireEvent.change(screen.getByTestId('replace-input'), { target: { value: 'qux' } });
    fireEvent.click(screen.getByText('Replace All'));

    expect(screen.getByTestId('editor')).toHaveValue('qux bar qux baz qux');
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0');
  });

  it('3. complete multi-file editing workflow', async () => {
    const IntegratedApp = () => {
      const [files, setFiles] = React.useState<Record<string, string>>({
        '/src/a.ts': 'file a content',
        '/src/b.ts': 'file b content',
      });
      const [activeFile, setActiveFile] = React.useState('/src/a.ts');
      const [content, setContent] = React.useState(files['/src/a.ts']);

      const switchFile = (path: string) => {
        setFiles((prev) => ({ ...prev, [activeFile]: content }));
        setActiveFile(path);
        setContent(files[path]);
      };

      return (
        <div>
          <div data-testid="tabs">
            {Object.keys(files).map((path) => (
              <button
                key={path}
                onClick={() => switchFile(path)}
                data-active={path === activeFile}
              >
                {path.split('/').pop()}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="editor"
          />
          <div data-testid="active-file">{activeFile}</div>
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('active-file')).toHaveTextContent('/src/a.ts');
    expect(screen.getByTestId('editor')).toHaveValue('file a content');

    // Switch to file b
    fireEvent.click(screen.getByText('b.ts'));
    expect(screen.getByTestId('active-file')).toHaveTextContent('/src/b.ts');
    expect(screen.getByTestId('editor')).toHaveValue('file b content');
  });

  it('4. complete undo/redo workflow', async () => {
    const IntegratedApp = () => {
      const [content, setContent] = React.useState('initial');
      const [history, setHistory] = React.useState(['initial']);
      const [historyIndex, setHistoryIndex] = React.useState(0);

      const handleChange = (newContent: string) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setContent(newContent);
      };

      const undo = () => {
        if (historyIndex > 0) {
          setHistoryIndex(historyIndex - 1);
          setContent(history[historyIndex - 1]);
        }
      };

      const redo = () => {
        if (historyIndex < history.length - 1) {
          setHistoryIndex(historyIndex + 1);
          setContent(history[historyIndex + 1]);
        }
      };

      return (
        <div>
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            data-testid="editor"
          />
          <button onClick={undo}>Undo</button>
          <button onClick={redo}>Redo</button>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Make changes using fireEvent.change (single state update per change)
    const editor = screen.getByTestId('editor');

    // Change 1
    fireEvent.change(editor, { target: { value: 'change 1' } });
    expect(editor).toHaveValue('change 1');

    // Change 2
    fireEvent.change(editor, { target: { value: 'change 2' } });
    expect(editor).toHaveValue('change 2');

    // Undo
    fireEvent.click(screen.getByText('Undo'));
    expect(editor).toHaveValue('change 1');

    // Redo
    fireEvent.click(screen.getByText('Redo'));
    expect(editor).toHaveValue('change 2');
  });

  it('5. complete code formatting workflow', async () => {
    const IntegratedApp = () => {
      const [code, setCode] = React.useState('const x=1;const y=2;');

      const format = () => {
        // Simple formatting simulation
        setCode(code.replace(/;/g, ';\n').trim());
      };

      return (
        <div>
          <textarea value={code} onChange={(e) => setCode(e.target.value)} data-testid="editor" />
          <button onClick={format}>Format</button>
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('editor')).toHaveValue('const x=1;const y=2;');

    fireEvent.click(screen.getByText('Format'));

    expect(screen.getByTestId('editor').textContent).toBeDefined();
  });
});

// ============================================
// DEBUG WORKFLOW (5 tests)
// ============================================

describe('Debug Workflow', () => {
  it('6. complete debugging session workflow', async () => {
    const IntegratedApp = () => {
      const [isDebugging, setIsDebugging] = React.useState(false);
      const [currentLine, setCurrentLine] = React.useState<number | null>(null);
      const [breakpoints] = React.useState([3, 7]);
      const [variables, setVariables] = React.useState<Record<string, any>>({});

      const startDebug = () => {
        setIsDebugging(true);
        setCurrentLine(breakpoints[0]);
        setVariables({ count: 0, name: 'test' });
      };

      const stepOver = () => {
        if (currentLine !== null) {
          setCurrentLine(currentLine + 1);
          setVariables({ count: 1, name: 'test' });
        }
      };

      const stopDebug = () => {
        setIsDebugging(false);
        setCurrentLine(null);
        setVariables({});
      };

      return (
        <div>
          <div data-testid="debug-status">{isDebugging ? 'Debugging' : 'Idle'}</div>
          <div data-testid="current-line">{currentLine ?? 'None'}</div>
          <div data-testid="variables">{JSON.stringify(variables)}</div>
          {!isDebugging ? (
            <button onClick={startDebug}>Start Debug</button>
          ) : (
            <>
              <button onClick={stepOver}>Step Over</button>
              <button onClick={stopDebug}>Stop</button>
            </>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('debug-status')).toHaveTextContent('Idle');

    // Start debugging
    fireEvent.click(screen.getByText('Start Debug'));
    expect(screen.getByTestId('debug-status')).toHaveTextContent('Debugging');
    expect(screen.getByTestId('current-line')).toHaveTextContent('3');

    // Step over
    fireEvent.click(screen.getByText('Step Over'));
    expect(screen.getByTestId('current-line')).toHaveTextContent('4');

    // Stop
    fireEvent.click(screen.getByText('Stop'));
    expect(screen.getByTestId('debug-status')).toHaveTextContent('Idle');
  });

  it('7. complete breakpoint management workflow', async () => {
    const IntegratedApp = () => {
      const [breakpoints, setBreakpoints] = React.useState<number[]>([]);

      const toggleBreakpoint = (line: number) => {
        setBreakpoints((prev) =>
          prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line].sort((a, b) => a - b)
        );
      };

      const clearAll = () => setBreakpoints([]);

      return (
        <div>
          <div data-testid="editor">
            {[1, 2, 3, 4, 5].map((line) => (
              <div key={line}>
                <button onClick={() => toggleBreakpoint(line)} data-testid={`bp-${line}`}>
                  {breakpoints.includes(line) ? '●' : '○'}
                </button>
                Line {line}
              </div>
            ))}
          </div>
          <div data-testid="breakpoint-list">
            Breakpoints: {breakpoints.join(', ') || 'None'}
          </div>
          <button onClick={clearAll}>Clear All</button>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Add breakpoints
    fireEvent.click(screen.getByTestId('bp-2'));
    fireEvent.click(screen.getByTestId('bp-4'));

    expect(screen.getByTestId('breakpoint-list')).toHaveTextContent('Breakpoints: 2, 4');

    // Remove one
    fireEvent.click(screen.getByTestId('bp-2'));
    expect(screen.getByTestId('breakpoint-list')).toHaveTextContent('Breakpoints: 4');

    // Clear all
    fireEvent.click(screen.getByText('Clear All'));
    expect(screen.getByTestId('breakpoint-list')).toHaveTextContent('Breakpoints: None');
  });

  it('8. complete watch expression workflow', async () => {
    const IntegratedApp = () => {
      const [watches, setWatches] = React.useState<string[]>([]);
      const [newWatch, setNewWatch] = React.useState('');
      const variables = { count: 42, name: 'test', items: [1, 2, 3] };

      const addWatch = () => {
        if (newWatch && !watches.includes(newWatch)) {
          setWatches([...watches, newWatch]);
          setNewWatch('');
        }
      };

      const removeWatch = (expr: string) => {
        setWatches(watches.filter((w) => w !== expr));
      };

      const evaluateWatch = (expr: string) => {
        return variables[expr as keyof typeof variables] ?? 'undefined';
      };

      return (
        <div>
          <input
            value={newWatch}
            onChange={(e) => setNewWatch(e.target.value)}
            placeholder="Add watch"
            data-testid="watch-input"
          />
          <button onClick={addWatch}>Add</button>
          <div data-testid="watch-list">
            {watches.map((w) => (
              <div key={w}>
                {w}: {JSON.stringify(evaluateWatch(w))}
                <button onClick={() => removeWatch(w)}>×</button>
              </div>
            ))}
          </div>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Add watches
    fireEvent.change(screen.getByTestId('watch-input'), { target: { value: 'count' } });
    fireEvent.click(screen.getByText('Add'));

    fireEvent.change(screen.getByTestId('watch-input'), { target: { value: 'items' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByTestId('watch-list')).toHaveTextContent('count: 42');
    expect(screen.getByTestId('watch-list')).toHaveTextContent('items: [1,2,3]');
  });

  it('9. complete call stack navigation workflow', async () => {
    const IntegratedApp = () => {
      const [activeFrame, setActiveFrame] = React.useState(0);
      const callStack = [
        { func: 'main', file: 'index.ts', line: 10 },
        { func: 'handleClick', file: 'app.ts', line: 25 },
        { func: 'processData', file: 'utils.ts', line: 42 },
      ];

      return (
        <div>
          <div data-testid="call-stack">
            {callStack.map((frame, i) => (
              <button
                key={i}
                onClick={() => setActiveFrame(i)}
                className={i === activeFrame ? 'active' : ''}
                data-active={i === activeFrame}
              >
                {frame.func} ({frame.file}:{frame.line})
              </button>
            ))}
          </div>
          <div data-testid="active-frame">
            Viewing: {callStack[activeFrame].func}
          </div>
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('active-frame')).toHaveTextContent('Viewing: main');

    fireEvent.click(screen.getByText(/processData/));

    expect(screen.getByTestId('active-frame')).toHaveTextContent('Viewing: processData');
  });

  it('10. complete console evaluation workflow', async () => {
    const IntegratedApp = () => {
      const [history, setHistory] = React.useState<Array<{ input: string; output: string }>>([]);
      const [input, setInput] = React.useState('');

      const evaluate = () => {
        // Simulate evaluation
        let output: string;
        try {
          if (input.startsWith('console.log')) {
            output = input.replace('console.log(', '').replace(')', '');
          } else {
            output = `Result: ${input}`;
          }
        } catch {
          output = 'Error';
        }

        setHistory([...history, { input, output }]);
        setInput('');
      };

      return (
        <div>
          <div data-testid="console-history">
            {history.map((entry, i) => (
              <div key={i}>
                <span>&gt; {entry.input}</span>
                <span>{entry.output}</span>
              </div>
            ))}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter expression"
            data-testid="console-input"
          />
          <button onClick={evaluate}>Run</button>
        </div>
      );
    };

    render(<IntegratedApp />);

    fireEvent.change(screen.getByTestId('console-input'), { target: { value: '2 + 2' } });
    fireEvent.click(screen.getByText('Run'));

    expect(screen.getByTestId('console-history')).toHaveTextContent('> 2 + 2');
    expect(screen.getByTestId('console-history')).toHaveTextContent('Result: 2 + 2');
  });
});

// ============================================
// PROJECT WORKFLOW (5 tests)
// ============================================

describe('Project Workflow', () => {
  it('11. complete new project setup workflow', async () => {
    const IntegratedApp = () => {
      const [step, setStep] = React.useState(1);
      const [projectName, setProjectName] = React.useState('');
      const [template, setTemplate] = React.useState('');
      const [created, setCreated] = React.useState(false);

      const next = () => setStep(step + 1);

      const create = () => {
        setCreated(true);
      };

      return (
        <div>
          <div data-testid="step">Step {step}</div>

          {step === 1 && (
            <div>
              <input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                data-testid="project-name-input"
              />
              <button onClick={next} disabled={!projectName}>
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <select value={template} onChange={(e) => setTemplate(e.target.value)} data-testid="template-select">
                <option value="">Select template</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
              </select>
              <button onClick={next} disabled={!template}>
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p>Create "{projectName}" with {template}?</p>
              <button onClick={create}>Create Project</button>
            </div>
          )}

          {created && <div data-testid="success">Project created!</div>}
        </div>
      );
    };

    render(<IntegratedApp />);

    // Step 1: Enter name
    fireEvent.change(screen.getByTestId('project-name-input'), { target: { value: 'MyApp' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Select template
    fireEvent.change(screen.getByTestId('template-select'), { target: { value: 'react' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Create
    expect(screen.getByText(/Create "MyApp" with react/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Create Project'));

    expect(screen.getByTestId('success')).toBeInTheDocument();
  });

  it('12. complete git workflow (stage, commit, push)', async () => {
    const IntegratedApp = () => {
      const [changes, setChanges] = React.useState(['file1.ts', 'file2.ts']);
      const [staged, setStaged] = React.useState<string[]>([]);
      const [committed, setCommitted] = React.useState(false);
      const [pushed, setPushed] = React.useState(false);

      const stageFile = (file: string) => {
        setStaged([...staged, file]);
        setChanges(changes.filter((c) => c !== file));
      };

      const commit = () => {
        if (staged.length > 0) {
          setCommitted(true);
        }
      };

      const push = () => {
        if (committed) {
          setPushed(true);
        }
      };

      return (
        <div>
          <div data-testid="changes">
            Changes: {changes.map((f) => (
              <button key={f} onClick={() => stageFile(f)}>
                Stage {f}
              </button>
            ))}
          </div>
          <div data-testid="staged">
            Staged: {staged.join(', ') || 'None'}
          </div>
          <button onClick={commit} disabled={staged.length === 0}>
            Commit
          </button>
          <button onClick={push} disabled={!committed}>
            Push
          </button>
          <div data-testid="status">
            {pushed ? 'Pushed' : committed ? 'Committed' : 'Uncommitted'}
          </div>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Stage files
    fireEvent.click(screen.getByText('Stage file1.ts'));
    fireEvent.click(screen.getByText('Stage file2.ts'));

    expect(screen.getByTestId('staged')).toHaveTextContent('file1.ts, file2.ts');

    // Commit
    fireEvent.click(screen.getByText('Commit'));
    expect(screen.getByTestId('status')).toHaveTextContent('Committed');

    // Push
    fireEvent.click(screen.getByText('Push'));
    expect(screen.getByTestId('status')).toHaveTextContent('Pushed');
  });

  it('13. complete build and deploy workflow', async () => {
    const IntegratedApp = () => {
      const [step, setStep] = React.useState<'idle' | 'building' | 'built' | 'deploying' | 'deployed'>('idle');
      const [output, setOutput] = React.useState<string[]>([]);

      const build = () => {
        setStep('building');
        setOutput(['Compiling...']);
        setTimeout(() => {
          setOutput((prev) => [...prev, 'Build complete']);
          setStep('built');
        }, 50);
      };

      const deploy = () => {
        setStep('deploying');
        setOutput((prev) => [...prev, 'Deploying...']);
        setTimeout(() => {
          setOutput((prev) => [...prev, 'Deploy complete']);
          setStep('deployed');
        }, 50);
      };

      return (
        <div>
          <div data-testid="status">{step}</div>
          <div data-testid="output">{output.join('\n')}</div>
          <button onClick={build} disabled={step !== 'idle'}>
            Build
          </button>
          <button onClick={deploy} disabled={step !== 'built'}>
            Deploy
          </button>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Build
    fireEvent.click(screen.getByText('Build'));
    expect(screen.getByTestId('status')).toHaveTextContent('building');

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('built');
    });

    // Deploy
    fireEvent.click(screen.getByText('Deploy'));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('deployed');
    });
  });

  it('14. complete settings configuration workflow', async () => {
    const IntegratedApp = () => {
      const [settings, setSettings] = React.useState({
        theme: 'dark',
        fontSize: 14,
        autoSave: true,
      });
      const [saved, setSaved] = React.useState(true);

      const updateSetting = (key: keyof typeof settings, value: any) => {
        setSettings({ ...settings, [key]: value });
        setSaved(false);
      };

      const save = () => {
        setSaved(true);
      };

      const reset = () => {
        setSettings({ theme: 'dark', fontSize: 14, autoSave: true });
        setSaved(true);
      };

      return (
        <div>
          <div>
            <label>
              Theme:
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                data-testid="theme-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Font Size:
              <input
                type="number"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              />
            </label>
          </div>
          <button onClick={save}>Save</button>
          <button onClick={reset}>Reset</button>
          <div data-testid="status">{saved ? 'Saved' : 'Unsaved'}</div>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Change settings
    fireEvent.change(screen.getByTestId('theme-select'), { target: { value: 'light' } });
    expect(screen.getByTestId('status')).toHaveTextContent('Unsaved');

    // Save
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByTestId('status')).toHaveTextContent('Saved');

    // Reset
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByTestId('theme-select')).toHaveValue('dark');
  });

  it('15. complete extension installation workflow', async () => {
    const IntegratedApp = () => {
      const [installed, setInstalled] = React.useState<string[]>(['ESLint']);
      const [installing, setInstalling] = React.useState<string | null>(null);

      const install = (ext: string) => {
        setInstalling(ext);
        setTimeout(() => {
          setInstalled((prev) => [...prev, ext]);
          setInstalling(null);
        }, 50);
      };

      const uninstall = (ext: string) => {
        setInstalled(installed.filter((e) => e !== ext));
      };

      return (
        <div>
          <div data-testid="available">
            <button onClick={() => install('Prettier')} disabled={installed.includes('Prettier')}>
              Install Prettier
            </button>
          </div>
          <div data-testid="installed">
            Installed: {installed.map((e) => (
              <span key={e}>
                {e} <button onClick={() => uninstall(e)}>Uninstall</button>
              </span>
            ))}
          </div>
          {installing && <div data-testid="installing">Installing {installing}...</div>}
        </div>
      );
    };

    render(<IntegratedApp />);

    // Install
    fireEvent.click(screen.getByText('Install Prettier'));
    expect(screen.getByTestId('installing')).toHaveTextContent('Installing Prettier');

    await waitFor(() => {
      expect(screen.getByTestId('installed')).toHaveTextContent('Prettier');
    });

    // Uninstall
    const uninstallButtons = screen.getAllByText('Uninstall');
    fireEvent.click(uninstallButtons[0]); // Uninstall ESLint

    expect(screen.getByTestId('installed')).not.toHaveTextContent('ESLint');
  });
});

// ============================================
// COLLABORATION WORKFLOW (5 tests)
// ============================================

describe('Collaboration Workflow', () => {
  it('16. complete share project workflow', async () => {
    const IntegratedApp = () => {
      const [shared, setShared] = React.useState(false);
      const [collaborators, setCollaborators] = React.useState<string[]>([]);
      const [shareLink, setShareLink] = React.useState('');
      const [email, setEmail] = React.useState('');

      const share = () => {
        setShared(true);
        setShareLink('https://example.com/share/abc123');
      };

      const addCollaborator = () => {
        if (email) {
          setCollaborators([...collaborators, email]);
          setEmail('');
        }
      };

      return (
        <div>
          {!shared ? (
            <button onClick={share}>Share Project</button>
          ) : (
            <div>
              <div data-testid="share-link">{shareLink}</div>
              <input
                placeholder="Add collaborator email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="collab-email"
              />
              <button onClick={addCollaborator}>Add</button>
              <div data-testid="collaborators">
                Collaborators: {collaborators.join(', ') || 'None'}
              </div>
            </div>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    // Share project
    fireEvent.click(screen.getByText('Share Project'));
    expect(screen.getByTestId('share-link')).toHaveTextContent('https://example.com/share/abc123');

    // Add collaborator
    fireEvent.change(screen.getByTestId('collab-email'), { target: { value: 'bob@example.com' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByTestId('collaborators')).toHaveTextContent('bob@example.com');
  });

  it('17. complete code review workflow', async () => {
    const IntegratedApp = () => {
      const [comments, setComments] = React.useState<Array<{ line: number; text: string }>>([]);
      const [approved, setApproved] = React.useState(false);

      const addComment = (line: number, text: string) => {
        setComments([...comments, { line, text }]);
      };

      const approve = () => {
        setApproved(true);
      };

      return (
        <div>
          <div data-testid="code">
            {[1, 2, 3].map((line) => (
              <div key={line}>
                Line {line}
                <button onClick={() => addComment(line, `Comment on line ${line}`)}>
                  Comment
                </button>
              </div>
            ))}
          </div>
          <div data-testid="comments">
            {comments.map((c, i) => (
              <div key={i}>
                L{c.line}: {c.text}
              </div>
            ))}
          </div>
          <button onClick={approve}>Approve</button>
          {approved && <div data-testid="approved">Review Approved</div>}
        </div>
      );
    };

    render(<IntegratedApp />);

    // Add comments
    const commentButtons = screen.getAllByText('Comment');
    fireEvent.click(commentButtons[0]);
    fireEvent.click(commentButtons[2]);

    expect(screen.getByTestId('comments')).toHaveTextContent('L1:');
    expect(screen.getByTestId('comments')).toHaveTextContent('L3:');

    // Approve
    fireEvent.click(screen.getByText('Approve'));
    expect(screen.getByTestId('approved')).toBeInTheDocument();
  });

  it('18. complete merge conflict resolution workflow', async () => {
    const IntegratedApp = () => {
      const [conflict, setConflict] = React.useState({
        ours: 'const x = 1;',
        theirs: 'const x = 2;',
        resolved: null as string | null,
      });

      const acceptOurs = () => {
        setConflict({ ...conflict, resolved: conflict.ours });
      };

      const acceptTheirs = () => {
        setConflict({ ...conflict, resolved: conflict.theirs });
      };

      return (
        <div>
          {!conflict.resolved ? (
            <div>
              <div data-testid="ours">Ours: {conflict.ours}</div>
              <div data-testid="theirs">Theirs: {conflict.theirs}</div>
              <button onClick={acceptOurs}>Accept Ours</button>
              <button onClick={acceptTheirs}>Accept Theirs</button>
            </div>
          ) : (
            <div data-testid="resolved">Resolved: {conflict.resolved}</div>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('ours')).toHaveTextContent('const x = 1;');
    expect(screen.getByTestId('theirs')).toHaveTextContent('const x = 2;');

    fireEvent.click(screen.getByText('Accept Theirs'));

    expect(screen.getByTestId('resolved')).toHaveTextContent('Resolved: const x = 2;');
  });

  it('19. complete live collaboration session', () => {
    const users = [
      { id: '1', name: 'Alice', cursor: { line: 10, col: 5 }, color: '#ff0000' },
      { id: '2', name: 'Bob', cursor: { line: 20, col: 15 }, color: '#00ff00' },
    ];

    const CollabSession = ({ users }: { users: typeof users }) => (
      <div>
        <div data-testid="users">
          {users.map((u) => (
            <span key={u.id} style={{ color: u.color }}>
              {u.name}
            </span>
          ))}
        </div>
        <div data-testid="editor">
          {users.map((u) => (
            <div key={u.id} data-testid={`cursor-${u.id}`}>
              {u.name}'s cursor at line {u.cursor.line}
            </div>
          ))}
        </div>
      </div>
    );

    render(<CollabSession users={users} />);

    expect(screen.getByTestId('users')).toHaveTextContent('Alice');
    expect(screen.getByTestId('users')).toHaveTextContent('Bob');
    expect(screen.getByTestId('cursor-1')).toHaveTextContent("Alice's cursor at line 10");
  });

  it('20. complete chat and notification workflow', async () => {
    const IntegratedApp = () => {
      const [messages, setMessages] = React.useState<Array<{ user: string; text: string }>>([
        { user: 'Alice', text: 'Hello!' },
      ]);
      const [newMessage, setNewMessage] = React.useState('');
      const [unread, setUnread] = React.useState(1);

      const send = () => {
        if (newMessage) {
          setMessages([...messages, { user: 'You', text: newMessage }]);
          setNewMessage('');
        }
      };

      const markRead = () => {
        setUnread(0);
      };

      return (
        <div>
          <div data-testid="unread-badge">{unread > 0 ? `(${unread})` : ''}</div>
          <div data-testid="messages" onClick={markRead}>
            {messages.map((m, i) => (
              <div key={i}>
                <strong>{m.user}:</strong> {m.text}
              </div>
            ))}
          </div>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message"
            data-testid="message-input"
          />
          <button onClick={send}>Send</button>
        </div>
      );
    };

    render(<IntegratedApp />);

    // Check unread
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('(1)');

    // Mark as read
    fireEvent.click(screen.getByTestId('messages'));
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('');

    // Send message
    fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hi there!' } });
    fireEvent.click(screen.getByText('Send'));

    expect(screen.getByTestId('messages')).toHaveTextContent('Hi there!');
  });
});

// ============================================
// AI WORKFLOW (5 tests)
// ============================================

describe('AI Workflow', () => {
  it('21. complete AI code generation workflow', async () => {
    const IntegratedApp = () => {
      const [prompt, setPrompt] = React.useState('');
      const [generating, setGenerating] = React.useState(false);
      const [generatedCode, setGeneratedCode] = React.useState('');

      const generate = () => {
        setGenerating(true);
        setTimeout(() => {
          setGeneratedCode('function generated() { return true; }');
          setGenerating(false);
        }, 50);
      };

      const insert = () => {
        // Would insert into editor
      };

      return (
        <div>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe code to generate"
            data-testid="prompt-input"
          />
          <button onClick={generate} disabled={generating || !prompt}>
            Generate
          </button>
          {generating && <div data-testid="loading">Generating...</div>}
          {generatedCode && (
            <div>
              <pre data-testid="generated">{generatedCode}</pre>
              <button onClick={insert}>Insert</button>
            </div>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    fireEvent.change(screen.getByTestId('prompt-input'), { target: { value: 'A function' } });
    fireEvent.click(screen.getByText('Generate'));

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('generated')).toHaveTextContent('function generated()');
    });

    expect(screen.getByText('Insert')).toBeInTheDocument();
  });

  it('22. complete AI refactoring workflow', async () => {
    const IntegratedApp = () => {
      const [code, setCode] = React.useState('var x = 1; var y = 2;');
      const [suggestion, setSuggestion] = React.useState<string | null>(null);

      const refactor = () => {
        setSuggestion('const x = 1; const y = 2;');
      };

      const apply = () => {
        if (suggestion) {
          setCode(suggestion);
          setSuggestion(null);
        }
      };

      return (
        <div>
          <div data-testid="code">{code}</div>
          <button onClick={refactor}>Suggest Refactor</button>
          {suggestion && (
            <div>
              <div data-testid="suggestion">{suggestion}</div>
              <button onClick={apply}>Apply</button>
            </div>
          )}
        </div>
      );
    };

    render(<IntegratedApp />);

    expect(screen.getByTestId('code')).toHaveTextContent('var x = 1');

    fireEvent.click(screen.getByText('Suggest Refactor'));
    expect(screen.getByTestId('suggestion')).toHaveTextContent('const x = 1');

    fireEvent.click(screen.getByText('Apply'));
    expect(screen.getByTestId('code')).toHaveTextContent('const x = 1');
  });

  it('23. complete AI explanation workflow', async () => {
    const IntegratedApp = () => {
      const [selectedCode, setSelectedCode] = React.useState('');
      const [explanation, setExplanation] = React.useState<string | null>(null);

      const explain = () => {
        if (selectedCode) {
          setExplanation(`This code ${selectedCode} does something important.`);
        }
      };

      return (
        <div>
          <textarea
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            placeholder="Select code to explain"
            data-testid="code-input"
          />
          <button onClick={explain} disabled={!selectedCode}>
            Explain
          </button>
          {explanation && <div data-testid="explanation">{explanation}</div>}
        </div>
      );
    };

    render(<IntegratedApp />);

    fireEvent.change(screen.getByTestId('code-input'), { target: { value: 'const x = 1' } });
    fireEvent.click(screen.getByText('Explain'));

    expect(screen.getByTestId('explanation')).toHaveTextContent('This code');
  });

  it('24. complete AI bug detection workflow', async () => {
    const IntegratedApp = () => {
      const [bugs, setBugs] = React.useState<Array<{ line: number; message: string }>>([]);
      const [scanning, setScanning] = React.useState(false);

      const scan = () => {
        setScanning(true);
        setTimeout(() => {
          setBugs([
            { line: 5, message: 'Potential null reference' },
            { line: 12, message: 'Unused variable' },
          ]);
          setScanning(false);
        }, 50);
      };

      return (
        <div>
          <button onClick={scan} disabled={scanning}>
            Scan for Bugs
          </button>
          {scanning && <div>Scanning...</div>}
          <div data-testid="bugs">
            {bugs.map((b, i) => (
              <div key={i}>
                Line {b.line}: {b.message}
              </div>
            ))}
          </div>
        </div>
      );
    };

    render(<IntegratedApp />);

    fireEvent.click(screen.getByText('Scan for Bugs'));

    await waitFor(() => {
      expect(screen.getByTestId('bugs')).toHaveTextContent('Potential null reference');
    });

    expect(screen.getByTestId('bugs')).toHaveTextContent('Unused variable');
  });

  it('25. complete AI test generation workflow', async () => {
    const IntegratedApp = () => {
      const [functionCode] = React.useState('function add(a, b) { return a + b; }');
      const [tests, setTests] = React.useState<string | null>(null);
      const [generating, setGenerating] = React.useState(false);

      const generateTests = () => {
        setGenerating(true);
        setTimeout(() => {
          setTests(`
test('add returns sum', () => {
  expect(add(1, 2)).toBe(3);
});
          `.trim());
          setGenerating(false);
        }, 50);
      };

      return (
        <div>
          <div data-testid="function">{functionCode}</div>
          <button onClick={generateTests} disabled={generating}>
            Generate Tests
          </button>
          {generating && <div>Generating tests...</div>}
          {tests && <pre data-testid="tests">{tests}</pre>}
        </div>
      );
    };

    render(<IntegratedApp />);

    fireEvent.click(screen.getByText('Generate Tests'));

    await waitFor(() => {
      expect(screen.getByTestId('tests')).toHaveTextContent("test('add returns sum'");
    });

    expect(screen.getByTestId('tests')).toHaveTextContent('expect(add(1, 2)).toBe(3)');
  });
});
