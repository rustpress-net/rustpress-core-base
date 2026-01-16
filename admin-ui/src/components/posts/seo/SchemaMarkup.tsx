import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code,
  FileText,
  ShoppingBag,
  Calendar,
  Star,
  HelpCircle,
  Newspaper,
  Video,
  Music,
  MapPin,
  Building,
  User,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import clsx from 'clsx'

interface SchemaMarkupProps {
  postTitle: string
  postContent: string
  postExcerpt?: string
  postUrl?: string
  featuredImage?: string
  author?: {
    name: string
    url?: string
  }
  publishDate?: Date
  modifiedDate?: Date
  categories?: string[]
  onChange?: (schema: SchemaData) => void
  className?: string
}

interface SchemaData {
  type: SchemaType
  enabled: boolean
  fields: Record<string, unknown>
}

type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'NewsArticle'
  | 'Product'
  | 'Recipe'
  | 'Event'
  | 'FAQPage'
  | 'HowTo'
  | 'Review'
  | 'VideoObject'
  | 'LocalBusiness'
  | 'Person'
  | 'Organization'

interface SchemaTemplate {
  type: SchemaType
  name: string
  description: string
  icon: React.ReactNode
  category: 'content' | 'commerce' | 'local' | 'media' | 'entity'
  fields: SchemaField[]
  requiredFields: string[]
}

interface SchemaField {
  id: string
  name: string
  description: string
  type: 'text' | 'textarea' | 'url' | 'date' | 'number' | 'select' | 'rating' | 'duration' | 'array'
  required?: boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  autoFill?: boolean
}

