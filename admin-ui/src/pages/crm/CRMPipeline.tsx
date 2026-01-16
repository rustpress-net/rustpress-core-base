import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, Target, Users, Calendar,
  ChevronDown, Filter, Download, Plus, MoreHorizontal, Clock,
  ArrowRight, CheckCircle2, XCircle, AlertCircle, Sparkles,
  BarChart3, PieChart, Eye, Edit, Trash2, Star, Phone, Mail,
  Video, MessageSquare, ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
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
      staggerChildren: 0.05
    }
  }
}

// Pipeline stages
const pipelineStages = [
  { id: 'discovery', label: 'Discovery', value: 185000, deals: 24, color: '#6366f1', conversion: 85 },
  { id: 'proposal', label: 'Proposal', value: 145000, deals: 18, color: '#8b5cf6', conversion: 72 },
  { id: 'negotiation', label: 'Negotiation', value: 98000, deals: 12, color: '#a855f7', conversion: 65 },
  { id: 'closing', label: 'Closing', value: 72000, deals: 8, color: '#c084fc', conversion: 88 },
  { id: 'won', label: 'Won', value: 245000, deals: 15, color: '#10b981', conversion: 100 },
]

// Deals data
const dealsData = [
  {
    id: 1,
    name: 'Enterprise License - TechCorp',
    company: 'TechCorp Inc',
    value: 85000,
    stage: 'negotiation',
    probability: 75,
    closeDate: '2024-01-15',
    owner: 'Sarah Chen',
    priority: 'high',
    daysOpen: 45,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    name: 'Annual Subscription - DataFlow',
    company: 'DataFlow Labs',
    value: 45000,
    stage: 'proposal',
    probability: 60,
    closeDate: '2024-01-20',
    owner: 'Mike Johnson',
    priority: 'medium',
    daysOpen: 32,
    lastActivity: '1 day ago',
  },
  {
    id: 3,
    name: 'Platform Migration - CloudNine',
    company: 'CloudNine Tech',
    value: 120000,
    stage: 'closing',
    probability: 90,
    closeDate: '2024-01-08',
    owner: 'Emma Wilson',
    priority: 'high',
    daysOpen: 60,
    lastActivity: '3 hours ago',
  },
  {
    id: 4,
    name: 'Consulting Package - SecureNet',
    company: 'SecureNet Corp',
    value: 35000,
    stage: 'discovery',
    probability: 30,
    closeDate: '2024-02-01',
    owner: 'Alex Rivera',
    priority: 'low',
    daysOpen: 15,
    lastActivity: '5 hours ago',
  },
  {
    id: 5,
    name: 'Full Suite License - InnovateTech',
    company: 'InnovateTech',
    value: 95000,
    stage: 'proposal',
    probability: 55,
    closeDate: '2024-01-25',
    owner: 'Jordan Lee',
    priority: 'high',
    daysOpen: 28,
    lastActivity: '30 min ago',
  },
  {
    id: 6,
    name: 'API Integration - FinanceHub',
    company: 'FinanceHub',
    value: 28000,
    stage: 'discovery',
    probability: 40,
    closeDate: '2024-02-10',
    owner: 'Sarah Chen',
    priority: 'medium',
    daysOpen: 10,
    lastActivity: '2 days ago',
  },
]

// Monthly trend data
const trendData = [
  { month: 'Jul', won: 180000, lost: 45000, pipeline: 320000 },
  { month: 'Aug', won: 220000, lost: 35000, pipeline: 380000 },
  { month: 'Sep', won: 195000, lost: 52000, pipeline: 350000 },
  { month: 'Oct', won: 280000, lost: 28000, pipeline: 420000 },
  { month: 'Nov', won: 310000, lost: 42000, pipeline: 480000 },
  { month: 'Dec', won: 245000, lost: 38000, pipeline: 520000 },
]

