import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Eye,
  BarChart3,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Target,
  Clock,
  Users,
  Zap,
  Hash,
  Type,
  List,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import clsx from 'clsx'

interface ReadabilityScoreProps {
  content: string
  title?: string
  targetAudience?: 'general' | 'academic' | 'technical' | 'children' | 'business'
  className?: string
}

interface ReadabilityMetric {
  id: string
  name: string
  value: number | string
  maxValue?: number
  status: 'good' | 'ok' | 'poor'
  description: string
  suggestion?: string
}

interface ReadabilityIndex {
  id: string
  name: string
  score: number
  grade: string
  description: string
  range: string
}

const audienceLevels = {
  general: { minGrade: 7, maxGrade: 9, name: 'General Public' },
  academic: { minGrade: 12, maxGrade: 16, name: 'Academic' },
  technical: { minGrade: 10, maxGrade: 14, name: 'Technical' },
  children: { minGrade: 3, maxGrade: 6, name: 'Children' },
  business: { minGrade: 8, maxGrade: 11, name: 'Business' },
}

export default function ReadabilityScore({
  content,
  title = '',
  targetAudience = 'general',
  className,
}: ReadabilityScoreProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'metrics'])
  const [showDetails, setShowDetails] = useState(false)

  // Strip HTML for analysis
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Get sentences from text
  const getSentences = (text: string): string[] => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  }

  // Get words from text
  const getWords = (text: string): string[] => {
    return text.split(/\s+/).filter(w => w.length > 0)
  }

  // Count syllables in a word
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, '')
    if (word.length <= 3) return 1

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  // Analyze content
  const analysis = useMemo(() => {
    const plainText = stripHtml(content)
    const sentences = getSentences(plainText)
    const words = getWords(plainText)
    const paragraphs = content.split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>/gi).filter(p => stripHtml(p).trim().length > 0)

    const wordCount = words.length
    const sentenceCount = sentences.length
    const paragraphCount = paragraphs.length
    const characterCount = plainText.replace(/\s/g, '').length
    const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0)

    const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0
    const avgSentencesPerParagraph = paragraphCount > 0 ? sentenceCount / paragraphCount : 0

    // Complex words (3+ syllables)
    const complexWords = words.filter(w => countSyllables(w) >= 3)
    const complexWordPercentage = wordCount > 0 ? (complexWords.length / wordCount) * 100 : 0

    // Passive voice detection (simplified)
    const passivePatterns = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi
    const passiveMatches = plainText.match(passivePatterns) || []
    const passivePercentage = sentenceCount > 0 ? (passiveMatches.length / sentenceCount) * 100 : 0

    // Transition words
    const transitionWords = [
      'however', 'therefore', 'moreover', 'furthermore', 'additionally',
      'consequently', 'meanwhile', 'nevertheless', 'nonetheless', 'thus',
      'hence', 'accordingly', 'similarly', 'likewise', 'conversely',
      'first', 'second', 'third', 'finally', 'lastly', 'next', 'then',
      'in addition', 'for example', 'for instance', 'in contrast',
      'on the other hand', 'as a result', 'in conclusion', 'to summarize',
    ]
    const transitionCount = transitionWords.reduce((count, tw) => {
      const regex = new RegExp(`\\b${tw}\\b`, 'gi')
      return count + (plainText.match(regex) || []).length
    }, 0)
    const transitionPercentage = sentenceCount > 0 ? (transitionCount / sentenceCount) * 100 : 0

    // Long sentences (>20 words)
    const longSentences = sentences.filter(s => getWords(s).length > 20)
    const longSentencePercentage = sentenceCount > 0 ? (longSentences.length / sentenceCount) * 100 : 0

    // Short paragraphs
    const shortParagraphs = paragraphs.filter(p => getSentences(stripHtml(p)).length <= 3)
    const shortParagraphPercentage = paragraphCount > 0 ? (shortParagraphs.length / paragraphCount) * 100 : 0

    // Readability indices
    // Flesch Reading Ease
    const fleschReadingEase = wordCount > 0 && sentenceCount > 0
      ? 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
      : 0

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = wordCount > 0 && sentenceCount > 0
      ? (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
      : 0

    // Gunning Fog Index
    const gunningFog = wordCount > 0 && sentenceCount > 0
      ? 0.4 * (avgWordsPerSentence + complexWordPercentage)
      : 0

    // SMOG Index
    const smogIndex = sentenceCount >= 30
      ? 1.043 * Math.sqrt(complexWords.length * (30 / sentenceCount)) + 3.1291
      : 0

    // Coleman-Liau Index
    const L = wordCount > 0 ? (characterCount / wordCount) * 100 : 0
    const S = wordCount > 0 ? (sentenceCount / wordCount) * 100 : 0
    const colemanLiau = (0.0588 * L) - (0.296 * S) - 15.8

    // Automated Readability Index
    const ari = wordCount > 0 && sentenceCount > 0
      ? (4.71 * (characterCount / wordCount)) + (0.5 * avgWordsPerSentence) - 21.43
      : 0

    // Reading time (average 200 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    return {
      wordCount,
      sentenceCount,
      paragraphCount,
      characterCount,
      syllableCount,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      avgSentencesPerParagraph,
      complexWordPercentage,
      passivePercentage,
      transitionPercentage,
      longSentencePercentage,
      shortParagraphPercentage,
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFog,
      smogIndex,
      colemanLiau,
      ari,
      readingTimeMinutes,
      complexWords: complexWords.slice(0, 10),
      longSentences: longSentences.slice(0, 5),
    }
  }, [content])

  // Calculate overall score based on target audience
  const overallScore = useMemo(() => {
    const target = audienceLevels[targetAudience]
    const gradeLevel = analysis.fleschKincaidGrade

    // Score based on how close to target
    if (gradeLevel >= target.minGrade && gradeLevel <= target.maxGrade) {
      return 100
    }

    const distance = gradeLevel < target.minGrade
      ? target.minGrade - gradeLevel
      : gradeLevel - target.maxGrade

    return Math.max(0, 100 - (distance * 10))
  }, [analysis, targetAudience])

  // Readability indices
  const readabilityIndices: ReadabilityIndex[] = [
    {
      id: 'flesch',
      name: 'Flesch Reading Ease',
      score: Math.max(0, Math.min(100, analysis.fleschReadingEase)),
      grade: getFleschGrade(analysis.fleschReadingEase),
      description: 'Higher scores indicate easier readability',
      range: '0-100',
    },
    {
      id: 'flesch-kincaid',
      name: 'Flesch-Kincaid Grade',
      score: Math.max(0, Math.min(18, analysis.fleschKincaidGrade)),
      grade: `Grade ${Math.round(analysis.fleschKincaidGrade)}`,
      description: 'US school grade level required to understand',
      range: 'Grade 1-18',
    },
    {
      id: 'gunning-fog',
      name: 'Gunning Fog Index',
      score: Math.max(0, Math.min(18, analysis.gunningFog)),
      grade: `${Math.round(analysis.gunningFog)} years`,
      description: 'Years of education needed to understand',
      range: '6-18 years',
    },
    {
      id: 'coleman-liau',
      name: 'Coleman-Liau Index',
      score: Math.max(0, Math.min(18, analysis.colemanLiau)),
      grade: `Grade ${Math.round(analysis.colemanLiau)}`,
      description: 'Grade level based on characters and sentences',
      range: 'Grade 1-18',
    },
    {
      id: 'ari',
      name: 'Automated Readability',
      score: Math.max(0, Math.min(18, analysis.ari)),
      grade: `Grade ${Math.round(analysis.ari)}`,
      description: 'Character-based grade level estimate',
      range: 'Grade 1-18',
    },
  ]

  function getFleschGrade(score: number): string {
    if (score >= 90) return 'Very Easy'
    if (score >= 80) return 'Easy'
    if (score >= 70) return 'Fairly Easy'
    if (score >= 60) return 'Standard'
    if (score >= 50) return 'Fairly Difficult'
    if (score >= 30) return 'Difficult'
    return 'Very Difficult'
  }

  // Metrics
  const metrics: ReadabilityMetric[] = [
    {
      id: 'words-per-sentence',
      name: 'Words per Sentence',
      value: analysis.avgWordsPerSentence.toFixed(1),
      maxValue: 25,
      status: analysis.avgWordsPerSentence <= 15 ? 'good' : analysis.avgWordsPerSentence <= 20 ? 'ok' : 'poor',
      description: 'Average number of words in each sentence',
      suggestion: analysis.avgWordsPerSentence > 20 ? 'Break long sentences into shorter ones' : undefined,
    },
    {
      id: 'long-sentences',
      name: 'Long Sentences',
      value: `${analysis.longSentencePercentage.toFixed(0)}%`,
      status: analysis.longSentencePercentage <= 20 ? 'good' : analysis.longSentencePercentage <= 30 ? 'ok' : 'poor',
      description: 'Percentage of sentences with 20+ words',
      suggestion: analysis.longSentencePercentage > 30 ? 'Reduce long sentences to improve flow' : undefined,
    },
    {
      id: 'passive-voice',
      name: 'Passive Voice',
      value: `${analysis.passivePercentage.toFixed(0)}%`,
      status: analysis.passivePercentage <= 10 ? 'good' : analysis.passivePercentage <= 20 ? 'ok' : 'poor',
      description: 'Percentage of sentences using passive voice',
      suggestion: analysis.passivePercentage > 20 ? 'Use active voice for clearer writing' : undefined,
    },
    {
      id: 'transition-words',
      name: 'Transition Words',
      value: `${analysis.transitionPercentage.toFixed(0)}%`,
      status: analysis.transitionPercentage >= 25 ? 'good' : analysis.transitionPercentage >= 15 ? 'ok' : 'poor',
      description: 'Percentage of sentences with transition words',
      suggestion: analysis.transitionPercentage < 25 ? 'Add transition words to improve flow' : undefined,
    },
    {
      id: 'complex-words',
      name: 'Complex Words',
      value: `${analysis.complexWordPercentage.toFixed(0)}%`,
      status: analysis.complexWordPercentage <= 10 ? 'good' : analysis.complexWordPercentage <= 15 ? 'ok' : 'poor',
      description: 'Percentage of words with 3+ syllables',
      suggestion: analysis.complexWordPercentage > 15 ? 'Use simpler words where possible' : undefined,
    },
    {
      id: 'paragraph-length',
      name: 'Short Paragraphs',
      value: `${analysis.shortParagraphPercentage.toFixed(0)}%`,
      status: analysis.shortParagraphPercentage >= 70 ? 'good' : analysis.shortParagraphPercentage >= 50 ? 'ok' : 'poor',
      description: 'Percentage of paragraphs with 3 or fewer sentences',
      suggestion: analysis.shortParagraphPercentage < 50 ? 'Break up long paragraphs' : undefined,
    },
  ]

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'ok': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'poor': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Readability Analysis</h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetAudience}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            {Object.entries(audienceLevels).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Overview */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          {/* Overall Score */}
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * overallScore) / 100}
                className={getScoreColor(overallScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={clsx('text-2xl font-bold', getScoreColor(overallScore))}>
                {Math.round(overallScore)}
              </span>
              <span className="text-xs text-gray-500">Score</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.wordCount}
              </div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.sentenceCount}
              </div>
              <div className="text-xs text-gray-500">Sentences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.paragraphCount}
              </div>
              <div className="text-xs text-gray-500">Paragraphs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                <Clock className="w-5 h-5" />
                {analysis.readingTimeMinutes}
              </div>
              <div className="text-xs text-gray-500">Min read</div>
            </div>
          </div>
        </div>

        {/* Grade Level Summary */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Reading Level: </span>
              <span className={clsx('font-bold', getScoreColor(overallScore))}>
                Grade {Math.round(analysis.fleschKincaidGrade)}
              </span>
              <span className="text-gray-500 ml-2">
                ({getFleschGrade(analysis.fleschReadingEase)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Target: {audienceLevels[targetAudience].name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
        {/* Readability Indices */}
        <div>
          <button
            onClick={() => toggleSection('indices')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              <span className="font-medium">Readability Indices</span>
            </div>
            {expandedSections.includes('indices') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.includes('indices') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {readabilityIndices.map(index => (
                    <div key={index.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{index.name}</span>
                        <span className="text-sm font-bold">{index.grade}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', getScoreBgColor(
                            index.id === 'flesch' ? index.score : (18 - index.score) / 18 * 100
                          ))}
                          style={{ width: `${index.id === 'flesch' ? index.score : (index.score / 18) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{index.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Metrics */}
        <div>
          <button
            onClick={() => toggleSection('metrics')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-primary-600" />
              <span className="font-medium">Writing Metrics</span>
            </div>
            {expandedSections.includes('metrics') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.includes('metrics') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {metrics.map(metric => (
                    <div key={metric.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(metric.status)}
                          <span className="font-medium text-sm">{metric.name}</span>
                        </div>
                        <span className="text-sm font-bold">{metric.value}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                      {metric.suggestion && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                          <Lightbulb className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-yellow-800 dark:text-yellow-200">{metric.suggestion}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <div>
          <button
            onClick={() => toggleSection('suggestions')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-4 h-4 text-primary-600" />
              <span className="font-medium">Improvement Suggestions</span>
            </div>
            {expandedSections.includes('suggestions') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.includes('suggestions') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {analysis.complexWords.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4" />
                        Complex Words Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.complexWords.map((word, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Consider using simpler alternatives for these words
                      </p>
                    </div>
                  )}

                  {analysis.longSentences.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                        <Type className="w-4 h-4" />
                        Long Sentences to Review
                      </h4>
                      <div className="space-y-2">
                        {analysis.longSentences.map((sentence, i) => (
                          <div
                            key={i}
                            className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-200"
                          >
                            "{sentence.substring(0, 100)}..."
                            <span className="ml-2 text-red-600 dark:text-red-400">
                              ({getWords(sentence).length} words)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {metrics.filter(m => m.suggestion).length === 0 && analysis.complexWords.length === 0 && analysis.longSentences.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>Great job! Your content is well-written and readable.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