const schemaTemplates: SchemaTemplate[] = [
  {
    type: 'Article',
    name: 'Article',
    description: 'General article schema for blog posts and news',
    icon: <FileText className="w-5 h-5" />,
    category: 'content',
    requiredFields: ['headline', 'author', 'datePublished'],
    fields: [
      { id: 'headline', name: 'Headline', description: 'Article title', type: 'text', required: true, autoFill: true },
      { id: 'description', name: 'Description', description: 'Brief summary', type: 'textarea', autoFill: true },
      { id: 'image', name: 'Image URL', description: 'Featured image', type: 'url', autoFill: true },
      { id: 'author', name: 'Author Name', description: 'Article author', type: 'text', required: true, autoFill: true },
      { id: 'authorUrl', name: 'Author URL', description: 'Author profile link', type: 'url' },
      { id: 'datePublished', name: 'Publish Date', description: 'Publication date', type: 'date', required: true, autoFill: true },
      { id: 'dateModified', name: 'Modified Date', description: 'Last modification', type: 'date', autoFill: true },
      { id: 'publisher', name: 'Publisher', description: 'Publishing organization', type: 'text' },
      { id: 'publisherLogo', name: 'Publisher Logo', description: 'Publisher logo URL', type: 'url' },
    ],
  },
  {
    type: 'BlogPosting',
    name: 'Blog Post',
    description: 'Specific schema for blog content',
    icon: <Newspaper className="w-5 h-5" />,
    category: 'content',
    requiredFields: ['headline', 'author', 'datePublished'],
    fields: [
      { id: 'headline', name: 'Headline', description: 'Post title', type: 'text', required: true, autoFill: true },
      { id: 'description', name: 'Description', description: 'Post summary', type: 'textarea', autoFill: true },
      { id: 'image', name: 'Image URL', description: 'Featured image', type: 'url', autoFill: true },
      { id: 'author', name: 'Author Name', description: 'Post author', type: 'text', required: true, autoFill: true },
      { id: 'datePublished', name: 'Publish Date', description: 'Publication date', type: 'date', required: true, autoFill: true },
      { id: 'dateModified', name: 'Modified Date', description: 'Last update', type: 'date', autoFill: true },
      { id: 'wordCount', name: 'Word Count', description: 'Number of words', type: 'number', autoFill: true },
      { id: 'articleSection', name: 'Section', description: 'Article category', type: 'text', autoFill: true },
    ],
  },
  {
    type: 'Product',
    name: 'Product',
    description: 'E-commerce product schema with pricing',
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'commerce',
    requiredFields: ['name', 'offers'],
    fields: [
      { id: 'name', name: 'Product Name', description: 'Name of the product', type: 'text', required: true },
      { id: 'description', name: 'Description', description: 'Product description', type: 'textarea' },
      { id: 'image', name: 'Image URL', description: 'Product image', type: 'url' },
      { id: 'sku', name: 'SKU', description: 'Stock keeping unit', type: 'text' },
      { id: 'brand', name: 'Brand', description: 'Product brand', type: 'text' },
      { id: 'price', name: 'Price', description: 'Product price', type: 'number', required: true },
      { id: 'priceCurrency', name: 'Currency', description: 'Price currency', type: 'select', options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
      ]},
      { id: 'availability', name: 'Availability', description: 'Stock status', type: 'select', options: [
        { label: 'In Stock', value: 'InStock' },
        { label: 'Out of Stock', value: 'OutOfStock' },
        { label: 'Pre-order', value: 'PreOrder' },
      ]},
      { id: 'aggregateRating', name: 'Rating', description: 'Average rating', type: 'rating' },
      { id: 'reviewCount', name: 'Review Count', description: 'Number of reviews', type: 'number' },
    ],
  },
  {
    type: 'Event',
    name: 'Event',
    description: 'Schema for events and gatherings',
    icon: <Calendar className="w-5 h-5" />,
    category: 'local',
    requiredFields: ['name', 'startDate', 'location'],
    fields: [
      { id: 'name', name: 'Event Name', description: 'Name of the event', type: 'text', required: true },
      { id: 'description', name: 'Description', description: 'Event details', type: 'textarea' },
      { id: 'image', name: 'Image URL', description: 'Event image', type: 'url' },
      { id: 'startDate', name: 'Start Date', description: 'Event start', type: 'date', required: true },
      { id: 'endDate', name: 'End Date', description: 'Event end', type: 'date' },
      { id: 'location', name: 'Location Name', description: 'Venue name', type: 'text', required: true },
      { id: 'locationAddress', name: 'Address', description: 'Venue address', type: 'text' },
      { id: 'performer', name: 'Performer', description: 'Event performer', type: 'text' },
      { id: 'organizer', name: 'Organizer', description: 'Event organizer', type: 'text' },
      { id: 'price', name: 'Ticket Price', description: 'Entry price', type: 'number' },
      { id: 'eventStatus', name: 'Status', description: 'Event status', type: 'select', options: [
        { label: 'Scheduled', value: 'EventScheduled' },
        { label: 'Cancelled', value: 'EventCancelled' },
        { label: 'Postponed', value: 'EventPostponed' },
        { label: 'Rescheduled', value: 'EventRescheduled' },
      ]},
    ],
  },
  {
    type: 'FAQPage',
    name: 'FAQ',
    description: 'Frequently asked questions schema',
    icon: <HelpCircle className="w-5 h-5" />,
    category: 'content',
    requiredFields: ['mainEntity'],
    fields: [
      { id: 'mainEntity', name: 'FAQ Items', description: 'Questions and answers', type: 'array' },
    ],
  },
  {
    type: 'HowTo',
    name: 'How-To',
    description: 'Step-by-step instructions schema',
    icon: <FileText className="w-5 h-5" />,
    category: 'content',
    requiredFields: ['name', 'step'],
    fields: [
      { id: 'name', name: 'Title', description: 'How-to title', type: 'text', required: true, autoFill: true },
      { id: 'description', name: 'Description', description: 'Brief description', type: 'textarea', autoFill: true },
      { id: 'image', name: 'Image URL', description: 'Main image', type: 'url' },
      { id: 'totalTime', name: 'Total Time', description: 'Duration (e.g., PT30M)', type: 'duration' },
      { id: 'estimatedCost', name: 'Estimated Cost', description: 'Cost estimate', type: 'number' },
      { id: 'step', name: 'Steps', description: 'Step-by-step instructions', type: 'array' },
    ],
  },
  {
    type: 'Review',
    name: 'Review',
    description: 'Product or service review schema',
    icon: <Star className="w-5 h-5" />,
    category: 'content',
    requiredFields: ['itemReviewed', 'reviewRating', 'author'],
    fields: [
      { id: 'itemReviewed', name: 'Item Name', description: 'What is being reviewed', type: 'text', required: true },
      { id: 'reviewRating', name: 'Rating', description: 'Review rating', type: 'rating', required: true },
      { id: 'author', name: 'Reviewer', description: 'Review author', type: 'text', required: true, autoFill: true },
      { id: 'reviewBody', name: 'Review Text', description: 'Review content', type: 'textarea' },
      { id: 'datePublished', name: 'Review Date', description: 'When reviewed', type: 'date', autoFill: true },
    ],
  },
  {
    type: 'VideoObject',
    name: 'Video',
    description: 'Schema for video content',
    icon: <Video className="w-5 h-5" />,
    category: 'media',
    requiredFields: ['name', 'thumbnailUrl', 'uploadDate'],
    fields: [
      { id: 'name', name: 'Video Title', description: 'Video name', type: 'text', required: true, autoFill: true },
      { id: 'description', name: 'Description', description: 'Video description', type: 'textarea', autoFill: true },
      { id: 'thumbnailUrl', name: 'Thumbnail URL', description: 'Video thumbnail', type: 'url', required: true },
      { id: 'contentUrl', name: 'Video URL', description: 'Direct video link', type: 'url' },
      { id: 'embedUrl', name: 'Embed URL', description: 'Embeddable link', type: 'url' },
      { id: 'uploadDate', name: 'Upload Date', description: 'When uploaded', type: 'date', required: true, autoFill: true },
      { id: 'duration', name: 'Duration', description: 'Video length (e.g., PT10M30S)', type: 'duration' },
    ],
  },
  {
    type: 'LocalBusiness',
    name: 'Local Business',
    description: 'Schema for local business pages',
    icon: <Building className="w-5 h-5" />,
    category: 'local',
    requiredFields: ['name', 'address'],
    fields: [
      { id: 'name', name: 'Business Name', description: 'Name of business', type: 'text', required: true },
      { id: 'description', name: 'Description', description: 'Business description', type: 'textarea' },
      { id: 'image', name: 'Image URL', description: 'Business image', type: 'url' },
      { id: 'address', name: 'Street Address', description: 'Business address', type: 'text', required: true },
      { id: 'city', name: 'City', description: 'City name', type: 'text' },
      { id: 'postalCode', name: 'Postal Code', description: 'ZIP/Postal code', type: 'text' },
      { id: 'telephone', name: 'Phone', description: 'Contact number', type: 'text' },
      { id: 'priceRange', name: 'Price Range', description: 'e.g., $$', type: 'text' },
      { id: 'openingHours', name: 'Opening Hours', description: 'Business hours', type: 'text' },
      { id: 'aggregateRating', name: 'Rating', description: 'Average rating', type: 'rating' },
    ],
  },
]

