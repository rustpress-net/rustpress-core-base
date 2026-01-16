import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// AI WRITING ASSISTANT - COMPONENT 4 OF 10 (POST EDITOR ENHANCEMENTS)
// Grammar checking, suggestions, tone adjustment, and AI-powered writing help
// ============================================================================

// Types
export type ToneType = 'professional' | 'casual' | 'friendly' | 'formal' | 'persuasive' | 'neutral';
export type SuggestionType = 'grammar' | 'spelling' | 'style' | 'clarity' | 'tone' | 'vocabulary';
export type SuggestionSeverity = 'error' | 'warning' | 'info' | 'enhancement';

export interface WritingSuggestion {
  id: string;
  type: SuggestionType;
  severity: SuggestionSeverity;
  originalText: string;
  suggestedText: string;
  explanation: string;
  position: { start: number; end: number };
  accepted?: boolean;
  dismissed?: boolean;
}

export interface AIWritingConfig {
  enabled: boolean;
  autoCheck: boolean;
  checkDelay: number;
  targetTone: ToneType;
  enableGrammar: boolean;
  enableSpelling: boolean;
  enableStyle: boolean;
  enableClarity: boolean;
  enableVocabulary: boolean;
  language: string;
}

interface AIWritingContextValue {
  config: AIWritingConfig;
  suggestions: WritingSuggestion[];
  isAnalyzing: boolean;
  analyzeText: (text: string) => Promise<void>;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  acceptAll: () => void;
  dismissAll: () => void;
  updateConfig: (config: Partial<AIWritingConfig>) => void;
  changeTone: (text: string, tone: ToneType) => Promise<string>;
  improveClarity: (text: string) => Promise<string>;
  expandContent: (text: string) => Promise<string>;
  summarize: (text: string) => Promise<string>;
}

const defaultConfig: AIWritingConfig = {
  enabled: true,
  autoCheck: true,
  checkDelay: 1000,
  targetTone: 'professional',
  enableGrammar: true,
  enableSpelling: true,
  enableStyle: true,
  enableClarity: true,
  enableVocabulary: false,
  language: 'en-US',
};

const AIWritingContext = createContext<AIWritingContextValue | null>(null);

// ============================================================================
// AI WRITING PROVIDER
// ============================================================================

interface AIWritingProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AIWritingConfig>;
  onSuggestionAccepted?: (suggestion: WritingSuggestion) => void;
  onTextImproved?: (original: string, improved: string) => void;
}

