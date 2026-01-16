import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wand2,
  FileText,
  Search,
  MessageSquare,
  Globe,
  Image,
  Hash,
  BarChart3,
  Lightbulb,
  RefreshCw,
  Check,
  X,
  Lock,
  AlertTriangle,
  Settings,
  Zap,
  Copy,
  ChevronRight,
  Info,
  Shield
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// AI Tool Types
interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'content' | 'seo' | 'enhancement' | 'accessibility';
  usageLimit: number; // How many times can be used per post
  requiresSelection?: boolean; // If true, requires text selection
  inputLabel?: string;
  outputLabel?: string;
}

interface AIToolUsage {
  [toolId: string]: number;
}

interface AIToolsPanelProps {
  content: string;
  title: string;
  onApplyResult: (result: string, mode: 'replace' | 'append' | 'insert') => void;
  postId?: string;
  className?: string;
}

// AI Provider configuration check
interface AIProviderConfig {
  isConfigured: boolean;
  provider: string;
  model?: string;
}

// Simulated AI Provider check - in real app, this would check settings
function useAIProvider(): AIProviderConfig {
  // This would normally fetch from settings/API
  const [config] = useState<AIProviderConfig>({
    isConfigured: true, // Set to false to show configuration prompt
    provider: 'OpenAI',
    model: 'gpt-4'
  });
  return config;
}

// 10 AI Tools Definition
const aiTools: AITool[] = [
  {
    id: 'title-generator',
    name: 'Title Generator',
    description: 'Generate compelling, SEO-friendly titles based on your content',
    icon: Wand2,
    color: 'from-purple-500 to-pink-500',
    category: 'content',
    usageLimit: 1,
    outputLabel: 'Generated Titles'
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Create a concise summary of your post for excerpts and meta descriptions',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    category: 'content',
    usageLimit: 1,
    outputLabel: 'Summary'
  },
  {
    id: 'seo-optimizer',
    name: 'SEO Optimizer',
    description: 'Analyze and suggest SEO improvements for better search rankings',
    icon: Search,
    color: 'from-green-500 to-emerald-500',
    category: 'seo',
    usageLimit: 1,
    outputLabel: 'SEO Recommendations'
  },
  {
    id: 'grammar-checker',
    name: 'Grammar & Style',
    description: 'Check grammar, spelling, and writing style improvements',
    icon: MessageSquare,
    color: 'from-orange-500 to-amber-500',
    category: 'enhancement',
    usageLimit: 1,
    outputLabel: 'Corrections & Suggestions'
  },
  {
    id: 'tone-adjuster',
    name: 'Tone Adjuster',
    description: 'Rewrite content in a different tone (professional, casual, friendly, etc.)',
    icon: RefreshCw,
    color: 'from-rose-500 to-red-500',
    category: 'enhancement',
    usageLimit: 1,
    inputLabel: 'Select Tone',
    outputLabel: 'Adjusted Content'
  },
  {
    id: 'keyword-suggester',
    name: 'Keyword Suggester',
    description: 'Suggest relevant keywords and phrases to improve discoverability',
    icon: Hash,
    color: 'from-indigo-500 to-violet-500',
    category: 'seo',
    usageLimit: 1,
    outputLabel: 'Suggested Keywords'
  },
  {
    id: 'meta-generator',
    name: 'Meta Description',
    description: 'Generate optimized meta descriptions for search results',
    icon: BarChart3,
    color: 'from-teal-500 to-green-500',
    category: 'seo',
    usageLimit: 1,
    outputLabel: 'Meta Descriptions'
  },
  {
    id: 'alt-text-generator',
    name: 'Image Alt Text',
    description: 'Generate descriptive alt text for images in your content',
    icon: Image,
    color: 'from-sky-500 to-blue-500',
    category: 'accessibility',
    usageLimit: 1,
    outputLabel: 'Alt Text Suggestions'
  },
  {
    id: 'content-expander',
    name: 'Content Expander',
    description: 'Expand on ideas and add more depth to thin sections',
    icon: Lightbulb,
    color: 'from-yellow-500 to-orange-500',
    category: 'content',
    usageLimit: 1,
    requiresSelection: true,
    outputLabel: 'Expanded Content'
  },
  {
    id: 'translation-helper',
    name: 'Translation Helper',
    description: 'Translate content or suggest multilingual variations',
    icon: Globe,
    color: 'from-cyan-500 to-teal-500',
    category: 'enhancement',
    usageLimit: 1,
    inputLabel: 'Target Language',
    outputLabel: 'Translated Content'
  }
];

