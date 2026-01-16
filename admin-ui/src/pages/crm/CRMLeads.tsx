import { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Plus, Search, Filter, MoreHorizontal, User, Mail, Phone, Building2,
  DollarSign, Calendar, Tag, Clock, ArrowRight, Star, Trash2, Edit,
  MessageSquare, Video, CheckCircle2, XCircle, AlertCircle, Target,
  TrendingUp, Sparkles, GripVertical, ChevronDown, ExternalLink
} from 'lucide-react'
import { AnimatedBackground, GlassCard, PageHeader, GradientText } from '../../components/ui/EnhancedUI'

// Lead stages
const stages = [
  { id: 'new', label: 'New Leads', color: 'blue', icon: Sparkles },
  { id: 'contacted', label: 'Contacted', color: 'purple', icon: MessageSquare },
  { id: 'qualified', label: 'Qualified', color: 'amber', icon: Target },
  { id: 'proposal', label: 'Proposal Sent', color: 'cyan', icon: Mail },
  { id: 'negotiation', label: 'Negotiation', color: 'orange', icon: TrendingUp },
  { id: 'won', label: 'Won', color: 'emerald', icon: CheckCircle2 },
]

// Sample leads data
const initialLeads = {
  new: [
    { id: 1, name: 'TechStart Inc', contact: 'John Smith', email: 'john@techstart.io', value: 25000, probability: 20, daysInStage: 2, priority: 'high', tags: ['Startup', 'Tech'] },
    { id: 2, name: 'DataFlow Labs', contact: 'Sarah Chen', email: 'sarah@dataflow.com', value: 18000, probability: 15, daysInStage: 1, priority: 'medium', tags: ['Analytics'] },
    { id: 3, name: 'CloudNine Solutions', contact: 'Mike Brown', email: 'mike@cloudnine.io', value: 32000, probability: 25, daysInStage: 3, priority: 'high', tags: ['Enterprise'] },
  ],
  contacted: [
    { id: 4, name: 'SecureNet Corp', contact: 'Emma Wilson', email: 'emma@securenet.com', value: 45000, probability: 35, daysInStage: 5, priority: 'high', tags: ['Security', 'Enterprise'] },
    { id: 5, name: 'GreenEnergy Co', contact: 'Alex Rivera', email: 'alex@greenenergy.co', value: 28000, probability: 30, daysInStage: 4, priority: 'medium', tags: ['Sustainability'] },
  ],
  qualified: [
    { id: 6, name: 'FinanceHub', contact: 'Jordan Lee', email: 'jordan@financehub.com', value: 55000, probability: 50, daysInStage: 7, priority: 'high', tags: ['Fintech', 'Priority'] },
    { id: 7, name: 'HealthTech Pro', contact: 'Lisa Wang', email: 'lisa@healthtech.io', value: 38000, probability: 45, daysInStage: 6, priority: 'medium', tags: ['Healthcare'] },
    { id: 8, name: 'RetailMax', contact: 'Tom Hardy', email: 'tom@retailmax.com', value: 22000, probability: 40, daysInStage: 8, priority: 'low', tags: ['Retail'] },
  ],
  proposal: [
    { id: 9, name: 'MediaGroup Inc', contact: 'Nina Patel', email: 'nina@mediagroup.com', value: 67000, probability: 65, daysInStage: 4, priority: 'high', tags: ['Media', 'Enterprise'] },
    { id: 10, name: 'LogiTech Systems', contact: 'David Kim', email: 'david@logitech.io', value: 42000, probability: 60, daysInStage: 3, priority: 'medium', tags: ['Logistics'] },
  ],
  negotiation: [
    { id: 11, name: 'InnovateCorp', contact: 'Rachel Green', email: 'rachel@innovate.com', value: 85000, probability: 80, daysInStage: 6, priority: 'high', tags: ['Innovation', 'Priority'] },
  ],
  won: [
    { id: 12, name: 'Acme Corp', contact: 'Ross Geller', email: 'ross@acme.com', value: 95000, probability: 100, daysInStage: 0, priority: 'high', tags: ['Enterprise', 'VIP'] },
  ],
}

type Lead = typeof initialLeads.new[0]
type StageId = keyof typeof initialLeads

