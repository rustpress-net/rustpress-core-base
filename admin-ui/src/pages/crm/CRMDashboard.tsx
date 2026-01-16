import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import {
  LayoutDashboard, Users, UserPlus, TrendingUp, BarChart3, Zap,
  Link2, Settings, ChevronLeft, ChevronRight, Search, Bell,
  Moon, Sun, Command, Plus, Filter, MoreHorizontal, ArrowUpRight,
  ArrowDownRight, DollarSign, Target, Activity, Clock, Calendar,
  CheckCircle2, AlertCircle, MessageSquare, Mail, Phone, Video,
  RefreshCw, Download, Upload, Sparkles, Layers, PieChart,
  TrendingDown, Eye, MousePointer, ShoppingCart, CreditCard,
  Globe, Smartphone, Monitor, Maximize2, GripVertical, X,
  ChevronDown, Star, Bookmark, Share2, MoreVertical, Play,
  Pause, SkipForward, Volume2, Wifi, Battery, Signal,
  FileText, FolderOpen, Briefcase, Award, Rocket
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList
} from 'recharts'
import { AnimatedBackground, GlassCard } from '../../components/ui/EnhancedUI'

// Theme context
type Theme = 'dark' | 'light'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number, prefix?: string, suffix?: string, decimals?: number
}) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${suffix}`
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

// Skeleton loader
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded ${className}`} />
)

// Navigation items
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/crm', badge: null },
  { icon: Users, label: 'Customers', path: '/crm/customers', badge: '2.4k' },
  { icon: UserPlus, label: 'Leads', path: '/crm/leads', badge: '128' },
  { icon: TrendingUp, label: 'Sales Pipeline', path: '/crm/pipeline', badge: null },
  { icon: BarChart3, label: 'Analytics', path: '/crm/analytics', badge: null },
  { icon: Zap, label: 'Automation', path: '/crm/automation', badge: '3' },
  { icon: Link2, label: 'Integrations', path: '/crm/integrations', badge: null },
  { icon: Users, label: 'Users', path: '/crm/users', badge: null },
  { icon: Settings, label: 'Settings', path: '/crm/settings', badge: null },
]

// Sample data
const revenueData = [
  { month: 'Jan', revenue: 45000, target: 40000, lastYear: 38000 },
  { month: 'Feb', revenue: 52000, target: 45000, lastYear: 42000 },
  { month: 'Mar', revenue: 48000, target: 50000, lastYear: 45000 },
  { month: 'Apr', revenue: 61000, target: 55000, lastYear: 48000 },
  { month: 'May', revenue: 55000, target: 58000, lastYear: 52000 },
  { month: 'Jun', revenue: 67000, target: 60000, lastYear: 55000 },
  { month: 'Jul', revenue: 72000, target: 65000, lastYear: 58000 },
  { month: 'Aug', revenue: 69000, target: 70000, lastYear: 62000 },
  { month: 'Sep', revenue: 78000, target: 72000, lastYear: 65000 },
  { month: 'Oct', revenue: 85000, target: 78000, lastYear: 70000 },
  { month: 'Nov', revenue: 91000, target: 85000, lastYear: 75000 },
  { month: 'Dec', revenue: 98000, target: 90000, lastYear: 82000 },
]

const conversionData = [
  { name: 'Visitors', value: 10000, fill: '#6366f1' },
  { name: 'Leads', value: 4500, fill: '#8b5cf6' },
  { name: 'Qualified', value: 2200, fill: '#a855f7' },
  { name: 'Proposals', value: 1100, fill: '#c084fc' },
  { name: 'Closed', value: 550, fill: '#e879f9' },
]

const activityData = [
  { hour: '00', active: 120 }, { hour: '02', active: 80 }, { hour: '04', active: 45 },
  { hour: '06', active: 90 }, { hour: '08', active: 350 }, { hour: '10', active: 480 },
  { hour: '12', active: 420 }, { hour: '14', active: 510 }, { hour: '16', active: 490 },
  { hour: '18', active: 380 }, { hour: '20', active: 290 }, { hour: '22', active: 180 },
]