// Tone options for Tone Adjuster
const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'humorous', label: 'Humorous' },
  { value: 'authoritative', label: 'Authoritative' },
];

// Language options for Translation Helper
const languageOptions = [
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
];

// Simulated AI Response Generator
async function simulateAIResponse(tool: AITool, content: string, title: string, options?: any): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Generate mock responses based on tool
  switch (tool.id) {
    case 'title-generator':
      return `**Generated Title Options:**

1. "${title || 'Your Post'}: A Comprehensive Guide"
2. "The Ultimate Guide to ${title || 'This Topic'}"
3. "How to Master ${title || 'Your Subject'} in 2024"
4. "${title || 'Topic'}: Everything You Need to Know"
5. "Why ${title || 'This'} Matters More Than Ever"

*Select the title that best matches your content's intent and audience.*`;

    case 'content-summarizer':
      const wordCount = content.split(/\s+/).length;
      return `**Content Summary:**

This article covers key aspects of the topic in approximately ${wordCount} words. The main points include an introduction to the subject matter, detailed explanations of core concepts, and practical applications.

**Key Takeaways:**
- Main concept explained clearly
- Practical examples provided
- Actionable advice for readers

*Use this summary for your meta description or excerpt.*`;

    case 'seo-optimizer':
      return `**SEO Analysis & Recommendations:**

**Score: 72/100** *(Good, with room for improvement)*

**Strengths:**
- Content length is adequate (${content.split(/\s+/).length} words)
- Title is descriptive

**Improvements Needed:**
1. Add more internal links (currently found: 0)
2. Include target keywords in first paragraph
3. Add alt text to all images
4. Consider adding FAQ schema markup
5. Improve heading hierarchy (H2, H3 structure)

**Suggested Focus Keywords:**
- Primary: Based on your title
- Secondary: Related topic terms
- Long-tail: Question-based phrases`;

    case 'grammar-checker':
      return `**Grammar & Style Analysis:**

**Issues Found: 3**

1. **Line 2:** Consider using active voice instead of passive
2. **Paragraph 3:** Sentence is too long (42 words). Consider breaking it up.
3. **Throughout:** Inconsistent use of Oxford comma

**Style Suggestions:**
- Readability: Grade 10 level (consider simplifying for broader audience)
- Tone: Slightly formal
- Word variety: Good

**Quick Fixes Applied:**
- No critical errors detected
- Minor punctuation adjustments suggested`;

    case 'tone-adjuster':
      const tone = options?.tone || 'professional';
      return `**Content Adjusted to ${tone.charAt(0).toUpperCase() + tone.slice(1)} Tone:**

Your content has been analyzed and suggestions for a ${tone} tone have been generated.

**Example Transformation:**

*Original:* "You need to understand this concept."
*${tone.charAt(0).toUpperCase() + tone.slice(1)}:* "${
        tone === 'casual' ? "Let's break down this concept together!" :
        tone === 'friendly' ? "Here's a helpful way to think about this concept!" :
        tone === 'humorous' ? "Buckle up, because this concept is about to blow your mind!" :
        "It is essential to comprehend this fundamental concept."
      }"

*Review the suggestions and apply changes that fit your brand voice.*`;

    case 'keyword-suggester':
      return `**Keyword Suggestions:**

**Primary Keywords:**
- ${title?.split(' ')[0] || 'topic'} guide
- how to ${title?.split(' ')[0]?.toLowerCase() || 'topic'}
- ${title?.split(' ')[0] || 'topic'} tutorial

**Secondary Keywords:**
- best ${title?.split(' ')[0]?.toLowerCase() || 'practices'}
- ${title?.split(' ')[0] || 'topic'} tips
- ${title?.split(' ')[0] || 'topic'} examples

**Long-tail Keywords:**
- "how to get started with ${title?.split(' ')[0]?.toLowerCase() || 'topic'}"
- "complete guide to ${title?.split(' ')[0]?.toLowerCase() || 'topic'}"
- "${title?.split(' ')[0] || 'topic'} for beginners 2024"

**Keyword Density Recommendation:** 1-2% for primary keywords`;

    case 'meta-generator':
      return `**Meta Description Options:**

1. (155 chars) "Discover everything you need to know about ${title || 'this topic'}. Expert tips, practical advice, and actionable strategies inside."

2. (148 chars) "Looking for a comprehensive guide on ${title || 'this topic'}? Learn from experts and take your skills to the next level today."

3. (152 chars) "Master ${title || 'this topic'} with our in-depth guide. Get practical tips, expert insights, and step-by-step instructions for success."

*Choose the meta description that best represents your content and includes a call-to-action.*`;

    case 'alt-text-generator':
      return `**Image Alt Text Suggestions:**

*Scanning content for images...*

**Found 0 images without alt text**

**Best Practices for Alt Text:**
1. Be descriptive but concise (125 characters max)
2. Include relevant keywords naturally
3. Don't start with "Image of" or "Picture of"
4. Describe the image's purpose, not just appearance
5. Leave decorative images with empty alt=""

**Example Alt Texts:**
- "Dashboard showing analytics metrics and user engagement charts"
- "Step-by-step installation process flowchart"
- "Comparison table of features across three product tiers"`;

    case 'content-expander':
      return `**Expanded Content Suggestion:**

Based on your selected text, here's an expanded version:

---

${content.slice(0, 200)}...

**Additional Context:**
This concept is particularly important because it forms the foundation for understanding more advanced topics. When implementing this in practice, consider the following aspects:

1. **Background:** Understanding the historical context helps appreciate current best practices
2. **Practical Application:** Real-world examples demonstrate how this works in various scenarios
3. **Common Pitfalls:** Avoiding these mistakes will save time and resources
4. **Next Steps:** Building on this knowledge leads to more advanced techniques

---

*Copy and paste the expanded content where needed.*`;

    case 'translation-helper':
      const lang = options?.language || 'es';
      const langName = languageOptions.find(l => l.value === lang)?.label || 'Spanish';
      return `**Translation to ${langName}:**

*Note: This is a simplified translation. For production use, please verify with a native speaker.*

**Title Translation:**
"${title}" → "[${langName} translation would appear here]"

**Key Phrases:**
- "Read more" → "[Translation]"
- "Share this post" → "[Translation]"
- "Leave a comment" → "[Translation]"

**SEO Considerations for ${langName}:**
- Create separate URL slugs for translated content
- Use hreflang tags for language variants
- Consider cultural context in translations

*For full content translation, consider professional translation services.*`;

    default:
      return 'AI analysis complete. Results would appear here.';
  }
}

