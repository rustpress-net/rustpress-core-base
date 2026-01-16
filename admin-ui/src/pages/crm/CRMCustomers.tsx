import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Plus, Download, Upload, MoreHorizontal, ChevronDown,
  ChevronLeft, ChevronRight, Mail, Phone, Globe, MapPin, Building2,
  Star, StarOff, Edit, Trash2, Eye, Copy, ExternalLink, CheckCircle2,
  XCircle, Clock, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown,
  Users, DollarSign, Calendar, Tag, MoreVertical, Sparkles
} from 'lucide-react'
import { AnimatedBackground, GlassCard, PageHeader, GradientText } from '../../components/ui/EnhancedUI'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03
    }
  }
}

const tableRowVariant = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

// Sample customer data
const customersData = [
  {
    id: 1,
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    industry: 'Technology',
    status: 'active',
    revenue: 285000,
    deals: 8,
    lastContact: '2024-12-20',
    location: 'San Francisco, CA',
    website: 'acme.com',
    starred: true,
    avatar: 'AC',
    tags: ['Enterprise', 'Priority'],
    healthScore: 92,
  },
  {
    id: 2,
    name: 'TechGiant Inc',
    email: 'sales@techgiant.io',
    phone: '+1 (555) 234-5678',
    company: 'TechGiant',
    industry: 'Software',
    status: 'active',
    revenue: 198000,
    deals: 5,
    lastContact: '2024-12-18',
    location: 'New York, NY',
    website: 'techgiant.io',
    starred: true,
    avatar: 'TG',
    tags: ['Mid-Market'],
    healthScore: 85,
  },
  {
    id: 3,
    name: 'Global Systems Ltd',
    email: 'info@globalsystems.com',
    phone: '+44 20 7123 4567',
    company: 'Global Systems',
    industry: 'Consulting',
    status: 'churned',
    revenue: 156000,
    deals: 4,
    lastContact: '2024-11-15',
    location: 'London, UK',
    website: 'globalsystems.com',
    starred: false,
    avatar: 'GS',
    tags: ['At Risk'],
    healthScore: 45,
  },
  {
    id: 4,
    name: 'InnovateTech',
    email: 'hello@innovatetech.co',
    phone: '+1 (555) 345-6789',
    company: 'InnovateTech',
    industry: 'Fintech',
    status: 'active',
    revenue: 134000,
    deals: 6,
    lastContact: '2024-12-22',
    location: 'Austin, TX',
    website: 'innovatetech.co',
    starred: false,
    avatar: 'IT',
    tags: ['Startup', 'Growth'],
    healthScore: 88,
  },
  {
    id: 5,
    name: 'DataDriven Co',
    email: 'team@datadriven.com',
    phone: '+1 (555) 456-7890',
    company: 'DataDriven',
    industry: 'Analytics',
    status: 'active',
    revenue: 112000,
    deals: 3,
    lastContact: '2024-12-19',
    location: 'Seattle, WA',
    website: 'datadriven.com',
    starred: false,
    avatar: 'DD',
    tags: ['SMB'],
    healthScore: 76,
  },
  {
    id: 6,
    name: 'CloudNine Tech',
    email: 'contact@cloudnine.tech',
    phone: '+1 (555) 567-8901',
    company: 'CloudNine',
    industry: 'Cloud Services',
    status: 'pending',
    revenue: 89000,
    deals: 2,
    lastContact: '2024-12-21',
    location: 'Denver, CO',
    website: 'cloudnine.tech',
    starred: false,
    avatar: 'CN',
    tags: ['New'],
    healthScore: 70,
  },
  {
    id: 7,
    name: 'SecureNet Solutions',
    email: 'sales@securenet.io',
    phone: '+1 (555) 678-9012',
    company: 'SecureNet',
    industry: 'Cybersecurity',
    status: 'active',
    revenue: 245000,
    deals: 7,
    lastContact: '2024-12-17',
    location: 'Boston, MA',
    website: 'securenet.io',
    starred: true,
    avatar: 'SN',
    tags: ['Enterprise', 'Security'],
    healthScore: 94,
  },
  {
    id: 8,
    name: 'GreenEnergy Corp',
    email: 'info@greenenergy.com',
    phone: '+1 (555) 789-0123',
    company: 'GreenEnergy',
    industry: 'Energy',
    status: 'active',
    revenue: 178000,
    deals: 4,
    lastContact: '2024-12-16',
    location: 'Portland, OR',
    website: 'greenenergy.com',
    starred: false,
    avatar: 'GE',
    tags: ['Sustainability'],
    healthScore: 82,
  },
]