export const AIWritingProvider: React.FC<AIWritingProviderProps> = ({
  children,
  initialConfig,
  onSuggestionAccepted,
  onTextImproved,
}) => {
  const [config, setConfig] = useState<AIWritingConfig>({ ...defaultConfig, ...initialConfig });
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulated AI analysis (in production, this would call an AI API)
  const analyzeText = useCallback(async (text: string) => {
    if (!config.enabled || !text.trim()) {
      setSuggestions([]);
      return;
    }

    setIsAnalyzing(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newSuggestions: WritingSuggestion[] = [];
    let idCounter = 0;
    let match: RegExpExecArray | null;

    // Grammar checks
    if (config.enableGrammar) {
      // Check for double spaces
      const doubleSpaceRegex = /  +/g;
      while ((match = doubleSpaceRegex.exec(text)) !== null) {
        newSuggestions.push({
          id: `suggestion-${idCounter++}`,
          type: 'grammar',
          severity: 'warning',
          originalText: match[0],
          suggestedText: ' ',
          explanation: 'Remove extra spaces',
          position: { start: match.index, end: match.index + match[0].length },
        });
      }

      // Check for missing capitalization after periods
      const missingCapRegex = /\. [a-z]/g;
      while ((match = missingCapRegex.exec(text)) !== null) {
        newSuggestions.push({
          id: `suggestion-${idCounter++}`,
          type: 'grammar',
          severity: 'error',
          originalText: match[0],
          suggestedText: match[0].toUpperCase(),
          explanation: 'Capitalize the first letter after a period',
          position: { start: match.index, end: match.index + match[0].length },
        });
      }
    }

    // Spelling checks (simulated common mistakes)
    if (config.enableSpelling) {
      const commonMistakes: Record<string, string> = {
        'teh': 'the',
        'recieve': 'receive',
        'occured': 'occurred',
        'seperate': 'separate',
        'definately': 'definitely',
        'accomodate': 'accommodate',
        'occassion': 'occasion',
        'untill': 'until',
        'wierd': 'weird',
        'neccessary': 'necessary',
      };

      Object.entries(commonMistakes).forEach(([wrong, correct]) => {
        const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
        while ((match = regex.exec(text)) !== null) {
          newSuggestions.push({
            id: `suggestion-${idCounter++}`,
            type: 'spelling',
            severity: 'error',
            originalText: match[0],
            suggestedText: match[0][0] === match[0][0].toUpperCase()
              ? correct.charAt(0).toUpperCase() + correct.slice(1)
              : correct,
            explanation: `Correct spelling: "${correct}"`,
            position: { start: match.index, end: match.index + match[0].length },
          });
        }
      });
    }

    // Style checks
    if (config.enableStyle) {
      const passiveVoicePatterns = [
        { pattern: /was being/gi, suggestion: 'Consider using active voice' },
        { pattern: /were being/gi, suggestion: 'Consider using active voice' },
        { pattern: /has been/gi, suggestion: 'Consider using active voice' },
        { pattern: /have been/gi, suggestion: 'Consider using active voice' },
      ];

      passiveVoicePatterns.forEach(({ pattern, suggestion }) => {
        while ((match = pattern.exec(text)) !== null) {
          newSuggestions.push({
            id: `suggestion-${idCounter++}`,
            type: 'style',
            severity: 'info',
            originalText: match[0],
            suggestedText: match[0],
            explanation: suggestion,
            position: { start: match.index, end: match.index + match[0].length },
          });
        }
      });

      // Check for weak words
      const weakWords = ['very', 'really', 'just', 'basically', 'actually'];
      weakWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        while ((match = regex.exec(text)) !== null) {
          newSuggestions.push({
            id: `suggestion-${idCounter++}`,
            type: 'style',
            severity: 'info',
            originalText: match[0],
            suggestedText: '',
            explanation: `"${word}" is often unnecessary and weakens your writing`,
            position: { start: match.index, end: match.index + match[0].length },
          });
        }
      });
    }

    // Clarity checks
    if (config.enableClarity) {
      // Check for overly long sentences
      const sentences = text.split(/[.!?]+/);
      let currentPosition = 0;

      sentences.forEach(sentence => {
        const wordCount = sentence.trim().split(/\s+/).length;
        if (wordCount > 30 && sentence.trim()) {
          newSuggestions.push({
            id: `suggestion-${idCounter++}`,
            type: 'clarity',
            severity: 'warning',
            originalText: sentence.trim().slice(0, 50) + '...',
            suggestedText: '',
            explanation: `This sentence has ${wordCount} words. Consider breaking it into shorter sentences for better readability.`,
            position: { start: currentPosition, end: currentPosition + sentence.length },
          });
        }
        currentPosition += sentence.length + 1;
      });
    }

    setSuggestions(newSuggestions);
    setIsAnalyzing(false);
  }, [config]);

  const acceptSuggestion = useCallback((id: string) => {
    setSuggestions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, accepted: true } : s);
      const accepted = updated.find(s => s.id === id);
      if (accepted && onSuggestionAccepted) {
        onSuggestionAccepted(accepted);
      }
      return updated;
    });
  }, [onSuggestionAccepted]);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  }, []);

  const acceptAll = useCallback(() => {
    setSuggestions(prev => {
      const updated = prev.map(s => ({ ...s, accepted: !s.dismissed }));
      updated.filter(s => s.accepted && !s.dismissed).forEach(s => {
        if (onSuggestionAccepted) onSuggestionAccepted(s);
      });
      return updated;
    });
  }, [onSuggestionAccepted]);

  const dismissAll = useCallback(() => {
    setSuggestions(prev => prev.map(s => ({ ...s, dismissed: true })));
  }, []);

  const updateConfig = useCallback((updates: Partial<AIWritingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Simulated AI text improvements
  const changeTone = useCallback(async (text: string, tone: ToneType): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple simulation - in production this would use AI
    const toneModifiers: Record<ToneType, (t: string) => string> = {
      professional: (t) => t.replace(/\b(hey|hi)\b/gi, 'Hello').replace(/!/g, '.'),
      casual: (t) => t.replace(/\bHello\b/gi, 'Hey').replace(/\./g, '!'),
      friendly: (t) => t + ' 😊',
      formal: (t) => t.replace(/\b(don't|can't|won't)\b/gi, m => {
        const formal: Record<string, string> = { "don't": "do not", "can't": "cannot", "won't": "will not" };
        return formal[m.toLowerCase()] || m;
      }),
      persuasive: (t) => t.replace(/^/, 'Importantly, '),
      neutral: (t) => t,
    };

    const improved = toneModifiers[tone](text);
    if (onTextImproved) onTextImproved(text, improved);
    return improved;
  }, [onTextImproved]);

  const improveClarity = useCallback(async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simplified simulation
    const improved = text
      .replace(/\s+/g, ' ')
      .replace(/very /gi, '')
      .replace(/really /gi, '')
      .replace(/basically /gi, '');
    if (onTextImproved) onTextImproved(text, improved);
    return improved;
  }, [onTextImproved]);

  const expandContent = useCallback(async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const expanded = `${text} This point is worth elaborating on further. Consider the implications and potential applications of this idea.`;
    if (onTextImproved) onTextImproved(text, expanded);
    return expanded;
  }, [onTextImproved]);

  const summarize = useCallback(async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const words = text.split(' ');
    const summarized = words.slice(0, Math.ceil(words.length / 3)).join(' ') + '...';
    if (onTextImproved) onTextImproved(text, summarized);
    return summarized;
  }, [onTextImproved]);

  const value: AIWritingContextValue = {
    config,
    suggestions,
    isAnalyzing,
    analyzeText,
    acceptSuggestion,
    dismissSuggestion,
    acceptAll,
    dismissAll,
    updateConfig,
    changeTone,
    improveClarity,
    expandContent,
    summarize,
  };

  return (
    <AIWritingContext.Provider value={value}>
      {children}
    </AIWritingContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAIWriting = (): AIWritingContextValue => {
  const context = useContext(AIWritingContext);
  if (!context) {
    throw new Error('useAIWriting must be used within an AIWritingProvider');
  }
  return context;
};

// ============================================================================
// WRITING ASSISTANT PANEL
// ============================================================================

interface WritingAssistantPanelProps {
  className?: string;
  position?: 'right' | 'bottom';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const WritingAssistantPanel: React.FC<WritingAssistantPanelProps> = ({
  className = '',
  position = 'right',
  collapsible = true,
  defaultCollapsed = false,
}) => {
  const { suggestions, isAnalyzing, acceptSuggestion, dismissSuggestion, acceptAll, dismissAll } = useAIWriting();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const activeSuggestions = suggestions.filter(s => !s.accepted && !s.dismissed);
  const errorCount = activeSuggestions.filter(s => s.severity === 'error').length;
  const warningCount = activeSuggestions.filter(s => s.severity === 'warning').length;

  const severityColors: Record<SuggestionSeverity, string> = {
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    enhancement: '#10B981',
  };

  const severityIcons: Record<SuggestionSeverity, string> = {
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    enhancement: '✨',
  };

  const typeLabels: Record<SuggestionType, string> = {
    grammar: 'Grammar',
    spelling: 'Spelling',
    style: 'Style',
    clarity: 'Clarity',
    tone: 'Tone',
    vocabulary: 'Vocabulary',
  };

  const isVertical = position === 'right';

  const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    ...(isVertical ? { width: collapsed ? '48px' : '320px' } : { height: collapsed ? '48px' : '300px' }),
    transition: 'all 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderBottom: collapsed ? 'none' : '1px solid #e5e7eb',
  };

  return (
    <div className={className} style={panelStyle}>
      <div style={headerStyle}>
        {!collapsed && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🤖</span>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Writing Assistant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isAnalyzing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
              )}
              {errorCount > 0 && (
                <span style={{ padding: '2px 8px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                  {errorCount} error{errorCount > 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span style={{ padding: '2px 8px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                  {warningCount} warning{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </>
        )}
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '16px',
            }}
          >
            {collapsed ? (isVertical ? '◀' : '▲') : (isVertical ? '▶' : '▼')}
          </button>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ flex: 1, overflow: 'auto' }}
          >
            {activeSuggestions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✓</span>
                <span style={{ fontSize: '14px' }}>No suggestions. Your writing looks great!</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', gap: '8px', borderBottom: '1px solid #e5e7eb' }}>
                  <button
                    onClick={acceptAll}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: '#10B981',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Accept All
                  </button>
                  <button
                    onClick={dismissAll}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    Dismiss All
                  </button>
                </div>
                <div style={{ padding: '8px' }}>
                  {activeSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${severityColors[suggestion.severity]}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ color: severityColors[suggestion.severity], fontSize: '12px' }}>
                          {severityIcons[suggestion.severity]}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                          {typeLabels[suggestion.type]}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>
                        {suggestion.explanation}
                      </p>
                      {suggestion.suggestedText && suggestion.suggestedText !== suggestion.originalText && (
                        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                          <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>
                            {suggestion.originalText}
                          </span>
                          <span style={{ margin: '0 4px' }}>→</span>
                          <span style={{ color: '#10B981', fontWeight: 500 }}>
                            {suggestion.suggestedText || '(remove)'}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {suggestion.suggestedText !== undefined && (
                          <button
                            onClick={() => acceptSuggestion(suggestion.id)}
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              border: 'none',
                              borderRadius: '4px',
                              backgroundColor: '#10B981',
                              color: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => dismissSuggestion(suggestion.id)}
                          style={{
                            padding: '4px 12px',
                            fontSize: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// AI ACTIONS TOOLBAR
// ============================================================================

interface AIActionsToolbarProps {
  text: string;
  onTextChange: (text: string) => void;
  className?: string;
  compact?: boolean;
}

export const AIActionsToolbar: React.FC<AIActionsToolbarProps> = ({
  text,
  onTextChange,
  className = '',
  compact = false,
}) => {
  const { changeTone, improveClarity, expandContent, summarize, config, updateConfig } = useAIWriting();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);

  const handleAction = async (action: () => Promise<string>) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const result = await action();
      onTextChange(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const tones: { value: ToneType; label: string; icon: string }[] = [
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'casual', label: 'Casual', icon: '😎' },
    { value: 'friendly', label: 'Friendly', icon: '🤗' },
    { value: 'formal', label: 'Formal', icon: '📜' },
    { value: 'persuasive', label: 'Persuasive', icon: '💪' },
    { value: 'neutral', label: 'Neutral', icon: '😐' },
  ];

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: compact ? '4px 8px' : '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: compact ? '12px' : '13px',
    cursor: isProcessing ? 'wait' : 'pointer',
    opacity: isProcessing ? 0.6 : 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#6b7280', marginRight: '8px' }}>🤖 AI:</span>

      <div style={{ position: 'relative' }}>
        <button
          style={buttonStyle}
          onClick={() => setShowToneMenu(!showToneMenu)}
          disabled={isProcessing}
        >
          <span>🎭</span>
          {!compact && <span>Change Tone</span>}
          <span style={{ fontSize: '10px' }}>▼</span>
        </button>

        <AnimatePresence>
          {showToneMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                zIndex: 100,
                minWidth: '160px',
              }}
            >
              {tones.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => {
                    setShowToneMenu(false);
                    handleAction(() => changeTone(text, tone.value));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    backgroundColor: config.targetTone === tone.value ? '#f3f4f6' : 'white',
                    color: '#374151',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{tone.icon}</span>
                  <span>{tone.label}</span>
                  {config.targetTone === tone.value && (
                    <span style={{ marginLeft: 'auto', color: '#10B981' }}>✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        style={buttonStyle}
        onClick={() => handleAction(() => improveClarity(text))}
        disabled={isProcessing}
      >
        <span>✨</span>
        {!compact && <span>Improve Clarity</span>}
      </button>

      <button
        style={buttonStyle}
        onClick={() => handleAction(() => expandContent(text))}
        disabled={isProcessing}
      >
        <span>📝</span>
        {!compact && <span>Expand</span>}
      </button>

      <button
        style={buttonStyle}
        onClick={() => handleAction(() => summarize(text))}
        disabled={isProcessing}
      >
        <span>📋</span>
        {!compact && <span>Summarize</span>}
      </button>

      {isProcessing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid #3b82f6',
            borderTopColor: 'transparent',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// GRAMMAR CHECKER
// ============================================================================

interface GrammarCheckerProps {
  text: string;
  onTextChange?: (text: string) => void;
  showInline?: boolean;
  className?: string;
}

export const GrammarChecker: React.FC<GrammarCheckerProps> = ({
  text,
  onTextChange,
  showInline = true,
  className = '',
}) => {
  const { analyzeText, suggestions, isAnalyzing, acceptSuggestion } = useAIWriting();
  const analysisTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (analysisTimer.current) {
      clearTimeout(analysisTimer.current);
    }
    analysisTimer.current = setTimeout(() => {
      analyzeText(text);
    }, 500);

    return () => {
      if (analysisTimer.current) {
        clearTimeout(analysisTimer.current);
      }
    };
  }, [text, analyzeText]);

  const activeSuggestions = suggestions.filter(s => !s.accepted && !s.dismissed);

  if (!showInline) {
    return null;
  }

  // Render text with highlighted issues
  const renderHighlightedText = () => {
    if (activeSuggestions.length === 0) {
      return <span>{text}</span>;
    }

    const sortedSuggestions = [...activeSuggestions].sort((a, b) => a.position.start - b.position.start);
    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    sortedSuggestions.forEach((suggestion, index) => {
      // Add text before this suggestion
      if (suggestion.position.start > lastEnd) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastEnd, suggestion.position.start)}
          </span>
        );
      }

      // Add highlighted text
      const highlightColors: Record<SuggestionSeverity, string> = {
        error: 'rgba(239, 68, 68, 0.2)',
        warning: 'rgba(245, 158, 11, 0.2)',
        info: 'rgba(59, 130, 246, 0.2)',
        enhancement: 'rgba(16, 185, 129, 0.2)',
      };

      elements.push(
        <span
          key={`highlight-${index}`}
          style={{
            backgroundColor: highlightColors[suggestion.severity],
            borderBottom: `2px solid ${suggestion.severity === 'error' ? '#EF4444' : suggestion.severity === 'warning' ? '#F59E0B' : '#3B82F6'}`,
            cursor: 'pointer',
            position: 'relative',
          }}
          title={suggestion.explanation}
          onClick={() => {
            if (onTextChange && suggestion.suggestedText !== undefined) {
              const newText = text.slice(0, suggestion.position.start) + suggestion.suggestedText + text.slice(suggestion.position.end);
              onTextChange(newText);
              acceptSuggestion(suggestion.id);
            }
          }}
        >
          {text.slice(suggestion.position.start, suggestion.position.end)}
        </span>
      );

      lastEnd = suggestion.position.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      elements.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }

    return <>{elements}</>;
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {renderHighlightedText()}
      </div>
      {isAnalyzing && (
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '12px',
              height: '12px',
              border: '2px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// TONE SELECTOR
// ============================================================================

interface ToneSelectorProps {
  value: ToneType;
  onChange: (tone: ToneType) => void;
  className?: string;
  showLabels?: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  value,
  onChange,
  className = '',
  showLabels = true,
}) => {
  const tones: { value: ToneType; label: string; icon: string; description: string }[] = [
    { value: 'professional', label: 'Professional', icon: '👔', description: 'Business-appropriate language' },
    { value: 'casual', label: 'Casual', icon: '😎', description: 'Relaxed and informal' },
    { value: 'friendly', label: 'Friendly', icon: '🤗', description: 'Warm and approachable' },
    { value: 'formal', label: 'Formal', icon: '📜', description: 'Official and structured' },
    { value: 'persuasive', label: 'Persuasive', icon: '💪', description: 'Compelling and convincing' },
    { value: 'neutral', label: 'Neutral', icon: '😐', description: 'Balanced and objective' },
  ];

  return (
    <div className={className} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {tones.map((tone) => (
        <button
          key={tone.value}
          onClick={() => onChange(tone.value)}
          title={tone.description}
          style={{
            display: 'flex',
            flexDirection: showLabels ? 'column' : 'row',
            alignItems: 'center',
            gap: '4px',
            padding: showLabels ? '12px 16px' : '8px',
            border: `2px solid ${value === tone.value ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            backgroundColor: value === tone.value ? '#EFF6FF' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: showLabels ? '24px' : '16px' }}>{tone.icon}</span>
          {showLabels && (
            <span style={{ fontSize: '12px', fontWeight: value === tone.value ? 600 : 400, color: '#374151' }}>
              {tone.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// WRITING SETTINGS
// ============================================================================

interface WritingSettingsProps {
  className?: string;
}

export const WritingSettings: React.FC<WritingSettingsProps> = ({ className = '' }) => {
  const { config, updateConfig } = useAIWriting();

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const switchStyle = (enabled: boolean): React.CSSProperties => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: enabled ? '#3b82f6' : '#d1d5db',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  });

  const switchKnobStyle = (enabled: boolean): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    position: 'absolute',
    top: '2px',
    left: enabled ? '22px' : '2px',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  });

  return (
    <div className={className} style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
        Writing Assistant Settings
      </h3>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Enable AI Assistant</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Get real-time writing suggestions</div>
        </div>
        <div style={switchStyle(config.enabled)} onClick={() => updateConfig({ enabled: !config.enabled })}>
          <div style={switchKnobStyle(config.enabled)} />
        </div>
      </div>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Auto-check</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Analyze text as you type</div>
        </div>
        <div style={switchStyle(config.autoCheck)} onClick={() => updateConfig({ autoCheck: !config.autoCheck })}>
          <div style={switchKnobStyle(config.autoCheck)} />
        </div>
      </div>

      <div style={{ marginTop: '16px', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#374151' }}>
        Check for:
      </div>

      {[
        { key: 'enableGrammar' as const, label: 'Grammar issues' },
        { key: 'enableSpelling' as const, label: 'Spelling mistakes' },
        { key: 'enableStyle' as const, label: 'Style improvements' },
        { key: 'enableClarity' as const, label: 'Clarity suggestions' },
        { key: 'enableVocabulary' as const, label: 'Vocabulary enhancements' },
      ].map(({ key, label }) => (
        <div key={key} style={{ ...toggleStyle, padding: '8px 0' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
          <div
            style={{ ...switchStyle(config[key]), transform: 'scale(0.8)' }}
            onClick={() => updateConfig({ [key]: !config[key] })}
          >
            <div style={switchKnobStyle(config[key])} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
          Target Tone
        </div>
        <ToneSelector value={config.targetTone} onChange={(tone) => updateConfig({ targetTone: tone })} showLabels={false} />
      </div>
    </div>
  );
};

// ============================================================================
// INLINE SUGGESTION POPUP
// ============================================================================

interface InlineSuggestionPopupProps {
  suggestion: WritingSuggestion;
  position: { x: number; y: number };
  onAccept: () => void;
  onDismiss: () => void;
  onClose: () => void;
}

export const InlineSuggestionPopup: React.FC<InlineSuggestionPopupProps> = ({
  suggestion,
  position,
  onAccept,
  onDismiss,
  onClose,
}) => {
  const severityColors: Record<SuggestionSeverity, string> = {
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    enhancement: '#10B981',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '12px',
        maxWidth: '300px',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: `${severityColors[suggestion.severity]}20`,
            color: severityColors[suggestion.severity],
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {suggestion.type}
        </span>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '16px' }}
        >
          ×
        </button>
      </div>

      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#374151' }}>
        {suggestion.explanation}
      </p>

      {suggestion.suggestedText !== undefined && suggestion.suggestedText !== suggestion.originalText && (
        <div style={{ padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Suggestion:</div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{suggestion.originalText}</span>
            <span style={{ margin: '0 8px' }}>→</span>
            <span style={{ color: '#10B981', fontWeight: 500 }}>{suggestion.suggestedText || '(remove)'}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {suggestion.suggestedText !== undefined && (
          <button
            onClick={onAccept}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#10B981',
              color: 'white',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Accept
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// WRITING SCORE
// ============================================================================

interface WritingScoreProps {
  text: string;
  className?: string;
  showDetails?: boolean;
}

export const WritingScore: React.FC<WritingScoreProps> = ({
  text,
  className = '',
  showDetails = false,
}) => {
  const { suggestions } = useAIWriting();

  const activeSuggestions = suggestions.filter(s => !s.accepted && !s.dismissed);
  const errorCount = activeSuggestions.filter(s => s.severity === 'error').length;
  const warningCount = activeSuggestions.filter(s => s.severity === 'warning').length;
  const infoCount = activeSuggestions.filter(s => s.severity === 'info' || s.severity === 'enhancement').length;

  // Calculate score (100 base, minus points for issues)
  const wordCount = text.split(/\s+/).filter(w => w).length;
  const baseScore = wordCount > 0 ? 100 : 0;
  const errorPenalty = errorCount * 10;
  const warningPenalty = warningCount * 5;
  const infoPenalty = infoCount * 2;
  const score = Math.max(0, baseScore - errorPenalty - warningPenalty - infoPenalty);

  const getScoreColor = () => {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="10"
            strokeDasharray={`${(score / 100) * 283} 283`}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: getScoreColor() }}>{score}</div>
        </div>
      </div>

      {showDetails && (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            {getScoreLabel()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {errorCount > 0 && <span style={{ color: '#EF4444' }}>{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
            {errorCount > 0 && (warningCount > 0 || infoCount > 0) && ' · '}
            {warningCount > 0 && <span style={{ color: '#F59E0B' }}>{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
            {warningCount > 0 && infoCount > 0 && ' · '}
            {infoCount > 0 && <span style={{ color: '#3B82F6' }}>{infoCount} suggestion{infoCount > 1 ? 's' : ''}</span>}
            {activeSuggestions.length === 0 && <span style={{ color: '#10B981' }}>No issues found!</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  WritingAssistantPanel as AIWritingAssistant,
};

export default AIWritingProvider;