// Tool Card Component
function ToolCard({
  tool,
  usageCount,
  isSelected,
  onSelect,
  disabled
}: {
  tool: AITool;
  usageCount: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const Icon = tool.icon;
  const isUsed = usageCount >= tool.usageLimit;

  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled || isUsed}
      whileHover={{ scale: disabled || isUsed ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isUsed ? 1 : 0.98 }}
      className={clsx(
        'relative p-4 rounded-xl border-2 text-left transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isUsed
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
      )}
    >
      {/* Used Badge */}
      {isUsed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
          <Check size={12} />
          Used
        </div>
      )}

      <div className={clsx('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3', tool.color)}>
        <Icon size={20} className="text-white" />
      </div>

      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{tool.name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{tool.description}</p>

      <div className="flex items-center gap-2 mt-3">
        <span className={clsx(
          'px-2 py-0.5 text-xs font-medium rounded-full',
          tool.category === 'content' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
          tool.category === 'seo' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
          tool.category === 'enhancement' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
          tool.category === 'accessibility' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
        )}>
          {tool.category}
        </span>
        {!isUsed && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {tool.usageLimit - usageCount} use{tool.usageLimit - usageCount !== 1 ? 's' : ''} left
          </span>
        )}
      </div>
    </motion.button>
  );
}