const pipelineData = [
  { stage: 'Discovery', value: 85000, deals: 24 },
  { stage: 'Proposal', value: 125000, deals: 18 },
  { stage: 'Negotiation', value: 95000, deals: 12 },
  { stage: 'Closing', value: 180000, deals: 8 },
]

const recentActivities = [
  { id: 1, type: 'deal', user: 'Sarah Chen', action: 'closed deal with', target: 'Acme Corp', value: '$45,000', time: '2 min ago', avatar: 'SC' },
  { id: 2, type: 'lead', user: 'Mike Johnson', action: 'added new lead', target: 'TechStart Inc', value: null, time: '15 min ago', avatar: 'MJ' },
  { id: 3, type: 'meeting', user: 'Emma Wilson', action: 'scheduled meeting with', target: 'Global Systems', value: null, time: '32 min ago', avatar: 'EW' },
  { id: 4, type: 'email', user: 'Alex Rivera', action: 'sent proposal to', target: 'DataFlow Labs', value: '$28,500', time: '1 hour ago', avatar: 'AR' },
  { id: 5, type: 'call', user: 'Jordan Lee', action: 'completed call with', target: 'CloudNine Tech', value: null, time: '2 hours ago', avatar: 'JL' },
]

const tasks = [
  { id: 1, title: 'Follow up with Enterprise leads', priority: 'high', due: 'Today', status: 'pending' },
  { id: 2, title: 'Prepare Q4 sales forecast', priority: 'medium', due: 'Tomorrow', status: 'in_progress' },
  { id: 3, title: 'Review contract for TechCorp', priority: 'high', due: 'Today', status: 'pending' },
  { id: 4, title: 'Update CRM automation rules', priority: 'low', due: 'This week', status: 'pending' },
]

const topCustomers = [
  { name: 'Acme Corporation', revenue: 285000, growth: 12.5, deals: 8 },
  { name: 'TechGiant Inc', revenue: 198000, growth: 8.2, deals: 5 },
  { name: 'Global Systems Ltd', revenue: 156000, growth: -2.1, deals: 4 },
  { name: 'InnovateTech', revenue: 134000, growth: 24.8, deals: 6 },
  { name: 'DataDriven Co', revenue: 112000, growth: 15.3, deals: 3 },
]

