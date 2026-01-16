import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ALT TEXT AI - Component 17
// AI-powered alt text generation for images with editing and suggestions
// ============================================================================

// Types
export interface AltTextSuggestion {
  id: string;
  text: string;
  confidence: number;
  style: 'descriptive' | 'concise' | 'seo' | 'decorative';
}

export interface ImageAnalysis {
  objects: string[];
  scene: string;
  colors: string[];
  text?: string;
  faces?: number;
  emotions?: string[];
}

export interface AltTextConfig {
  defaultStyle: 'descriptive' | 'concise' | 'seo';
  maxLength: number;
  includeContext: boolean;
  autoGenerate: boolean;
}

interface AltTextAIContextType {
  currentAltText: string;
  suggestions: AltTextSuggestion[];
  analysis: ImageAnalysis | null;
  isAnalyzing: boolean;
  isGenerating: boolean;
  config: AltTextConfig;
  setAltText: (text: string) => void;
  generateAltText: (imageUrl: string) => Promise<void>;
  analyzeImage: (imageUrl: string) => Promise<void>;
  applySuggestion: (suggestionId: string) => void;
  updateConfig: (updates: Partial<AltTextConfig>) => void;
}

const AltTextAIContext = createContext<AltTextAIContextType | null>(null);

export const useAltTextAI = () => {
  const context = useContext(AltTextAIContext);
  if (!context) {
    throw new Error('useAltTextAI must be used within AltTextAIProvider');
  }
  return context;
};

const defaultConfig: AltTextConfig = {
  defaultStyle: 'descriptive',
  maxLength: 125,
  includeContext: true,
  autoGenerate: true,
};

// Provider
export interface AltTextAIProviderProps {
  children: React.ReactNode;
  initialAltText?: string;
  config?: Partial<AltTextConfig>;
  onChange?: (altText: string) => void;
}

export const AltTextAIProvider: React.FC<AltTextAIProviderProps> = ({
  children,
  initialAltText = '',
  config: userConfig = {},
  onChange,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const [currentAltText, setCurrentAltText] = useState(initialAltText);
  const [suggestions, setSuggestions] = useState<AltTextSuggestion[]>([]);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const setAltText = useCallback((text: string) => {
    setCurrentAltText(text);
    onChange?.(text);
  }, [onChange]);

  const analyzeImage = useCallback(async (imageUrl: string) => {
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAnalysis: ImageAnalysis = {
      objects: ['mountain', 'lake', 'trees', 'sky'],
      scene: 'outdoor landscape',
      colors: ['blue', 'green', 'white'],
      text: undefined,
      faces: 0,
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  }, []);

  const generateAltText = useCallback(async (imageUrl: string) => {
    setIsGenerating(true);

    // Analyze first if not done
    if (!analysis) {
      await analyzeImage(imageUrl);
    }

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockSuggestions: AltTextSuggestion[] = [
      {
        id: '1',
        text: 'A serene mountain landscape with a crystal-clear lake reflecting snow-capped peaks, surrounded by lush green pine forests under a bright blue sky',
        confidence: 0.95,
        style: 'descriptive',
      },
      {
        id: '2',
        text: 'Mountain lake surrounded by pine trees',
        confidence: 0.88,
        style: 'concise',
      },
      {
        id: '3',
        text: 'Beautiful mountain scenery with alpine lake and forest - perfect nature getaway destination',
        confidence: 0.82,
        style: 'seo',
      },
    ];

    setSuggestions(mockSuggestions);
    setIsGenerating(false);
  }, [analysis, analyzeImage]);

  const applySuggestion = useCallback((suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      setAltText(suggestion.text);
    }
  }, [suggestions, setAltText]);

  const updateConfig = useCallback((updates: Partial<AltTextConfig>) => {
    // Config updates would trigger re-generation in a real implementation
  }, []);

  const value: AltTextAIContextType = {
    currentAltText,
    suggestions,
    analysis,
    isAnalyzing,
    isGenerating,
    config,
    setAltText,
    generateAltText,
    analyzeImage,
    applySuggestion,
    updateConfig,
  };

  return (
    <AltTextAIContext.Provider value={value}>
      {children}
    </AltTextAIContext.Provider>
  );
};

// Alt Text Input
export const AltTextInput: React.FC = () => {
  const { currentAltText, setAltText, config, isGenerating } = useAltTextAI();
  const remainingChars = config.maxLength - currentAltText.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>
          Alt Text
        </label>
        <span
          style={{
            fontSize: '12px',
            color: remainingChars < 20 ? '#dc2626' : '#6b7280',
          }}
        >
          {remainingChars} characters remaining
        </span>
      </div>
      <textarea
        value={currentAltText}
        onChange={(e) => setAltText(e.target.value)}
        placeholder="Describe this image for screen readers..."
        disabled={isGenerating}
        maxLength={config.maxLength}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
          resize: 'vertical',
          opacity: isGenerating ? 0.5 : 1,
        }}
      />
    </div>
  );
};