// AI Configuration Prompt
function ConfigurationPrompt({ onConfigure }: { onConfigure: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
        <Settings size={32} className="text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        AI Provider Not Configured
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        To use AI-powered tools, you need to configure an AI provider in your settings.
        We support OpenAI, Anthropic, and other popular providers.
      </p>
      <button
        onClick={onConfigure}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
      >
        <Settings size={18} />
        Configure AI Provider
      </button>
    </div>
  );
}

// Main AI Tools Panel Component
export default function AIToolsPanel({
  content,
  title,
  onApplyResult,
  postId,
  className
}: AIToolsPanelProps) {
  const aiProvider = useAIProvider();
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toolUsage, setToolUsage] = useState<AIToolUsage>({});
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [filter, setFilter] = useState<string>('all');

  // Get usage count for a tool
  const getUsageCount = useCallback((toolId: string) => {
    return toolUsage[toolId] || 0;
  }, [toolUsage]);

  // Filter tools by category
  const filteredTools = useMemo(() => {
    if (filter === 'all') return aiTools;
    return aiTools.filter(t => t.category === filter);
  }, [filter]);

  // Run AI Tool
  const runTool = useCallback(async () => {
    if (!selectedTool) return;

    const usageCount = getUsageCount(selectedTool.id);
    if (usageCount >= selectedTool.usageLimit) {
      toast.error('You have already used this tool for this post');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const options = {
        tone: selectedTone,
        language: selectedLanguage
      };

      const aiResult = await simulateAIResponse(selectedTool, content, title, options);
      setResult(aiResult);

      // Update usage count
      setToolUsage(prev => ({
        ...prev,
        [selectedTool.id]: (prev[selectedTool.id] || 0) + 1
      }));

      toast.success(`${selectedTool.name} completed!`);
    } catch (error) {
      toast.error('AI processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedTool, content, title, selectedTone, selectedLanguage, getUsageCount]);

  // Copy result to clipboard
  const copyResult = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success('Copied to clipboard');
    }
  }, [result]);

  // If AI not configured
  if (!aiProvider.isConfigured) {
    return (
      <div className={clsx('ai-tools-panel', className)}>
        <ConfigurationPrompt onConfigure={() => toast('Navigate to Settings > AI Provider to configure')} />
      </div>
    );
  }

  return (
    <div className={clsx('ai-tools-panel', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Writing Tools</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by {aiProvider.provider}
            </p>
          </div>
        </div>

        {/* Usage Policy */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <Shield size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="text-xs text-amber-700 dark:text-amber-400">1 use per tool per post</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'content', 'seo', 'enhancement', 'accessibility'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {filteredTools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            usageCount={getUsageCount(tool.id)}
            isSelected={selectedTool?.id === tool.id}
            onSelect={() => setSelectedTool(tool)}
            disabled={isProcessing}
          />
        ))}
      </div>

      {/* Selected Tool Panel */}
      <AnimatePresence>
        {selectedTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={clsx('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', selectedTool.color)}>
                  {React.createElement(selectedTool.icon, { size: 16, className: 'text-white' })}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{selectedTool.name}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedTool(null);
                  setResult(null);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tool-specific options */}
            {selectedTool.id === 'tone-adjuster' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Tone
                </label>
                <select
                  value={selectedTone}
                  onChange={e => setSelectedTone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  {toneOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedTool.id === 'translation-helper' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Content Context Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
              <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This tool will analyze your current post content ({content.split(/\s+/).length} words) and title to provide contextual suggestions.
              </p>
            </div>

            {/* Run Button */}
            <button
              onClick={runTool}
              disabled={isProcessing || getUsageCount(selectedTool.id) >= selectedTool.usageLimit}
              className={clsx(
                'w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                isProcessing
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-wait'
                  : getUsageCount(selectedTool.id) >= selectedTool.usageLimit
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : getUsageCount(selectedTool.id) >= selectedTool.usageLimit ? (
                <>
                  <Check size={18} />
                  Already Used
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Run {selectedTool.name}
                </>
              )}
            </button>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedTool.outputLabel || 'Results'}
                  </span>
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {result}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Policy Footer */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Fair Usage Policy</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Each AI tool can be used once per post to ensure fair resource usage.
              Results are generated based on your content context and should be reviewed before publishing.
              AI suggestions are meant to assist, not replace, your creative judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
