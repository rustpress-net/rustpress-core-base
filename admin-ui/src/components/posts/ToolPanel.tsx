import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Eye,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';

interface ToolPanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;

  // Panel sections
  settings?: React.ReactNode;
  preview?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;

  // Customization
  className?: string;
  showTabs?: boolean;
  defaultTab?: 'main' | 'settings' | 'preview';
  isLoading?: boolean;
  helpText?: string;

  // Callbacks
  onApply?: () => void;
  onInsert?: (content: string) => void;
  applyLabel?: string;
  insertLabel?: string;
}

type TabType = 'main' | 'settings' | 'preview';

export default function ToolPanel({
  title,
  description,
  icon,
  children,
  onClose,
  settings,
  preview,
  actions,
  footer,
  className,
  showTabs = true,
  defaultTab = 'main',
  isLoading = false,
  helpText,
  onApply,
  onInsert,
  applyLabel = 'Apply',
  insertLabel = 'Insert',
}: ToolPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; content?: React.ReactNode }[] = [
    { id: 'main', label: 'Main', icon: <Sparkles className="w-4 h-4" />, content: children },
    ...(settings ? [{ id: 'settings' as TabType, label: 'Settings', icon: <Settings className="w-4 h-4" />, content: settings }] : []),
    ...(preview ? [{ id: 'preview' as TabType, label: 'Preview', icon: <Eye className="w-4 h-4" />, content: preview }] : []),
  ];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={clsx(
        'flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden',
        isExpanded && 'fixed inset-4 z-50 shadow-2xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-850">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {helpText && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                showHelp
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <AnimatePresence>
        {showHelp && helpText && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800"
          >
            <p className="px-4 py-3 text-sm text-blue-700 dark:text-blue-300">{helpText}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      {showTabs && tabs.length > 1 && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="p-4"
          >
            {tabs.find((t) => t.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      {(actions || onApply || onInsert) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            {actions}
          </div>
          <div className="flex items-center gap-2">
            {onApply && (
              <button
                onClick={onApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {applyLabel}
              </button>
            )}
            {onInsert && (
              <button
                onClick={() => onInsert('')}
                className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {insertLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
          {footer}
        </div>
      )}

      {/* Expanded Overlay Background */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </motion.div>
  );
}

// Reusable sub-components for tool panels

interface ToolSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function ToolSection({ title, children, collapsible = false, defaultOpen = true, className }: ToolSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={clsx('mb-4', className)}>
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-between w-full text-left mb-2',
          collapsible && 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400'
        )}
        disabled={!collapsible}
      >
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</h4>
        {collapsible && (
          <span className="text-gray-500 dark:text-gray-400">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ToolGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 2 | 3 | 4;
}

export function ToolGrid({ children, columns = 3, gap = 3 }: ToolGridProps) {
  return (
    <div
      className={clsx(
        'grid',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        gap === 2 && 'gap-2',
        gap === 3 && 'gap-3',
        gap === 4 && 'gap-4'
      )}
    >
      {children}
    </div>
  );
}

interface ToolItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function ToolItem({ icon, label, description, onClick, isSelected, disabled }: ToolItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className={clsx(
        'p-2 rounded-lg',
        isSelected
          ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      )}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
      {description && (
        <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{description}</span>
      )}
    </button>
  );
}

interface ToolSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function ToolSlider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '' }: ToolSliderProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-200">{label}</label>
        <span className="text-xs text-gray-500 dark:text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}

interface ToolColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ToolColorPicker({ label, value, onChange, presets }: ToolColorPickerProps) {
  const defaultPresets = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const colorPresets = presets || defaultPresets;

  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-2 block">{label}</label>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="#000000"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={clsx(
              'w-6 h-6 rounded border-2 transition-all',
              value === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-110'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

interface ToolSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function ToolSelect({ label, value, onChange, options }: ToolSelectProps) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface ToolInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'url';
}

export function ToolInput({ label, value, onChange, placeholder, type = 'text' }: ToolInputProps) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
      />
    </div>
  );
}

interface ToolToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function ToolToggle({ label, checked, onChange, description }: ToolToggleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <span
          className={clsx(
            'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}

interface ToolPreviewBoxProps {
  children: React.ReactNode;
  className?: string;
}

export function ToolPreviewBox({ children, className }: ToolPreviewBoxProps) {
  return (
    <div className={clsx(
      'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
      className
    )}>
      {children}
    </div>
  );
}