const categoryIcons = {
  content: <FileText className="w-4 h-4" />,
  commerce: <ShoppingBag className="w-4 h-4" />,
  local: <MapPin className="w-4 h-4" />,
  media: <Video className="w-4 h-4" />,
  entity: <User className="w-4 h-4" />,
}

export default function SchemaMarkup({
  postTitle,
  postContent,
  postExcerpt,
  postUrl,
  featuredImage,
  author,
  publishDate,
  modifiedDate,
  categories,
  onChange,
  className,
}: SchemaMarkupProps) {
  const [selectedType, setSelectedType] = useState<SchemaType>('Article')
  const [schemaEnabled, setSchemaEnabled] = useState(true)
  const [schemaData, setSchemaData] = useState<Record<string, unknown>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([])
  const [howToSteps, setHowToSteps] = useState<{ name: string; text: string }[]>([])

  const selectedTemplate = useMemo(
    () => schemaTemplates.find(t => t.type === selectedType),
    [selectedType]
  )

  // Auto-fill values from post data
  const getAutoFilledValue = (fieldId: string): unknown => {
    switch (fieldId) {
      case 'headline':
      case 'name':
        return postTitle
      case 'description':
        return postExcerpt || ''
      case 'image':
        return featuredImage || ''
      case 'author':
        return author?.name || ''
      case 'authorUrl':
        return author?.url || ''
      case 'datePublished':
      case 'uploadDate':
        return publishDate?.toISOString().split('T')[0] || ''
      case 'dateModified':
        return modifiedDate?.toISOString().split('T')[0] || ''
      case 'wordCount':
        return postContent.split(/\s+/).filter(Boolean).length
      case 'articleSection':
        return categories?.[0] || ''
      default:
        return schemaData[fieldId] || ''
    }
  }

  const handleFieldChange = (fieldId: string, value: unknown) => {
    const newData = { ...schemaData, [fieldId]: value }
    setSchemaData(newData)
    validateSchema(newData)
  }

  const validateSchema = (data: Record<string, unknown>) => {
    if (!selectedTemplate) return

    const errors: string[] = []
    selectedTemplate.requiredFields.forEach(fieldId => {
      const value = data[fieldId] || getAutoFilledValue(fieldId)
      if (!value || (typeof value === 'string' && !value.trim())) {
        const field = selectedTemplate.fields.find(f => f.id === fieldId)
        errors.push(`${field?.name || fieldId} is required`)
      }
    })
    setValidationErrors(errors)
  }

  // Generate JSON-LD
  const generatedSchema = useMemo(() => {
    if (!selectedTemplate) return null

    const schemaObj: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': selectedType,
    }

    selectedTemplate.fields.forEach(field => {
      const value = schemaData[field.id] || getAutoFilledValue(field.id)
      if (value) {
        if (field.id === 'author') {
          schemaObj.author = {
            '@type': 'Person',
            name: value,
            url: schemaData.authorUrl || author?.url,
          }
        } else if (field.id === 'publisher') {
          schemaObj.publisher = {
            '@type': 'Organization',
            name: value,
            logo: schemaData.publisherLogo ? {
              '@type': 'ImageObject',
              url: schemaData.publisherLogo,
            } : undefined,
          }
        } else if (field.id === 'aggregateRating') {
          schemaObj.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: value,
            bestRating: 5,
            reviewCount: schemaData.reviewCount || 1,
          }
        } else if (field.id === 'mainEntity' && selectedType === 'FAQPage') {
          schemaObj.mainEntity = faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          }))
        } else if (field.id === 'step' && selectedType === 'HowTo') {
          schemaObj.step = howToSteps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
          }))
        } else if (!['authorUrl', 'publisherLogo', 'reviewCount'].includes(field.id)) {
          schemaObj[field.id] = value
        }
      }
    })

    // Add URL if available
    if (postUrl) {
      schemaObj.url = postUrl
    }

    return schemaObj
  }, [selectedTemplate, selectedType, schemaData, postUrl, author, faqItems, howToSteps])

  const handleCopySchema = () => {
    if (generatedSchema) {
      navigator.clipboard.writeText(JSON.stringify(generatedSchema, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderField = (field: SchemaField) => {
    const value = schemaData[field.id] ?? (field.autoFill ? getAutoFilledValue(field.id) : '')

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
          />
        )
      case 'url':
        return (
          <input
            type="url"
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={e => handleFieldChange(field.id, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'select':
        return (
          <select
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleFieldChange(field.id, star)}
                className={clsx(
                  'p-1 transition-colors',
                  (value as number) >= star ? 'text-yellow-500' : 'text-gray-300'
                )}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{(value as number) || 0}/5</span>
          </div>
        )
      case 'duration':
        return (
          <input
            type="text"
            value={value as string}
            onChange={e => handleFieldChange(field.id, e.target.value)}
            placeholder="PT1H30M (1 hour 30 minutes)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        )
      case 'array':
        if (field.id === 'mainEntity') {
          return (
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <input
                    type="text"
                    value={item.question}
                    onChange={e => {
                      const newItems = [...faqItems]
                      newItems[index].question = e.target.value
                      setFaqItems(newItems)
                    }}
                    placeholder="Question"
                    className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => {
                      const newItems = [...faqItems]
                      newItems[index].answer = e.target.value
                      setFaqItems(newItems)
                    }}
                    placeholder="Answer"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                  <button
                    onClick={() => setFaqItems(faqItems.filter((_, i) => i !== index))}
                    className="mt-2 text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFaqItems([...faqItems, { question: '', answer: '' }])}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add FAQ Item
              </button>
            </div>
          )
        }
        if (field.id === 'step') {
          return (
            <div className="space-y-2">
              {howToSteps.map((step, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary-600 text-white rounded-full text-sm">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step.name}
                      onChange={e => {
                        const newSteps = [...howToSteps]
                        newSteps[index].name = e.target.value
                        setHowToSteps(newSteps)
                      }}
                      placeholder="Step title"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    value={step.text}
                    onChange={e => {
                      const newSteps = [...howToSteps]
                      newSteps[index].text = e.target.value
                      setHowToSteps(newSteps)
                    }}
                    placeholder="Step instructions"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                  <button
                    onClick={() => setHowToSteps(howToSteps.filter((_, i) => i !== index))}
                    className="mt-2 text-sm text-red-500 hover:text-red-600"
                  >
                    Remove Step
                  </button>
                </div>
              ))}
              <button
                onClick={() => setHowToSteps([...howToSteps, { name: '', text: '' }])}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          )
        }
        return null
      default:
        return null
    }
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Schema Markup</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSchemaEnabled(!schemaEnabled)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              schemaEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                schemaEnabled ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* Schema Type Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium mb-2">Schema Type</label>
        <div className="grid grid-cols-3 gap-2">
          {schemaTemplates.map(template => (
            <button
              key={template.type}
              onClick={() => setSelectedType(template.type)}
              className={clsx(
                'flex items-center gap-2 p-2 rounded-lg border transition-all text-left',
                selectedType === template.type
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              )}
            >
              {template.icon}
              <span className="text-sm">{template.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Status */}
      {validationErrors.length > 0 && schemaEnabled && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Missing required fields:</p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validationErrors.length === 0 && schemaEnabled && selectedTemplate && (
        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">Schema markup is valid</span>
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {selectedTemplate?.fields.map(field => (
          <div key={field.id}>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              {field.name}
              {field.required && <span className="text-red-500">*</span>}
              {field.autoFill && (
                <span className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">
                  Auto-filled
                </span>
              )}
            </label>
            <p className="text-xs text-gray-500 mb-2">{field.description}</p>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="font-medium">JSON-LD Preview</span>
          </div>
          {showPreview ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="relative">
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto max-h-60">
                    {JSON.stringify(generatedSchema, null, 2)}
                  </pre>
                  <button
                    onClick={handleCopySchema}
                    className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                </div>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Test with Google Rich Results
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