// Health Score Component
const HealthScore = ({ score }: { score: number }) => {
  const color = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'rose'
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/20',
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-700"
          />
          <motion.circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={100}
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 100 - score }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={colors[color].split(' ')[0]}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colors[color].split(' ')[0]}`}>
          {score}
        </span>
      </div>
    </div>
  )
}

// Customer Row Component
const CustomerRow = ({
  customer,
  index,
  isSelected,
  onToggleSelect,
  onToggleStar
}: {
  customer: typeof customersData[0]
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  onToggleStar: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    churned: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }

  const tagColors = [
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ]

  return (
    <motion.tr
      variants={tableRowVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowActions(false) }}
      className={`border-b border-gray-800/50 transition-colors ${
        isSelected ? 'bg-blue-500/10' : isHovered ? 'bg-gray-800/30' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="px-4 py-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSelect}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-600 hover:border-blue-500'
          }`}
        >
          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
        </motion.button>
      </td>

      {/* Star */}
      <td className="px-2 py-4">
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={onToggleStar}
          className="text-gray-500 hover:text-yellow-400 transition-colors"
        >
          {customer.starred ? (
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarOff className="w-5 h-5" />
          )}
        </motion.button>
      </td>

      {/* Customer */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold"
          >
            {customer.avatar}
          </motion.div>
          <div>
            <p className="font-medium text-white hover:text-blue-400 cursor-pointer transition-colors">
              {customer.name}
            </p>
            <p className="text-sm text-gray-500">{customer.company}</p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-3.5 h-3.5" />
            <span className="hover:text-blue-400 cursor-pointer">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Phone className="w-3.5 h-3.5" />
            <span>{customer.phone}</span>
          </div>
        </div>
      </td>

      {/* Industry */}
      <td className="px-4 py-4">
        <span className="text-gray-400">{customer.industry}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[customer.status as keyof typeof statusColors]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
        </span>
      </td>

      {/* Revenue */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">${(customer.revenue / 1000).toFixed(0)}k</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
      </td>

      {/* Health Score */}
      <td className="px-4 py-4">
        <HealthScore score={customer.healthScore} />
      </td>

      {/* Tags */}
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {customer.tags.slice(0, 2).map((tag, i) => (
            <span
              key={tag}
              className={`px-2 py-0.5 text-xs rounded-full border ${tagColors[i % tagColors.length]}`}
            >
              {tag}
            </span>
          ))}
          {customer.tags.length > 2 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700/50 text-gray-400">
              +{customer.tags.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Last Contact */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(customer.lastContact).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="relative flex items-center gap-1">
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50 overflow-hidden"
              >
                {[
                  { icon: Eye, label: 'View details' },
                  { icon: Edit, label: 'Edit customer' },
                  { icon: Mail, label: 'Send email' },
                  { icon: Phone, label: 'Log call' },
                  { icon: Copy, label: 'Copy info' },
                  { icon: ExternalLink, label: 'Visit website' },
                  { icon: Trash2, label: 'Delete', danger: true },
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
                      item.danger ? 'text-rose-400' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  )
}

// Main Component
export default function CRMCustomers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [customers, setCustomers] = useState(customersData)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const itemsPerPage = 10

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers]

    // Search filter
    if (searchQuery) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }

    // Industry filter
    if (industryFilter !== 'all') {
      result = result.filter(c => c.industry === industryFilter)
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a]
        const bVal = b[sortConfig.key as keyof typeof b]
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [customers, searchQuery, statusFilter, industryFilter, sortConfig])

  const toggleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleStar = (id: number) => {
    setCustomers(prev =>
      prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c)
    )
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const industries = [...new Set(customersData.map(c => c.industry))]

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'blue' },
    { label: 'Active', value: customers.filter(c => c.status === 'active').length, icon: CheckCircle2, color: 'emerald' },
    { label: 'Total Revenue', value: `$${(customers.reduce((a, c) => a + c.revenue, 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'purple' },
    { label: 'Avg Health Score', value: Math.round(customers.reduce((a, c) => a + c.healthScore, 0) / customers.length), icon: TrendingUp, color: 'amber' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-gray-400 mt-1">Manage and track your customer relationships</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:border-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="churned">Churned</option>
          </select>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:border-blue-500/50"
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
          >
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </motion.button>

          {selectedCustomers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400"
            >
              <span className="text-sm font-medium">{selectedCustomers.length} selected</span>
              <button
                onClick={() => setSelectedCustomers([])}
                className="p-1 hover:bg-blue-500/30 rounded"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="px-4 py-4 text-left">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </motion.button>
                  </th>
                  <th className="px-2 py-4"></th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white"
                    >
                      Customer
                      {sortConfig?.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Industry</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={() => handleSort('revenue')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white"
                    >
                      Revenue
                      {sortConfig?.key === 'revenue' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Health</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Tags</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Last Contact</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                <AnimatePresence>
                  {filteredCustomers.map((customer, index) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      index={index}
                      isSelected={selectedCustomers.includes(customer.id)}
                      onToggleSelect={() => toggleSelect(customer.id)}
                      onToggleStar={() => toggleStar(customer.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-400">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {[1, 2, 3].map(page => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white'
                  }`}
                >
                  {page}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
