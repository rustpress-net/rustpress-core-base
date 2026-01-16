import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Link,
  Image,
  FileText,
  Hash,
  BarChart3,
  Target,
  Zap,
  Globe,
  Share2,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Lightbulb,
} from 'lucide-react'
import clsx from 'clsx'

interface SEOAnalyzerProps {
  title: string
  content: string
  excerpt?: string
  slug?: string
  focusKeyword?: string
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  categories?: string[]
  tags?: string[]
  url?: string
  onChange?: (field: string, value: string) => void
  className?: string
}

interface SEOCheck {
  id: string
  category: 'title' | 'content' | 'meta' | 'keyword' | 'readability' | 'links' | 'images'
  name: string
  description: string
  status: 'pass' | 'warning' | 'fail' | 'info'
  score: number
  maxScore: number
  suggestion?: string
  details?: string[]
}

interface KeywordData {
  keyword: string
  count: number
  density: number
  inTitle: boolean
  inMeta: boolean
  inFirstParagraph: boolean
  inHeadings: boolean
  inUrl: boolean
  inImageAlt: boolean
}

const categoryIcons = {
  title: <FileText className="w-4 h-4" />,
  content: <FileText className="w-4 h-4" />,
  meta: <Globe className="w-4 h-4" />,
  keyword: <Target className="w-4 h-4" />,
  readability: <Eye className="w-4 h-4" />,
  links: <Link className="w-4 h-4" />,
  images: <Image className="w-4 h-4" />,
}

const categoryNames = {
  title: 'Title & Headings',
  content: 'Content Quality',
  meta: 'Meta Information',
  keyword: 'Focus Keyword',
  readability: 'Readability',
  links: 'Links',
  images: 'Images',
}

