import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cloud,
  CloudOff,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Save,
  RefreshCw,
  Settings,
  History,
  WifiOff,
  Wifi,
  X,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

interface AutosaveIndicatorProps {
  isDirty?: boolean
  lastSaved?: Date
  isSaving?: boolean
  isOnline?: boolean
  error?: string | null
  onManualSave?: () => void
  onRetry?: () => void
  onViewHistory?: () => void
  onSettingsClick?: () => void
  autosaveEnabled?: boolean
  autosaveInterval?: number
  className?: string
  content?: string
}

interface SaveState {
  status: 'saved' | 'saving' | 'error' | 'offline' | 'unsaved'
  message: string
  icon: React.ReactNode
  color: string
}

export default function AutosaveIndicator({
  isDirty = false,
  lastSaved,
  isSaving = false,
  isOnline = true,
  error = null,
  onManualSave,
  onRetry,
  onViewHistory,
  onSettingsClick,
  autosaveEnabled = true,
  autosaveInterval = 30,
  className,
}: AutosaveIndicatorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [timeSinceSave, setTimeSinceSave] = useState<string>('')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // Calculate time since last save
  const updateTimeSinceSave = useCallback(() => {
    if (!lastSaved) {
      setTimeSinceSave('Never')
      return
    }

    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 5) {
      setTimeSinceSave('Just now')
    } else if (seconds < 60) {
      setTimeSinceSave(`${seconds}s ago`)
    } else if (minutes < 60) {
      setTimeSinceSave(`${minutes}m ago`)
    } else {
      setTimeSinceSave(`${hours}h ago`)
    }
  }, [lastSaved])

  useEffect(() => {
    updateTimeSinceSave()
    const interval = setInterval(updateTimeSinceSave, 10000)
    return () => clearInterval(interval)
  }, [updateTimeSinceSave])

  // Show notification on save/error
  useEffect(() => {
    if (isSaving) return

    if (error) {
      setNotificationMessage('Failed to save')
      setShowNotification(true)
    } else if (lastSaved && !isDirty) {
      setNotificationMessage('Saved')
      setShowNotification(true)
    }

    const timeout = setTimeout(() => setShowNotification(false), 2000)
    return () => clearTimeout(timeout)
  }, [isSaving, error, lastSaved, isDirty])

  // Determine save state
  const getSaveState = (): SaveState => {
    if (!isOnline) {
      return {
        status: 'offline',
        message: 'Offline - Changes saved locally',
        icon: <CloudOff className="w-4 h-4" />,
        color: 'text-yellow-500',
      }
    }

    if (isSaving) {
      return {
        status: 'saving',
        message: 'Saving...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        color: 'text-blue-500',
      }
    }

    if (error) {
      return {
        status: 'error',
        message: error,
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-red-500',
      }
    }

    if (isDirty) {
      return {
        status: 'unsaved',
        message: 'Unsaved changes',
        icon: <Cloud className="w-4 h-4" />,
        color: 'text-yellow-500',
      }
    }

    return {
      status: 'saved',
      message: `Saved ${timeSinceSave}`,
      icon: <Check className="w-4 h-4" />,
      color: 'text-green-500',
    }
  }

  const saveState = getSaveState()

  return (
    <div className={clsx('relative', className)}>
      {/* Main Indicator Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          saveState.color
        )}
      >
        {saveState.icon}
        <span className="text-sm">{saveState.message}</span>
        <ChevronDown className={clsx(
          'w-3 h-3 transition-transform',
          showDropdown && 'rotate-180'
        )} />
      </button>

      {/* Save Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={clsx(
              'absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium',
              error
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            )}
          >
            <div className="flex items-center gap-2">
              {error ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {notificationMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Status Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'p-2 rounded-lg',
                    saveState.status === 'saved' && 'bg-green-100 dark:bg-green-900/30',
                    saveState.status === 'saving' && 'bg-blue-100 dark:bg-blue-900/30',
                    saveState.status === 'error' && 'bg-red-100 dark:bg-red-900/30',
                    saveState.status === 'offline' && 'bg-yellow-100 dark:bg-yellow-900/30',
                    saveState.status === 'unsaved' && 'bg-yellow-100 dark:bg-yellow-900/30'
                  )}>
                    {saveState.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">
                      {saveState.status === 'saved' && 'All changes saved'}
                      {saveState.status === 'saving' && 'Saving changes...'}
                      {saveState.status === 'error' && 'Save failed'}
                      {saveState.status === 'offline' && 'Working offline'}
                      {saveState.status === 'unsaved' && 'Unsaved changes'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {lastSaved
                        ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                        : 'Not saved yet'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-yellow-500" />
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Offline - Changes will sync when online
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Error Details */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="flex items-center gap-1 mt-2 text-xs text-red-600 hover:text-red-700"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              {/* Manual Save */}
              <button
                onClick={() => {
                  onManualSave?.()
                  setShowDropdown(false)
                }}
                disabled={!isDirty || isSaving}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  isDirty && !isSaving
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'opacity-50 cursor-not-allowed'
                )}
              >
                <Save className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">Save now</span>
                  <span className="block text-xs text-gray-500">Ctrl+S</span>
                </div>
              </button>

              {/* View History */}
              {onViewHistory && (
                <button
                  onClick={() => {
                    onViewHistory()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <History className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium">View history</span>
                    <span className="block text-xs text-gray-500">See all versions</span>
                  </div>
                </button>
              )}

              {/* Autosave Settings */}
              {onSettingsClick && (
                <button
                  onClick={() => {
                    onSettingsClick()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium">Autosave settings</span>
                    <span className="block text-xs text-gray-500">
                      {autosaveEnabled
                        ? `Every ${autosaveInterval} seconds`
                        : 'Disabled'
                      }
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Autosave: {autosaveEnabled ? `${autosaveInterval}s` : 'Off'}
                </span>
                <span>
                  {isDirty ? 'Changes pending' : 'No changes'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}

// Compact version for toolbar use
export function AutosaveIndicatorCompact({
  isDirty,
  isSaving,
  lastSaved,
  error,
  isOnline = true,
}: Pick<AutosaveIndicatorProps, 'isDirty' | 'isSaving' | 'lastSaved' | 'error' | 'isOnline'>) {
  const getIcon = () => {
    if (!isOnline) return <CloudOff className="w-4 h-4 text-yellow-500" />
    if (isSaving) return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (isDirty) return <Cloud className="w-4 h-4 text-yellow-500" />
    return <Check className="w-4 h-4 text-green-500" />
  }

  const getTooltip = () => {
    if (!isOnline) return 'Offline - Changes saved locally'
    if (isSaving) return 'Saving...'
    if (error) return `Error: ${error}`
    if (isDirty) return 'Unsaved changes'
    if (lastSaved) {
      return `Saved at ${lastSaved.toLocaleTimeString()}`
    }
    return 'All changes saved'
  }

  return (
    <div title={getTooltip()} className="flex items-center">
      {getIcon()}
    </div>
  )
}
