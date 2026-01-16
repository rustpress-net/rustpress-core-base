import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Target,
  Clock,
  TrendingUp,
  Award,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Zap,
  BookOpen,
  Type,
  Hash,
  AlignLeft,
  BarChart2
} from 'lucide-react';
import clsx from 'clsx';

interface ContentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  headings: number;
  images: number;
  links: number;
  readingTime: number;
  speakingTime: number;
}

interface WordGoal {
  type: 'blog' | 'article' | 'essay' | 'book-chapter' | 'custom';
  label: string;
  minWords: number;
  maxWords: number;
  description: string;
}

interface WordCountTrackerSettings {
  showDetailedStats: boolean;
  showGoalProgress: boolean;
  showReadingTime: boolean;
  showWritingPace: boolean;
  wordsPerMinute: number;
  speakingWordsPerMinute: number;
  enableGoals: boolean;
  customGoal: number;
  showMilestones: boolean;
}

interface WordCountTrackerProps {
  content?: string;
  onGoalReached?: () => void;
  className?: string;
}

const wordGoals: WordGoal[] = [
  { type: 'blog', label: 'Blog Post', minWords: 300, maxWords: 800, description: 'Quick, scannable content' },
  { type: 'article', label: 'Article', minWords: 800, maxWords: 1500, description: 'In-depth coverage' },
  { type: 'essay', label: 'Long-form Essay', minWords: 1500, maxWords: 3000, description: 'Comprehensive analysis' },
  { type: 'book-chapter', label: 'Book Chapter', minWords: 3000, maxWords: 5000, description: 'Detailed chapter' },
  { type: 'custom', label: 'Custom', minWords: 0, maxWords: 10000, description: 'Set your own goal' }
];

const milestones = [100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000, 10000];