export default function SEOAnalyzer({
  title,
  content,
  excerpt,
  slug,
  focusKeyword = '',
  metaTitle,
  metaDescription,
  featuredImage,
  categories = [],
  tags = [],
  url,
  onChange,
  className,
}: SEOAnalyzerProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['keyword', 'title'])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'checks' | 'keywords' | 'preview'>('checks')

  // Strip HTML for text analysis
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const plainContent = useMemo(() => stripHtml(content), [content])
  const wordCount = useMemo(() => plainContent.split(/\s+/).filter(Boolean).length, [plainContent])

  // Analyze focus keyword
  const keywordData = useMemo((): KeywordData | null => {
    if (!focusKeyword) return null

    const keyword = focusKeyword.toLowerCase()
    const contentLower = plainContent.toLowerCase()
    const titleLower = title.toLowerCase()
    const metaTitleLower = (metaTitle || title).toLowerCase()
    const metaDescLower = (metaDescription || '').toLowerCase()
    const slugLower = (slug || '').toLowerCase()

    // Count occurrences
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = contentLower.match(regex)
    const count = matches ? matches.length : 0
    const density = wordCount > 0 ? (count / wordCount) * 100 : 0

    // Check positions
    const firstParagraph = plainContent.substring(0, 300).toLowerCase()
    const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || []
    const headingsText = headings.join(' ').toLowerCase()
    const imageAlts = content.match(/alt="([^"]*)"/gi) || []
    const altsText = imageAlts.join(' ').toLowerCase()

    return {
      keyword: focusKeyword,
      count,
      density,
      inTitle: titleLower.includes(keyword),
      inMeta: metaTitleLower.includes(keyword) && metaDescLower.includes(keyword),
      inFirstParagraph: firstParagraph.includes(keyword),
      inHeadings: headingsText.includes(keyword),
      inUrl: slugLower.includes(keyword.replace(/\s+/g, '-')),
      inImageAlt: altsText.includes(keyword),
    }
  }, [focusKeyword, plainContent, title, metaTitle, metaDescription, slug, content, wordCount])

  // Run SEO checks
  const seoChecks = useMemo((): SEOCheck[] => {
    const checks: SEOCheck[] = []
    const effectiveMetaTitle = metaTitle || title
    const effectiveMetaDesc = metaDescription || excerpt || ''

    // Title checks
    const titleLength = title.length
    checks.push({
      id: 'title-length',
      category: 'title',
      name: 'Title Length',
      description: 'Title should be between 30-60 characters',
      status: titleLength >= 30 && titleLength <= 60 ? 'pass' : titleLength > 0 ? 'warning' : 'fail',
      score: titleLength >= 30 && titleLength <= 60 ? 10 : titleLength > 0 ? 5 : 0,
      maxScore: 10,
      suggestion: titleLength < 30
        ? 'Your title is too short. Aim for 30-60 characters.'
        : titleLength > 60
        ? 'Your title is too long. Keep it under 60 characters.'
        : undefined,
      details: [`Current length: ${titleLength} characters`],
    })

    checks.push({
      id: 'title-keyword',
      category: 'title',
      name: 'Keyword in Title',
      description: 'Focus keyword should appear in the title',
      status: keywordData?.inTitle ? 'pass' : focusKeyword ? 'fail' : 'info',
      score: keywordData?.inTitle ? 15 : 0,
      maxScore: 15,
      suggestion: focusKeyword && !keywordData?.inTitle
        ? `Add your focus keyword "${focusKeyword}" to the title`
        : undefined,
    })

    // Content checks
    checks.push({
      id: 'content-length',
      category: 'content',
      name: 'Content Length',
      description: 'Content should be at least 300 words for good SEO',
      status: wordCount >= 300 ? 'pass' : wordCount >= 150 ? 'warning' : 'fail',
      score: wordCount >= 300 ? 15 : wordCount >= 150 ? 8 : 0,
      maxScore: 15,
      suggestion: wordCount < 300
        ? `Add ${300 - wordCount} more words for better SEO`
        : undefined,
      details: [`Current word count: ${wordCount}`],
    })

    const headings = content.match(/<h[2-6][^>]*>/gi) || []
    checks.push({
      id: 'subheadings',
      category: 'content',
      name: 'Subheadings',
      description: 'Use subheadings (H2-H6) to structure your content',
      status: headings.length >= 2 ? 'pass' : headings.length === 1 ? 'warning' : 'fail',
      score: headings.length >= 2 ? 10 : headings.length * 5,
      maxScore: 10,
      suggestion: headings.length < 2
        ? 'Add more subheadings to improve content structure'
        : undefined,
      details: [`Found ${headings.length} subheading(s)`],
    })

    // Meta checks
    const metaTitleLen = effectiveMetaTitle.length
    checks.push({
      id: 'meta-title',
      category: 'meta',
      name: 'Meta Title Length',
      description: 'Meta title should be 50-60 characters',
      status: metaTitleLen >= 50 && metaTitleLen <= 60 ? 'pass' : metaTitleLen > 0 ? 'warning' : 'fail',
      score: metaTitleLen >= 50 && metaTitleLen <= 60 ? 10 : metaTitleLen > 0 ? 5 : 0,
      maxScore: 10,
      details: [`Current length: ${metaTitleLen} characters`],
    })

    const metaDescLen = effectiveMetaDesc.length
    checks.push({
      id: 'meta-description',
      category: 'meta',
      name: 'Meta Description Length',
      description: 'Meta description should be 120-160 characters',
      status: metaDescLen >= 120 && metaDescLen <= 160 ? 'pass' : metaDescLen > 0 ? 'warning' : 'fail',
      score: metaDescLen >= 120 && metaDescLen <= 160 ? 10 : metaDescLen > 0 ? 5 : 0,
      maxScore: 10,
      suggestion: metaDescLen < 120
        ? 'Expand your meta description to 120-160 characters'
        : metaDescLen > 160
        ? 'Shorten your meta description to under 160 characters'
        : undefined,
      details: [`Current length: ${metaDescLen} characters`],
    })

    // Focus keyword checks
    if (focusKeyword) {
      checks.push({
        id: 'keyword-density',
        category: 'keyword',
        name: 'Keyword Density',
        description: 'Keyword density should be between 0.5% and 2.5%',
        status: keywordData && keywordData.density >= 0.5 && keywordData.density <= 2.5
          ? 'pass'
          : keywordData && keywordData.density > 0
          ? 'warning'
          : 'fail',
        score: keywordData && keywordData.density >= 0.5 && keywordData.density <= 2.5 ? 10 : 0,
        maxScore: 10,
        details: keywordData ? [
          `Keyword appears ${keywordData.count} times`,
          `Density: ${keywordData.density.toFixed(2)}%`,
        ] : undefined,
      })

      checks.push({
        id: 'keyword-first-paragraph',
        category: 'keyword',
        name: 'Keyword in First Paragraph',
        description: 'Focus keyword should appear in the first paragraph',
        status: keywordData?.inFirstParagraph ? 'pass' : 'fail',
        score: keywordData?.inFirstParagraph ? 10 : 0,
        maxScore: 10,
        suggestion: !keywordData?.inFirstParagraph
          ? 'Add your focus keyword to the first paragraph'
          : undefined,
      })

      checks.push({
        id: 'keyword-meta',
        category: 'keyword',
        name: 'Keyword in Meta',
        description: 'Focus keyword should appear in meta title and description',
        status: keywordData?.inMeta ? 'pass' : 'warning',
        score: keywordData?.inMeta ? 10 : 0,
        maxScore: 10,
      })

      checks.push({
        id: 'keyword-url',
        category: 'keyword',
        name: 'Keyword in URL',
        description: 'Focus keyword should appear in the URL slug',
        status: keywordData?.inUrl ? 'pass' : 'warning',
        score: keywordData?.inUrl ? 5 : 0,
        maxScore: 5,
      })
    } else {
      checks.push({
        id: 'no-keyword',
        category: 'keyword',
        name: 'No Focus Keyword',
        description: 'Set a focus keyword to improve SEO targeting',
        status: 'fail',
        score: 0,
        maxScore: 35,
        suggestion: 'Enter a focus keyword to analyze keyword optimization',
      })
    }

    // Links checks
    const internalLinks = content.match(/href="\/[^"]*"/gi) || []
    const externalLinks = content.match(/href="https?:\/\/[^"]*"/gi) || []

    checks.push({
      id: 'internal-links',
      category: 'links',
      name: 'Internal Links',
      description: 'Include internal links to other content',
      status: internalLinks.length >= 2 ? 'pass' : internalLinks.length >= 1 ? 'warning' : 'fail',
      score: Math.min(internalLinks.length * 2, 10),
      maxScore: 10,
      details: [`Found ${internalLinks.length} internal link(s)`],
    })

    checks.push({
      id: 'external-links',
      category: 'links',
      name: 'External Links',
      description: 'Include authoritative external links',
      status: externalLinks.length >= 1 ? 'pass' : 'warning',
      score: externalLinks.length >= 1 ? 5 : 0,
      maxScore: 5,
      details: [`Found ${externalLinks.length} external link(s)`],
    })

    // Images checks
    const images = content.match(/<img[^>]*>/gi) || []
    const imagesWithAlt = content.match(/<img[^>]*alt="[^"]+"/gi) || []

    checks.push({
      id: 'featured-image',
      category: 'images',
      name: 'Featured Image',
      description: 'Set a featured image for the post',
      status: featuredImage ? 'pass' : 'fail',
      score: featuredImage ? 10 : 0,
      maxScore: 10,
    })

    checks.push({
      id: 'image-alt-tags',
      category: 'images',
      name: 'Image Alt Tags',
      description: 'All images should have descriptive alt text',
      status: images.length === 0 || imagesWithAlt.length === images.length
        ? 'pass'
        : imagesWithAlt.length > 0
        ? 'warning'
        : images.length > 0
        ? 'fail'
        : 'info',
      score: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 10) : 10,
      maxScore: 10,
      details: images.length > 0 ? [
        `${imagesWithAlt.length} of ${images.length} images have alt text`,
      ] : undefined,
    })

    return checks
  }, [title, content, plainContent, wordCount, focusKeyword, keywordData, metaTitle, metaDescription, excerpt, slug, featuredImage])

  // Calculate overall score
  const overallScore = useMemo(() => {
    const totalScore = seoChecks.reduce((sum, check) => sum + check.score, 0)
    const maxScore = seoChecks.reduce((sum, check) => sum + check.maxScore, 0)
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  }, [seoChecks])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const groupedChecks = useMemo(() => {
    const groups: Record<string, SEOCheck[]> = {}
    seoChecks.forEach(check => {
      if (!groups[check.category]) groups[check.category] = []
      groups[check.category].push(check)
    })
    return groups
  }, [seoChecks])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleReanalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => setIsAnalyzing(false), 500)
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">SEO Analyzer</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReanalyze}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Re-analyze"
          >
            <RefreshCw className={clsx('w-4 h-4', isAnalyzing && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showPreview
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="SERP Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * overallScore) / 100}
                className={getScoreColor(overallScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={clsx('text-xl font-bold', getScoreColor(overallScore))}>
                {overallScore}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-medium mb-1">SEO Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {overallScore >= 80 && 'Great job! Your content is well optimized.'}
              {overallScore >= 60 && overallScore < 80 && 'Good progress. A few improvements can boost your score.'}
              {overallScore >= 40 && overallScore < 60 && 'Your content needs optimization.'}
              {overallScore < 40 && 'Significant improvements needed for better SEO.'}
            </p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {seoChecks.filter(c => c.status === 'pass').length} passed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                {seoChecks.filter(c => c.status === 'warning').length} warnings
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-500" />
                {seoChecks.filter(c => c.status === 'fail').length} failed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Keyword Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium mb-2">
          Focus Keyword
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={focusKeyword}
            onChange={e => onChange?.('focusKeyword', e.target.value)}
            placeholder="Enter your focus keyword..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
          {keywordData && (
            <div className="flex items-center gap-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-500">
                {keywordData.count}x ({keywordData.density.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['checks', 'keywords', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'checks' && 'SEO Checks'}
            {tab === 'keywords' && 'Keywords'}
            {tab === 'preview' && 'SERP Preview'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'checks' && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(groupedChecks).map(([category, checks]) => {
              const categoryScore = checks.reduce((sum, c) => sum + c.score, 0)
              const categoryMax = checks.reduce((sum, c) => sum + c.maxScore, 0)
              const categoryPercent = categoryMax > 0 ? Math.round((categoryScore / categoryMax) * 100) : 0
              const isExpanded = expandedCategories.includes(category)

              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="font-medium">
                        {categoryNames[category as keyof typeof categoryNames]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all', getScoreBgColor(categoryPercent))}
                          style={{ width: `${categoryPercent}%` }}
                        />
                      </div>
                      <span className={clsx('text-sm font-medium', getScoreColor(categoryPercent))}>
                        {categoryPercent}%
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {checks.map(check => (
                            <div
                              key={check.id}
                              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              {getStatusIcon(check.status)}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{check.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {check.description}
                                </p>
                                {check.details && (
                                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                    {check.details.map((detail, i) => (
                                      <span key={i} className="block">{detail}</span>
                                    ))}
                                  </div>
                                )}
                                {check.suggestion && (
                                  <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                                    <Lightbulb className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-yellow-800 dark:text-yellow-200">
                                      {check.suggestion}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {check.score}/{check.maxScore}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="p-4 space-y-4">
            {keywordData ? (
              <>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-medium mb-3">Keyword Analysis: "{keywordData.keyword}"</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Occurrences</span>
                      <span className="font-medium">{keywordData.count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Density</span>
                      <span className="font-medium">{keywordData.density.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Keyword Placement</h4>
                  {[
                    { label: 'In Title', value: keywordData.inTitle },
                    { label: 'In Meta Description', value: keywordData.inMeta },
                    { label: 'In First Paragraph', value: keywordData.inFirstParagraph },
                    { label: 'In Subheadings', value: keywordData.inHeadings },
                    { label: 'In URL', value: keywordData.inUrl },
                    { label: 'In Image Alt Text', value: keywordData.inImageAlt },
                  ].map(item => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-sm">{item.label}</span>
                      {item.value ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a focus keyword to see analysis</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-4 space-y-4">
            {/* Google Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Google Preview</h4>
              <div className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="text-blue-600 dark:text-blue-400 text-xl hover:underline cursor-pointer truncate">
                  {metaTitle || title || 'Enter a title'}
                </div>
                <div className="text-green-700 dark:text-green-400 text-sm mt-1">
                  {url || 'https://example.com/'}{slug || 'post-url'}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {metaDescription || excerpt || 'Add a meta description to preview how your content will appear in search results.'}
                </div>
              </div>
              <div className="flex gap-2 mt-2 text-xs text-gray-500">
                <span>Title: {(metaTitle || title || '').length}/60</span>
                <span>|</span>
                <span>Description: {(metaDescription || excerpt || '').length}/160</span>
              </div>
            </div>

            {/* Social Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Social Preview</h4>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3 bg-white dark:bg-gray-700">
                  <div className="text-sm text-gray-500">{url?.replace('https://', '') || 'example.com'}</div>
                  <div className="font-medium mt-1">{title || 'Post Title'}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {excerpt || metaDescription || 'Post description preview'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
