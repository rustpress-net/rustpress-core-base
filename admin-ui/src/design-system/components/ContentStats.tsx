/**
 * ContentStats Component (Post Enhancement #3)
 * Word/character count with reading time and content analysis
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Clock,
  FileText,
  Hash,
  AlignLeft,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Target,
  Check,
  AlertCircle,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface ContentStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  averageWordLength: number;
  averageSentenceLength: number;
  longestWord: string;
  longestSentence: string;
  uniqueWords: number;
  vocabularyRichness: number;
}

export interface ContentStatsProps {
  content: string;
  variant?: 'compact' | 'detailed' | 'minimal' | 'inline';
  showReadingTime?: boolean;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  showParagraphCount?: boolean;
  wordsPerMinute?: number;
  targetWordCount?: number;
  onStatsChange?: (stats: ContentStats) => void;
  className?: string;
}

export interface ReadingTimeProps {
  content: string;
  wordsPerMinute?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export interface WordCountProps {
  content: string;
  target?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showIcon?: boolean;
  className?: string;
}

export interface ContentAnalysisProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export interface ReadabilityScoreProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
  className?: string;
}

export interface WritingGoalProps {
  current: number;
  target: number;
  type?: 'words' | 'characters' | 'time';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateStats(content: string, wordsPerMinute = 200): ContentStats {
  const text = content.trim();

  // Basic counts
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  // Reading and speaking time
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  const speakingTime = Math.ceil(wordCount / 150); // Average speaking rate

  // Word analysis
  const averageWordLength = wordCount > 0
    ? words.reduce((sum, word) => sum + word.length, 0) / wordCount
    : 0;
  const averageSentenceLength = sentences.length > 0
    ? wordCount / sentences.length
    : 0;
  const longestWord = words.reduce((longest, word) =>
    word.length > longest.length ? word : longest, '');
  const longestSentence = sentences.reduce((longest, sentence) =>
    sentence.length > longest.length ? sentence : longest, '');

  // Unique words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
  const vocabularyRichness = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;

  return {
    characters,
    charactersNoSpaces,
    words: wordCount,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    readingTime,
    speakingTime,
    averageWordLength,
    averageSentenceLength,
    longestWord,
    longestSentence,
    uniqueWords,
    vocabularyRichness,
  };
}

export function calculateReadabilityScore(content: string): {
  fleschKincaid: number;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
} {
  const text = content.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (words.length === 0 || sentences.length === 0) {
    return { fleschKincaid: 0, gradeLevel: 'N/A', difficulty: 'easy' };
  }

  // Flesch-Kincaid Reading Ease
  const fleschKincaid = 206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (syllables / words.length);

  const score = Math.max(0, Math.min(100, fleschKincaid));

  let gradeLevel: string;
  let difficulty: 'easy' | 'medium' | 'hard';

  if (score >= 90) {
    gradeLevel = '5th Grade';
    difficulty = 'easy';
  } else if (score >= 80) {
    gradeLevel = '6th Grade';
    difficulty = 'easy';
  } else if (score >= 70) {
    gradeLevel = '7th Grade';
    difficulty = 'easy';
  } else if (score >= 60) {
    gradeLevel = '8th-9th Grade';
    difficulty = 'medium';
  } else if (score >= 50) {
    gradeLevel = '10th-12th Grade';
    difficulty = 'medium';
  } else if (score >= 30) {
    gradeLevel = 'College';
    difficulty = 'hard';
  } else {
    gradeLevel = 'College Graduate';
    difficulty = 'hard';
  }

  return { fleschKincaid: score, gradeLevel, difficulty };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// ============================================================================
// ContentStats Component
// ============================================================================

export function ContentStatsDisplay({
  content,
  variant = 'compact',
  showReadingTime = true,
  showWordCount = true,
  showCharacterCount = false,
  showParagraphCount = false,
  wordsPerMinute = 200,
  targetWordCount,
  onStatsChange,
  className = '',
}: ContentStatsProps) {
  const stats = useMemo(() => calculateStats(content, wordsPerMinute), [content, wordsPerMinute]);

  useEffect(() => {
    onStatsChange?.(stats);
  }, [stats, onStatsChange]);

  const progress = targetWordCount ? (stats.words / targetWordCount) * 100 : 0;

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-3 text-sm text-neutral-500 ${className}`}>
        {showWordCount && <span>{stats.words} words</span>}
        {showReadingTime && <span>{stats.readingTime} min read</span>}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-4 ${className}`}>
        {showWordCount && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <Type className="w-4 h-4" />
            <span>{stats.words.toLocaleString()}</span>
          </div>
        )}
        {showCharacterCount && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <Hash className="w-4 h-4" />
            <span>{stats.characters.toLocaleString()}</span>
          </div>
        )}
        {showReadingTime && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>{stats.readingTime} min</span>
          </div>
        )}
        {showParagraphCount && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            <AlignLeft className="w-4 h-4" />
            <span>{stats.paragraphs}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-4 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg ${className}`}>
        {showWordCount && (
          <StatItem
            icon={<Type className="w-4 h-4" />}
            value={stats.words.toLocaleString()}
            label="words"
          />
        )}
        {showCharacterCount && (
          <StatItem
            icon={<Hash className="w-4 h-4" />}
            value={stats.characters.toLocaleString()}
            label="chars"
          />
        )}
        {showReadingTime && (
          <StatItem
            icon={<Clock className="w-4 h-4" />}
            value={`${stats.readingTime}`}
            label="min read"
          />
        )}
        {targetWordCount && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 ${className}`}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
          Content Statistics
        </h3>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Type className="w-5 h-5" />}
          label="Words"
          value={stats.words.toLocaleString()}
          target={targetWordCount}
        />
        <StatCard
          icon={<Hash className="w-5 h-5" />}
          label="Characters"
          value={stats.characters.toLocaleString()}
          subValue={`${stats.charactersNoSpaces.toLocaleString()} without spaces`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Reading Time"
          value={`${stats.readingTime} min`}
          subValue={`~${stats.speakingTime} min speaking`}
        />
        <StatCard
          icon={<AlignLeft className="w-5 h-5" />}
          label="Structure"
          value={`${stats.sentences} sentences`}
          subValue={`${stats.paragraphs} paragraphs`}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Avg. word length:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-white">
                {stats.averageWordLength.toFixed(1)} chars
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Avg. sentence:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-white">
                {stats.averageSentenceLength.toFixed(1)} words
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Unique words:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-white">
                {stats.uniqueWords.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Vocabulary richness:</span>
              <span className="ml-2 font-medium text-neutral-900 dark:text-white">
                {stats.vocabularyRichness.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-neutral-400">{icon}</span>
      <span className="font-medium text-neutral-900 dark:text-white">{value}</span>
      <span className="text-neutral-500 text-sm">{label}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  target,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  target?: number;
}) {
  const numericValue = parseInt(value.replace(/,/g, ''));
  const progress = target ? (numericValue / target) * 100 : null;

  return (
    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-neutral-400">{icon}</span>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900 dark:text-white">{value}</p>
      {subValue && (
        <p className="text-xs text-neutral-500 mt-1">{subValue}</p>
      )}
      {progress !== null && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-neutral-500">Goal: {target?.toLocaleString()}</span>
            <span className={progress >= 100 ? 'text-green-500' : 'text-neutral-500'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ReadingTime Component
// ============================================================================

export function ReadingTime({
  content,
  wordsPerMinute = 200,
  size = 'md',
  showIcon = true,
  className = '',
}: ReadingTimeProps) {
  const stats = useMemo(() => calculateStats(content, wordsPerMinute), [content, wordsPerMinute]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 ${sizeClasses[size]} ${className}`}>
      {showIcon && <Clock className={iconSizes[size]} />}
      <span>{stats.readingTime} min read</span>
    </div>
  );
}

// ============================================================================
// WordCount Component
// ============================================================================

export function WordCount({
  content,
  target,
  size = 'md',
  showProgress = false,
  showIcon = true,
  className = '',
}: WordCountProps) {
  const stats = useMemo(() => calculateStats(content), [content]);
  const progress = target ? (stats.words / target) * 100 : 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 ${sizeClasses[size]}`}>
        {showIcon && <Type className={iconSizes[size]} />}
        <span>{stats.words.toLocaleString()} words</span>
        {target && (
          <span className="text-neutral-400">/ {target.toLocaleString()}</span>
        )}
      </div>
      {showProgress && target && (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {progress >= 100 && <Check className="w-4 h-4 text-green-500" />}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ReadabilityScore Component
// ============================================================================

export function ReadabilityScore({
  content,
  size = 'md',
  showGrade = true,
  className = '',
}: ReadabilityScoreProps) {
  const { fleschKincaid, gradeLevel, difficulty } = useMemo(
    () => calculateReadabilityScore(content),
    [content]
  );

  const sizeClasses = {
    sm: { text: 'text-xs', score: 'text-lg', icon: 'w-4 h-4' },
    md: { text: 'text-sm', score: 'text-2xl', icon: 'w-5 h-5' },
    lg: { text: 'text-base', score: 'text-3xl', icon: 'w-6 h-6' },
  };

  const sizes = sizeClasses[size];

  const difficultyConfig = {
    easy: { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    hard: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
  };

  const config = difficultyConfig[difficulty];

  return (
    <div className={`${config.bg} rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${sizes.text} text-neutral-600 dark:text-neutral-400`}>
          Readability Score
        </span>
        <span className={`${sizes.text} font-medium capitalize ${config.color}`}>
          {difficulty}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`${sizes.score} font-bold ${config.color}`}>
          {fleschKincaid.toFixed(0)}
        </span>
        <span className="text-neutral-500">/100</span>
      </div>
      {showGrade && (
        <p className={`${sizes.text} text-neutral-500 mt-1`}>
          Reading level: {gradeLevel}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// WritingGoal Component
// ============================================================================

export function WritingGoal({
  current,
  target,
  type = 'words',
  size = 'md',
  showPercentage = true,
  className = '',
}: WritingGoalProps) {
  const progress = (current / target) * 100;
  const isComplete = progress >= 100;

  const sizeClasses = {
    sm: { text: 'text-xs', icon: 'w-4 h-4', bar: 'h-1.5' },
    md: { text: 'text-sm', icon: 'w-5 h-5', bar: 'h-2' },
    lg: { text: 'text-base', icon: 'w-6 h-6', bar: 'h-2.5' },
  };

  const sizes = sizeClasses[size];

  const typeLabels = {
    words: 'words',
    characters: 'characters',
    time: 'minutes',
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className={`${sizes.icon} ${isComplete ? 'text-green-500' : 'text-neutral-400'}`} />
          <span className={`${sizes.text} text-neutral-600 dark:text-neutral-400`}>
            {current.toLocaleString()} / {target.toLocaleString()} {typeLabels[type]}
          </span>
        </div>
        {showPercentage && (
          <span className={`${sizes.text} font-medium ${isComplete ? 'text-green-500' : 'text-neutral-900 dark:text-white'}`}>
            {Math.min(Math.round(progress), 100)}%
          </span>
        )}
      </div>
      <div className={`${sizes.bar} bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {isComplete && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400"
        >
          <Check className="w-4 h-4" />
          Goal reached!
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// ContentStatsDropdown Component
// ============================================================================

export interface ContentStatsDropdownProps {
  content: string;
  className?: string;
}

export function ContentStatsDropdown({ content, className = '' }: ContentStatsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const stats = useMemo(() => calculateStats(content), [content]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <Type className="w-4 h-4" />
        <span>{stats.words.toLocaleString()} words</span>
        <span className="text-neutral-400">•</span>
        <span>{stats.readingTime} min read</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 z-50"
          >
            <ContentStatsDisplay
              content={content}
              variant="detailed"
              showWordCount
              showCharacterCount
              showReadingTime
              showParagraphCount
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Alias for cleaner import
export { ContentStatsDisplay as ContentStats };

export default ContentStatsDisplay;