// Lead Card Component
const LeadCard = ({
  lead,
  stageColor,
  onDragEnd
}: {
  lead: Lead
  stageColor: string
  onDragEnd: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const priorityColors = {
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  const colorClasses = {
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
    cyan: 'border-l-cyan-500',
    orange: 'border-l-orange-500',
    emerald: 'border-l-emerald-500',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false) }}
      className={`relative bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 border-l-4 ${colorClasses[stageColor as keyof typeof colorClasses]} p-4 cursor-grab active:cursor-grabbing`}
    >
      {/* Drag handle indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        className="absolute top-2 left-1/2 -translate-x-1/2"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </motion.div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white hover:text-blue-400 cursor-pointer transition-colors">
            {lead.name}
          </h4>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
            <User className="w-3.5 h-3.5" />
            {lead.contact}
          </p>
        </div>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50 overflow-hidden"
              >
                {[
                  { icon: Edit, label: 'Edit' },
                  { icon: MessageSquare, label: 'Add note' },
                  { icon: Video, label: 'Schedule call' },
                  { icon: Star, label: 'Mark priority' },
                  { icon: Trash2, label: 'Delete', danger: true },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 4 }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
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
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">${(lead.value / 1000).toFixed(0)}k</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${lead.probability}%` }}
              transition={{ duration: 0.5 }}
              className={`absolute left-0 top-0 h-full rounded-full ${
                lead.probability >= 70 ? 'bg-emerald-500' :
                lead.probability >= 40 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
            />
          </div>
          <span className="text-xs text-gray-400">{lead.probability}%</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/50"
          >
            {tag}
          </span>
        ))}
        <span className={`px-2 py-0.5 text-xs rounded-full border ${priorityColors[lead.priority as keyof typeof priorityColors]}`}>
          {lead.priority}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          {lead.daysInStage} days
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white"
              >
                <Mail className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white"
              >
                <Phone className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 4 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"
              >
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Stage Column Component
const StageColumn = ({
  stage,
  leads,
  onLeadsChange
}: {
  stage: typeof stages[0]
  leads: Lead[]
  onLeadsChange: (leads: Lead[]) => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = stage.icon

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0)

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-shrink-0 w-80 flex flex-col h-full"
    >
      {/* Header */}
      <div className={`p-4 rounded-t-2xl bg-gradient-to-br ${colorClasses[stage.color as keyof typeof colorClasses]} border border-b-0`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-${stage.color}-500/20`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white">{stage.label}</h3>
          </div>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-900/50 text-white">
            {leads.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total value</span>
          <span className="font-semibold text-white">${(totalValue / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 p-3 rounded-b-2xl bg-gray-800/30 border border-gray-700/50 border-t-0 overflow-y-auto space-y-3">
        <Reorder.Group
          axis="y"
          values={leads}
          onReorder={onLeadsChange}
          className="space-y-3"
        >
          <AnimatePresence>
            {leads.map((lead) => (
              <Reorder.Item
                key={lead.id}
                value={lead}
                className="list-none"
              >
                <LeadCard
                  lead={lead}
                  stageColor={stage.color}
                  onDragEnd={() => {}}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add card button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-3 rounded-xl border border-dashed border-gray-700 hover:border-gray-600 text-gray-500 hover:text-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add lead</span>
        </motion.button>

        {/* Empty state */}
        {leads.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No leads in this stage</p>
            <p className="text-xs mt-1">Drag leads here or add new ones</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Main Component
export default function CRMLeads() {
  const [leads, setLeads] = useState(initialLeads)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleLeadsChange = (stageId: StageId) => (newLeads: Lead[]) => {
    setLeads(prev => ({
      ...prev,
      [stageId]: newLeads
    }))
  }

  const totalLeads = Object.values(leads).flat().length
  const totalValue = Object.values(leads).flat().reduce((sum, lead) => sum + lead.value, 0)
  const avgProbability = Math.round(
    Object.values(leads).flat().reduce((sum, lead) => sum + lead.probability, 0) / totalLeads
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
            <p className="text-gray-400 mt-1">Track and manage your sales opportunities</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Leads</p>
              <p className="text-xl font-bold text-white">{totalLeads}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-700" />

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pipeline Value</p>
              <p className="text-xl font-bold text-white">${(totalValue / 1000).toFixed(0)}k</p>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-700" />

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Probability</p>
              <p className="text-xl font-bold text-white">{avgProbability}%</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Search & Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:border-blue-500/50"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              showFilters
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </motion.button>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <select className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white">
                  <option>All Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <select className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white">
                  <option>All Tags</option>
                  <option>Enterprise</option>
                  <option>Startup</option>
                  <option>Priority</option>
                </select>

                <select className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white">
                  <option>Any Value</option>
                  <option>$0 - $25k</option>
                  <option>$25k - $50k</option>
                  <option>$50k+</option>
                </select>

                <select className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white">
                  <option>Any Probability</option>
                  <option>0% - 25%</option>
                  <option>25% - 50%</option>
                  <option>50% - 75%</option>
                  <option>75%+</option>
                </select>

                <button className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300">
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ height: 'calc(100vh - 320px)' }}>
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leads[stage.id as StageId] || []}
              onLeadsChange={handleLeadsChange(stage.id as StageId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