// Pipeline Funnel Component
const PipelineFunnel = () => {
  const maxValue = Math.max(...pipelineStages.map(s => s.value))

  return (
    <div className="space-y-3">
      {pipelineStages.map((stage, index) => {
        const widthPercent = (stage.value / maxValue) * 100

        return (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">{stage.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{stage.deals} deals</span>
                <span className="text-sm font-semibold text-white">${(stage.value / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="relative h-10 bg-gray-800/50 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="absolute left-0 top-0 h-full rounded-lg flex items-center justify-end pr-3"
                style={{ backgroundColor: stage.color }}
              >
                <span className="text-xs font-medium text-white/80">{stage.conversion}%</span>
              </motion.div>

              {/* Conversion arrow */}
              {index < pipelineStages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Deal Row Component
const DealRow = ({ deal, index }: { deal: typeof dealsData[0], index: number }) => {
  const [isHovered, setIsHovered] = useState(false)

  const stageColors: Record<string, string> = {
    discovery: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    negotiation: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    closing: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
    won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  const priorityColors: Record<string, string> = {
    high: 'text-rose-400',
    medium: 'text-amber-400',
    low: 'text-blue-400',
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-b border-gray-800/50 transition-colors ${isHovered ? 'bg-gray-800/30' : ''}`}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className={priorityColors[deal.priority]}
          >
            <Star className={`w-4 h-4 ${deal.priority === 'high' ? 'fill-current' : ''}`} />
          </motion.button>
          <div>
            <p className="font-medium text-white hover:text-blue-400 cursor-pointer">{deal.name}</p>
            <p className="text-sm text-gray-500">{deal.company}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">${(deal.value / 1000).toFixed(0)}k</span>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${stageColors[deal.stage]}`}>
          {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${deal.probability}%` }}
              className={`h-full rounded-full ${
                deal.probability >= 70 ? 'bg-emerald-500' :
                deal.probability >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <span className="text-sm text-gray-400">{deal.probability}%</span>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          {new Date(deal.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            {deal.owner.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm text-gray-400">{deal.owner}</span>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {deal.daysOpen}d
        </div>
      </td>

      <td className="px-4 py-4">
        <AnimatePresence>
          {isHovered ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400">
                <Eye className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <span className="text-xs text-gray-500">{deal.lastActivity}</span>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  )
}

// Main Component
export default function CRMPipeline() {
  const [viewMode, setViewMode] = useState<'funnel' | 'list' | 'chart'>('funnel')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const totalPipeline = pipelineStages.reduce((sum, s) => sum + s.value, 0)
  const totalDeals = pipelineStages.reduce((sum, s) => sum + s.deals, 0)
  const wonValue = pipelineStages.find(s => s.id === 'won')?.value || 0
  const avgDealSize = totalPipeline / totalDeals

  const stats = [
    { label: 'Total Pipeline', value: `$${(totalPipeline / 1000).toFixed(0)}k`, change: 12.5, icon: DollarSign, color: 'blue' },
    { label: 'Active Deals', value: totalDeals, change: 8.3, icon: Target, color: 'purple' },
    { label: 'Won This Month', value: `$${(wonValue / 1000).toFixed(0)}k`, change: 24.5, icon: TrendingUp, color: 'emerald' },
    { label: 'Avg Deal Size', value: `$${(avgDealSize / 1000).toFixed(1)}k`, change: -2.1, icon: BarChart3, color: 'amber' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
            <p className="text-gray-400 mt-1">Monitor and manage your deal flow</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50">
              {[
                { id: 'funnel', icon: Zap, label: 'Funnel' },
                { id: 'list', icon: BarChart3, label: 'List' },
                { id: 'chart', icon: PieChart, label: 'Chart' },
              ].map((view) => (
                <motion.button
                  key={view.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode(view.id as typeof viewMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === view.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.label}
                </motion.button>
              ))}
            </div>

            {/* Period selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>New Deal</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
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
              className="p-5 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Pipeline Stages</h3>
                <p className="text-sm text-gray-400">Conversion funnel overview</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>

            {viewMode === 'funnel' && <PipelineFunnel />}

            {viewMode === 'chart' && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pipelineStages}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {pipelineStages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {pipelineStages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="font-medium text-white">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-gray-400">{stage.deals} deals</span>
                      <span className="font-semibold text-white">${(stage.value / 1000).toFixed(0)}k</span>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Monthly Trend</h3>
                <p className="text-sm text-gray-400">Win/loss analysis</p>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="wonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="won" stroke="#10b981" fill="url(#wonGradient)" />
                  <Area type="monotone" dataKey="lost" stroke="#f43f5e" fill="url(#lostGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-gray-400">Won</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm text-gray-400">Lost</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Deals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Deals</h3>
                <p className="text-sm text-gray-400">Track and manage opportunities</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </motion.button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Deal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Value</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Probability</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Close Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Owner</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Age</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealsData.map((deal, index) => (
                  <DealRow key={deal.id} deal={deal} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