// KPI Card Component
const KPICard = ({ title, value, change, changeType, icon: Icon, color, prefix = '', suffix = '', loading = false }: {
  title: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
  color: string
  prefix?: string
  suffix?: string
  loading?: boolean
}) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
  }

  const iconColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  }

  if (loading) {
    return (
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-xl p-6 cursor-pointer group`}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color === 'blue' ? 'rgba(59, 130, 246, 0.15)' : color === 'purple' ? 'rgba(147, 51, 234, 0.15)' : color === 'emerald' ? 'rgba(16, 185, 129, 0.15)' : color === 'amber' ? 'rgba(245, 158, 11, 0.15)' : color === 'rose' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(6, 182, 212, 0.15)'} 0%, transparent 70%)`
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={suffix === '%' ? 1 : 0} />
          </p>
          <div className="flex items-center gap-1.5">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-0.5 text-sm font-medium ${changeType === 'increase' ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {changeType === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(change)}%
            </motion.span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        </div>

        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`p-3 rounded-xl ${iconColors[color as keyof typeof iconColors]}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Sparkline mini chart */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData.slice(-6)}>
            <Area type="monotone" dataKey="revenue" stroke="currentColor" fill="currentColor" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

// Activity Item Component
const ActivityItem = ({ activity, index }: { activity: typeof recentActivities[0], index: number }) => {
  const typeColors = {
    deal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    meeting: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    call: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }

  const typeIcons = {
    deal: DollarSign,
    lead: UserPlus,
    meeting: Video,
    email: Mail,
    call: Phone,
  }

  const Icon = typeIcons[activity.type as keyof typeof typeIcons]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer group"
    >
      <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600`}>
        {activity.avatar}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className={`absolute -bottom-1 -right-1 p-1 rounded-full ${typeColors[activity.type as keyof typeof typeColors]} border`}
        >
          <Icon className="w-3 h-3" />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-white">{activity.user}</span>
          {' '}{activity.action}{' '}
          <span className="font-medium text-white">{activity.target}</span>
          {activity.value && (
            <span className="ml-1 text-emerald-400 font-semibold">{activity.value}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-700/50 text-gray-400 transition-opacity"
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

// Task Item Component
const TaskItem = ({ task, index }: { task: typeof tasks[0], index: number }) => {
  const [isCompleted, setIsCompleted] = useState(task.status === 'completed')

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer group ${isCompleted ? 'opacity-50' : ''}`}
    >
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        onClick={() => setIsCompleted(!isCompleted)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-emerald-500'
        }`}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
          {task.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Due: {task.due}</p>
      </div>

      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
        {task.priority}
      </span>
    </motion.div>
  )
}

// Sidebar Component
const Sidebar = ({ isCollapsed, setIsCollapsed, theme }: {
  isCollapsed: boolean,
  setIsCollapsed: (v: boolean) => void,
  theme: Theme
}) => {
  const [activeItem, setActiveItem] = useState('/crm')

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/50'
          : 'bg-white border-r border-gray-200'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">NexusCRM</h1>
                <p className="text-xs text-gray-500">Enterprise Suite</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <motion.ul variants={staggerContainer} initial="initial" animate="animate" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.path

            return (
              <motion.li key={item.path} variants={fadeInUp}>
                <motion.button
                  onClick={() => setActiveItem(item.path)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                    />
                  )}

                  <motion.div
                    whileHover={{ rotate: isActive ? 0 : 10 }}
                    className={`flex-shrink-0 p-2 rounded-lg ${isActive ? 'bg-blue-500/20' : 'group-hover:bg-gray-700/50'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 text-left text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {!isCollapsed && item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.li>
            )
          })}
        </motion.ul>
      </nav>

      {/* Collapse button */}
      <div className="p-4 border-t border-gray-800/50">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}

// Top Navigation Component
const TopNav = ({ theme, setTheme, sidebarCollapsed }: {
  theme: Theme,
  setTheme: (t: Theme) => void,
  sidebarCollapsed: boolean
}) => {
  const [searchFocused, setSearchFocused] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      className={`fixed top-0 right-0 left-0 z-40 h-16 flex items-center justify-between px-6 backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-gray-900/80 border-b border-gray-800/50'
          : 'bg-white/80 border-b border-gray-200'
      }`}
    >
      {/* Search */}
      <motion.div
        animate={{ width: searchFocused ? 400 : 320 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search customers, deals, reports..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`w-full pl-10 pr-12 py-2 rounded-xl text-sm transition-all ${
            theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
              : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-medium rounded bg-gray-700/50 text-gray-400 border border-gray-600/50">
          ⌘K
        </kbd>
      </motion.div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Quick actions */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Add</span>
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div key="sun" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
                <Sun className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
                <Moon className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"
            />
          </motion.button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      className="p-4 border-b border-gray-800/50 cursor-pointer"
                    >
                      <p className="text-sm text-white">New lead assigned to you</p>
                      <p className="text-xs text-gray-500 mt-1">{i} hour ago</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <motion.button
            onClick={() => setProfileOpen(!profileOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 pl-3 pr-4 py-1.5 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              JD
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden"
              >
                {['Profile', 'Settings', 'Billing', 'Help Center', 'Sign Out'].map((item, i) => (
                  <motion.button
                    key={item}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', x: 4 }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:text-white border-b border-gray-800/50 last:border-0"
                  >
                    {item}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

// Main Dashboard Component
export default function CRMDashboard() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Focus search
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarCollapsed(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const kpiData = [
    { title: 'Total Revenue', value: 847500, change: 12.5, changeType: 'increase' as const, icon: DollarSign, color: 'emerald', prefix: '$' },
    { title: 'Active Deals', value: 156, change: 8.3, changeType: 'increase' as const, icon: Target, color: 'blue' },
    { title: 'Conversion Rate', value: 24.8, change: 3.2, changeType: 'increase' as const, icon: TrendingUp, color: 'purple', suffix: '%' },
    { title: 'Active Users', value: 2847, change: 2.1, changeType: 'decrease' as const, icon: Users, color: 'amber' },
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} theme={theme} />

      {/* Top Navigation */}
      <TopNav theme={theme} setTheme={setTheme} sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
              <p className="text-gray-400 mt-1">Welcome back, John. Here's what's happening today.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Date range selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-800/50 border border-gray-700/50">
                {['24h', '7d', '30d', '90d', '1y'].map((range) => (
                  <motion.button
                    key={range}
                    onClick={() => setDateRange(range)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      dateRange === range
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </motion.button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} loading={isLoading} />
            ))}
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                  <p className="text-sm text-gray-400">Monthly revenue vs target</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-400">Target</span>
                  </div>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#targetGradient)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Conversion Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Sales Funnel</h3>
                  <p className="text-sm text-gray-400">Conversion stages</p>
                </div>
              </div>

              <div className="space-y-3">
                {conversionData.map((stage, index) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-300">{stage.name}</span>
                      <span className="text-sm text-gray-400">{stage.value.toLocaleString()}</span>
                    </div>
                    <div className="h-8 rounded-lg bg-gray-700/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.value / conversionData[0].value) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full rounded-lg"
                        style={{ backgroundColor: stage.fill }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Overall conversion</span>
                  <span className="text-lg font-bold text-emerald-400">5.5%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity and Tasks Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Pipeline</h3>
                  <p className="text-sm text-gray-400">Deal stages overview</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                    <YAxis type="category" dataKey="stage" stroke="#6b7280" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      radius={[0, 8, 8, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-700/30">
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-xl font-bold text-white">$485k</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-700/30">
                  <p className="text-sm text-gray-400">Avg Deal Size</p>
                  <p className="text-xl font-bold text-white">$7.8k</p>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <p className="text-sm text-gray-400">Team updates</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View all
                </motion.button>
              </div>

              <div className="space-y-1 max-h-80 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} index={index} />
                ))}
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Tasks</h3>
                  <p className="text-sm text-gray-400">Your pending items</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-1">
                {tasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index} />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white rounded-xl border border-dashed border-gray-700 hover:border-gray-600 transition-colors"
              >
                + Add new task
              </motion.button>
            </motion.div>
          </div>

          {/* Bottom Row - Top Customers & Activity Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Top Customers</h3>
                  <p className="text-sm text-gray-400">By revenue this month</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View all
                </motion.button>
              </div>

              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{customer.name}</p>
                      <p className="text-sm text-gray-400">{customer.deals} deals</p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">${(customer.revenue / 1000).toFixed(0)}k</p>
                      <p className={`text-sm flex items-center gap-1 ${customer.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {customer.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(customer.growth)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">User Activity</h3>
                  <p className="text-sm text-gray-400">Active users by hour</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Peak:</span>
                  <span className="text-sm font-medium text-emerald-400">2:00 PM</span>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar
                      dataKey="active"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      {activityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.active > 400 ? '#10b981' : entry.active > 200 ? '#6366f1' : '#6b7280'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500" />
                  <span className="text-xs text-gray-400">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-xs text-gray-400">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-xs text-gray-400">High</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Keyboard shortcuts hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500"
          >
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">⌘K</kbd>
              Search
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">⌘B</kbd>
              Toggle sidebar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">⌘N</kbd>
              New deal
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">?</kbd>
              Help
            </span>
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