// Generate Button
export const GenerateButton: React.FC<{ imageUrl?: string }> = ({ imageUrl = '' }) => {
  const { generateAltText, isGenerating, isAnalyzing } = useAltTextAI();
  const isLoading = isGenerating || isAnalyzing;

  return (
    <button
      onClick={() => generateAltText(imageUrl)}
      disabled={isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
          </motion.div>
          {isAnalyzing ? 'Analyzing...' : 'Generating...'}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Generate with AI
        </>
      )}
    </button>
  );
};

// Suggestion Card
const SuggestionCard: React.FC<{ suggestion: AltTextSuggestion }> = ({ suggestion }) => {
  const { applySuggestion, currentAltText } = useAltTextAI();
  const isApplied = currentAltText === suggestion.text;

  const styleLabels = {
    descriptive: 'Detailed',
    concise: 'Brief',
    seo: 'SEO Optimized',
    decorative: 'Decorative',
  };

  const styleColors = {
    descriptive: '#3b82f6',
    concise: '#10b981',
    seo: '#f59e0b',
    decorative: '#6b7280',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '12px',
        border: '1px solid',
        borderColor: isApplied ? '#3b82f6' : '#e5e7eb',
        borderRadius: '8px',
        backgroundColor: isApplied ? '#eff6ff' : '#fff',
        cursor: 'pointer',
      }}
      onClick={() => applySuggestion(suggestion.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: `${styleColors[suggestion.style]}15`,
            color: styleColors[suggestion.style],
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {styleLabels[suggestion.style]}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {Math.round(suggestion.confidence * 100)}% confidence
        </span>
      </div>
      <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, margin: 0 }}>
        {suggestion.text}
      </p>
      {isApplied && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#3b82f6', fontSize: '12px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Applied
        </div>
      )}
    </motion.div>
  );
};

// Suggestions List
export const SuggestionsList: React.FC = () => {
  const { suggestions, isGenerating } = useAltTextAI();

  if (suggestions.length === 0 && !isGenerating) return null;

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>
        AI Suggestions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {suggestions.map(suggestion => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Image Analysis Display
export const AnalysisDisplay: React.FC = () => {
  const { analysis, isAnalyzing } = useAltTextAI();

  if (!analysis && !isAnalyzing) return null;

  if (isAnalyzing) {
    return (
      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: '24px', height: '24px', margin: '0 auto 8px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
        </motion.div>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Analyzing image...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}
    >
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '12px' }}>
        Image Analysis
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Scene</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>{analysis!.scene}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Objects</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {analysis!.objects.map(obj => (
              <span key={obj} style={{ padding: '2px 6px', backgroundColor: '#e5e7eb', borderRadius: '4px', fontSize: '11px', color: '#374151' }}>
                {obj}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Colors</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {analysis!.colors.map(color => (
              <div
                key={color}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: color,
                  border: '1px solid #d1d5db',
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Settings Panel
export const AltTextSettings: React.FC = () => {
  const { config, updateConfig } = useAltTextAI();

  return (
    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
        Settings
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.autoGenerate}
            onChange={(e) => updateConfig({ autoGenerate: e.target.checked })}
          />
          Auto-generate for new images
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.includeContext}
            onChange={(e) => updateConfig({ includeContext: e.target.checked })}
          />
          Include page context in generation
        </label>
      </div>

      <div style={{ marginTop: '12px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
          Default Style
        </label>
        <select
          value={config.defaultStyle}
          onChange={(e) => updateConfig({ defaultStyle: e.target.value as any })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#fff',
          }}
        >
          <option value="descriptive">Descriptive (Detailed)</option>
          <option value="concise">Concise (Brief)</option>
          <option value="seo">SEO Optimized</option>
        </select>
      </div>
    </div>
  );
};

// Main Component
export const AltTextAI: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
          AI Alt Text Generator
        </span>
      </div>

      <AltTextInput />

      <div style={{ marginTop: '12px' }}>
        <GenerateButton imageUrl={imageUrl} />
      </div>

      <SuggestionsList />
      <AnalysisDisplay />
    </div>
  );
};

export default AltTextAI;