export const WordCountTracker: React.FC<WordCountTrackerProps> = ({
  content = '',
  onGoalReached,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<WordGoal>(wordGoals[1]);
  const [writingStartTime, setWritingStartTime] = useState<Date | null>(null);
  const [lastWordCount, setLastWordCount] = useState(0);
  const [writingPace, setWritingPace] = useState(0);
  const [settings, setSettings] = useState<WordCountTrackerSettings>({
    showDetailedStats: true,
    showGoalProgress: true,
    showReadingTime: true,
    showWritingPace: true,
    wordsPerMinute: 200,
    speakingWordsPerMinute: 150,
    enableGoals: true,
    customGoal: 1000,
    showMilestones: true
  });

  const stats = useMemo((): ContentStats => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length - images;
    const readingTime = Math.ceil(words / settings.wordsPerMinute);
    const speakingTime = Math.ceil(words / settings.speakingWordsPerMinute);

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      headings,
      images,
      links,
      readingTime,
      speakingTime
    };
  }, [content, settings.wordsPerMinute, settings.speakingWordsPerMinute]);

  // Track writing pace
  useEffect(() => {
    if (stats.words > lastWordCount && !writingStartTime) {
      setWritingStartTime(new Date());
    }

    if (writingStartTime && stats.words !== lastWordCount) {
      const elapsed = (Date.now() - writingStartTime.getTime()) / 60000; // minutes
      if (elapsed > 0) {
        setWritingPace(Math.round(stats.words / elapsed));
      }
    }

    setLastWordCount(stats.words);
  }, [stats.words, writingStartTime, lastWordCount]);

  const goalProgress = useMemo(() => {
    const target = selectedGoal.type === 'custom' ? settings.customGoal : selectedGoal.maxWords;
    const min = selectedGoal.type === 'custom' ? settings.customGoal * 0.8 : selectedGoal.minWords;
    const percentage = Math.min((stats.words / target) * 100, 100);
    const isInRange = stats.words >= min && stats.words <= target;
    const isUnder = stats.words < min;
    const isOver = stats.words > target;

    return { target, min, percentage, isInRange, isUnder, isOver };
  }, [stats.words, selectedGoal, settings.customGoal]);

  const reachedMilestones = useMemo(() => {
    return milestones.filter(m => stats.words >= m);
  }, [stats.words]);

  const nextMilestone = useMemo(() => {
    return milestones.find(m => stats.words < m) || null;
  }, [stats.words]);

  const getProgressColor = () => {
    if (goalProgress.isInRange) return 'bg-green-500';
    if (goalProgress.isUnder) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
    >
      {/* Compact Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <span className="font-bold text-xl">{stats.words.toLocaleString()}</span>
            <span className="text-gray-500 text-sm">words</span>
          </div>

          {settings.showReadingTime && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>{stats.readingTime} min read</span>
            </div>
          )}

          {settings.enableGoals && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress.percentage}%` }}
                  className={clsx('h-full rounded-full', getProgressColor())}
                />
              </div>
              <span className="text-xs text-gray-500">
                {Math.round(goalProgress.percentage)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {goalProgress.isInRange && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
              <CheckCircle size={12} />
              Goal reached!
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(!showSettings);
            }}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
          >
            <Settings size={16} />
          </button>
          <span className="text-gray-600 dark:text-gray-300">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
          >
            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings size={16} />
                  Tracker Settings
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showDetailedStats}
                      onChange={(e) => setSettings({ ...settings, showDetailedStats: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Detailed Stats</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showMilestones}
                      onChange={(e) => setSettings({ ...settings, showMilestones: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Milestones</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showWritingPace}
                      onChange={(e) => setSettings({ ...settings, showWritingPace: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Writing Pace</span>
                  </label>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Reading Speed (wpm)</label>
                    <input
                      type="number"
                      value={settings.wordsPerMinute}
                      onChange={(e) => setSettings({ ...settings, wordsPerMinute: parseInt(e.target.value) || 200 })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Goal Selection */}
            {settings.enableGoals && (
              <div className="p-4 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  Content Goal
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {wordGoals.map(goal => (
                    <button
                      key={goal.type}
                      onClick={() => setSelectedGoal(goal)}
                      className={clsx(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        selectedGoal.type === goal.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="font-medium text-sm">{goal.label}</div>
                      <div className="text-xs text-gray-500">
                        {goal.type === 'custom'
                          ? `${settings.customGoal.toLocaleString()} words`
                          : `${goal.minWords}-${goal.maxWords}`}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedGoal.type === 'custom' && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-600 block mb-1">Custom word goal</label>
                    <input
                      type="number"
                      value={settings.customGoal}
                      onChange={(e) => setSettings({ ...settings, customGoal: parseInt(e.target.value) || 1000 })}
                      className="w-full px-3 py-2 border rounded-lg"
                      step="100"
                    />
                  </div>
                )}

                {/* Goal Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {stats.words.toLocaleString()} / {goalProgress.target.toLocaleString()} words
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goalProgress.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={clsx('h-full rounded-full', getProgressColor())}
                    />
                    {/* Min marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                      style={{ left: `${(goalProgress.min / goalProgress.target) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: {goalProgress.min.toLocaleString()}</span>
                    <span>Target: {goalProgress.target.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Stats */}
            {settings.showDetailedStats && (
              <div className="p-4 border-b">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart2 size={16} className="text-purple-600" />
                  Content Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Type, label: 'Characters', value: stats.characters.toLocaleString() },
                    { icon: Type, label: 'No Spaces', value: stats.charactersNoSpaces.toLocaleString() },
                    { icon: AlignLeft, label: 'Sentences', value: stats.sentences },
                    { icon: FileText, label: 'Paragraphs', value: stats.paragraphs },
                    { icon: Hash, label: 'Headings', value: stats.headings },
                    { icon: BookOpen, label: 'Reading Time', value: `${stats.readingTime} min` },
                    { icon: Zap, label: 'Speaking Time', value: `${stats.speakingTime} min` },
                    { icon: TrendingUp, label: 'Writing Pace', value: settings.showWritingPace ? `${writingPace} wpm` : 'N/A' }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <stat.icon size={18} className="text-gray-500" />
                      <div>
                        <div className="font-bold">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {settings.showMilestones && (
              <div className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-600" />
                  Milestones
                </h4>
                <div className="flex flex-wrap gap-2">
                  {milestones.map(milestone => {
                    const isReached = stats.words >= milestone;
                    const isNext = milestone === nextMilestone;
                    return (
                      <motion.div
                        key={milestone}
                        initial={isReached ? { scale: 1 } : { scale: 0.9 }}
                        animate={isReached ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        className={clsx(
                          'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1',
                          isReached && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                          isNext && !isReached && 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-blue-900/30',
                          !isReached && !isNext && 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {isReached && <CheckCircle size={14} />}
                        {isNext && !isReached && <Target size={14} />}
                        {milestone.toLocaleString()}
                      </motion.div>
                    );
                  })}
                </div>
                {nextMilestone && (
                  <p className="text-sm text-gray-500 mt-3">
                    <TrendingUp size={14} className="inline mr-1" />
                    {(nextMilestone - stats.words).toLocaleString()} words to next milestone ({nextMilestone.toLocaleString()})
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WordCountTracker;
