/**
 * RustPress Plugin Settings & Configuration
 * Phase 5: Enhancements 39-44
 *
 * Enhancement 39: Plugin Settings Panel
 * Enhancement 40: Dynamic Form Builder
 * Enhancement 41: Settings Validation
 * Enhancement 42: Import/Export Settings
 * Enhancement 43: Reset to Defaults
 * Enhancement 44: Settings Search
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Search,
  X,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  GripVertical,
  Code,
  Palette,
  Hash,
  Type,
  List,
  Calendar,
  Clock,
  Link,
  Mail,
  Lock,
  FileText,
  Image,
  Sliders,
  HelpCircle,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export type SettingType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'toggle'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'time'
  | 'datetime'
  | 'url'
  | 'email'
  | 'password'
  | 'code'
  | 'image'
  | 'file'
  | 'slider'
  | 'tags'
  | 'keyvalue';

export interface SettingOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: (value: any) => string | null;
}

export interface SettingDefinition {
  id: string;
  key: string;
  label: string;
  description?: string;
  type: SettingType;
  defaultValue: any;
  placeholder?: string;
  options?: SettingOption[];
  validation?: SettingValidation;
  helpText?: string;
  dependsOn?: { key: string; value: any };
  group?: string;
  advanced?: boolean;
  pro?: boolean;
}

export interface SettingsGroup {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  settings: SettingDefinition[];
  collapsed?: boolean;
}

export interface ValidationError {
  key: string;
  message: string;
}

// ============================================================================
// Enhancement 39: Plugin Settings Panel
// ============================================================================

interface PluginSettingsPanelProps {
  pluginName: string;
  pluginVersion: string;
  groups: SettingsGroup[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  onImport: (settings: Record<string, any>) => void;
  onExport: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  errors?: ValidationError[];
}

export function PluginSettingsPanel({
  pluginName,
  pluginVersion,
  groups,
  values,
  onChange,
  onSave,
  onReset,
  onImport,
  onExport,
  isSaving = false,
  isDirty = false,
  errors = [],
}: PluginSettingsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Filter settings based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups.map((group) => ({
        ...group,
        settings: group.settings.filter((s) => showAdvanced || !s.advanced),
      }));
    }

    const query = searchQuery.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        settings: group.settings.filter(
          (s) =>
            (showAdvanced || !s.advanced) &&
            (s.label.toLowerCase().includes(query) ||
              s.description?.toLowerCase().includes(query) ||
              s.key.toLowerCase().includes(query))
        ),
      }))
      .filter((group) => group.settings.length > 0);
  }, [groups, searchQuery, showAdvanced]);

  const getErrorForKey = (key: string) => errors.find((e) => e.key === key);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {pluginName} Settings
              </h2>
              <p className="text-sm text-neutral-500">
                Version {pluginVersion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SettingsImportExport onImport={onImport} onExport={onExport} />
            <button
              onClick={onReset}
              disabled={!isDirty}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl',
                'text-sm font-medium',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={onSave}
              disabled={!isDirty || isSaving || errors.length > 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'text-sm font-medium',
                'bg-primary-600 text-white',
                'hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-4 mt-4">
          <SettingsSearch
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={filteredGroups.reduce((acc, g) => acc + g.settings.length, 0)}
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            Show advanced
          </label>
        </div>

        {/* Validation Errors Summary */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              {errors.length} validation error(s) found. Please fix them before saving.
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-56 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto p-4">
          <div className="space-y-1">
            {groups.map((group) => {
              const Icon = group.icon || Settings;
              const hasErrors = group.settings.some((s) => getErrorForKey(s.key));

              return (
                <button
                  key={group.id}
                  onClick={() => setActiveGroup(group.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl',
                    'text-left text-sm font-medium',
                    'transition-colors',
                    activeGroup === group.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{group.label}</span>
                  {hasErrors && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={cn(
                activeGroup === group.id || searchQuery ? 'block' : 'hidden'
              )}
            >
              {/* Group Header */}
              <div className="mb-6">
                <button
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="flex items-center gap-2 text-left"
                >
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {group.label}
                  </h3>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-neutral-400 transition-transform',
                      collapsedGroups.has(group.id) && 'rotate-180'
                    )}
                  />
                </button>
                {group.description && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Settings List */}
              <AnimatePresence>
                {!collapsedGroups.has(group.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6"
                  >
                    {group.settings.map((setting) => {
                      // Check dependency
                      if (setting.dependsOn) {
                        const depValue = values[setting.dependsOn.key];
                        if (depValue !== setting.dependsOn.value) {
                          return null;
                        }
                      }

                      const error = getErrorForKey(setting.key);

                      return (
                        <DynamicFormField
                          key={setting.id}
                          setting={setting}
                          value={values[setting.key] ?? setting.defaultValue}
                          onChange={(value) => onChange(setting.key, value)}
                          error={error}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 40: Dynamic Form Builder
// ============================================================================

interface DynamicFormFieldProps {
  setting: SettingDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: ValidationError;
}

export function DynamicFormField({ setting, value, onChange, error }: DynamicFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const renderField = () => {
    switch (setting.type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <input
            type={setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.placeholder}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border transition-colors',
              error
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'placeholder-neutral-400',
              'focus:ring-2 focus:border-transparent'
            )}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={setting.placeholder}
              className={cn(
                'w-full px-4 py-2.5 pr-10 rounded-xl',
                'border transition-colors',
                error
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                  : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'focus:ring-2 focus:border-transparent'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.placeholder}
            rows={4}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border transition-colors',
              error
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'placeholder-neutral-400',
              'resize-none focus:ring-2 focus:border-transparent'
            )}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder={setting.placeholder}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border transition-colors',
              error
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'focus:ring-2 focus:border-transparent'
            )}
          />
        );

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full',
              'transition-colors',
              value ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm',
                'transition-transform',
                value ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border transition-colors appearance-none',
              error
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white',
              'focus:ring-2 focus:border-transparent'
            )}
          >
            <option value="">Select...</option>
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {setting.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
                  'border transition-colors',
                  selectedValues.includes(option.value)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option.value));
                    }
                  }}
                  disabled={option.disabled}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-neutral-500">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {setting.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
                  'border transition-colors',
                  value === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                )}
              >
                <input
                  type="radio"
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  disabled={option.disabled}
                  className="w-4 h-4 border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {option.label}
                  </p>
                  {option.description && (
                    <p className="text-xs text-neutral-500">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border border-neutral-300 dark:border-neutral-600"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl',
                'border border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-white',
                'font-mono uppercase'
              )}
            />
          </div>
        );

      case 'slider':
        const min = setting.validation?.min ?? 0;
        const max = setting.validation?.max ?? 100;
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">{min}</span>
              <span className="font-medium text-neutral-900 dark:text-white">{value ?? min}</span>
              <span className="text-neutral-500">{max}</span>
            </div>
            <input
              type="range"
              value={value ?? min}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        );

      case 'tags':
        const tags = Array.isArray(value) ? value : [];
        const [newTag, setNewTag] = useState('');

        const addTag = () => {
          if (newTag.trim() && !tags.includes(newTag.trim())) {
            onChange([...tags, newTag.trim()]);
            setNewTag('');
          }
        };

        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className={cn(
                  'flex-1 px-4 py-2 rounded-xl',
                  'border border-neutral-300 dark:border-neutral-600',
                  'bg-white dark:bg-neutral-800',
                  'text-neutral-900 dark:text-white'
                )}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => onChange(tags.filter((_: string, i: number) => i !== index))}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case 'keyvalue':
        const pairs = Array.isArray(value) ? value : [];
        return (
          <KeyValueEditor
            value={pairs}
            onChange={onChange}
          />
        );

      case 'code':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.placeholder}
            rows={8}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-neutral-900 text-green-400',
              'font-mono text-sm',
              'resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            )}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white'
            )}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white'
            )}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white'
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {setting.label}
          {setting.validation?.required && (
            <span className="text-red-500">*</span>
          )}
          {setting.pro && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
              PRO
            </span>
          )}
          {setting.advanced && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full">
              Advanced
            </span>
          )}
        </label>
        {setting.helpText && (
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-600"
            title={setting.helpText}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {setting.description && (
        <p className="text-sm text-neutral-500">{setting.description}</p>
      )}

      {renderField()}

      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// Key-Value Editor Component
interface KeyValueEditorProps {
  value: { key: string; value: string }[];
  onChange: (value: { key: string; value: string }[]) => void;
}

function KeyValueEditor({ value, onChange }: KeyValueEditorProps) {
  const addPair = () => {
    onChange([...value, { key: '', value: '' }]);
  };

  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const removePair = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.target.value)}
            placeholder="Key"
            className={cn(
              'flex-1 px-3 py-2 rounded-lg',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white text-sm'
            )}
          />
          <span className="text-neutral-400">=</span>
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.target.value)}
            placeholder="Value"
            className={cn(
              'flex-1 px-3 py-2 rounded-lg',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-white text-sm'
            )}
          />
          <button
            type="button"
            onClick={() => removePair(index)}
            className="p-2 text-neutral-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-sm text-primary-600 dark:text-primary-400',
          'hover:bg-primary-50 dark:hover:bg-primary-900/20'
        )}
      >
        <Plus className="w-4 h-4" />
        Add pair
      </button>
    </div>
  );
}

// ============================================================================
// Enhancement 41: Settings Validation
// ============================================================================

export function validateSetting(setting: SettingDefinition, value: any): string | null {
  const { validation } = setting;
  if (!validation) return null;

  // Required check
  if (validation.required) {
    if (value === null || value === undefined || value === '') {
      return `${setting.label} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${setting.label} is required`;
    }
  }

  // Skip other validations if value is empty and not required
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // String length checks
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${setting.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${setting.label} must be at most ${validation.maxLength} characters`;
    }
  }

  // Number range checks
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `${setting.label} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `${setting.label} must be at most ${validation.max}`;
    }
  }

  // Pattern check
  if (validation.pattern && typeof value === 'string') {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return validation.patternMessage || `${setting.label} format is invalid`;
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value);
  }

  return null;
}

export function validateAllSettings(
  groups: SettingsGroup[],
  values: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  groups.forEach((group) => {
    group.settings.forEach((setting) => {
      const value = values[setting.key] ?? setting.defaultValue;
      const error = validateSetting(setting, value);
      if (error) {
        errors.push({ key: setting.key, message: error });
      }
    });
  });

  return errors;
}

// ============================================================================
// Enhancement 42: Import/Export Settings
// ============================================================================

interface SettingsImportExportProps {
  onImport: (settings: Record<string, any>) => void;
  onExport: () => void;
}

export function SettingsImportExport({ onImport, onExport }: SettingsImportExportProps) {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result as string);
        onImport(settings);
      } catch (err) {
        console.error('Failed to parse settings file:', err);
      }
    };
    reader.readAsText(file);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'text-sm font-medium',
          'text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'transition-colors'
        )}
      >
        <Sliders className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute right-0 top-full mt-1 w-48',
              'p-2 rounded-xl',
              'bg-white dark:bg-neutral-800',
              'border border-neutral-200 dark:border-neutral-700',
              'shadow-lg z-10'
            )}
          >
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                'text-sm text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
            >
              <Upload className="w-4 h-4" />
              Import Settings
            </button>
            <button
              onClick={() => {
                onExport();
                setShowMenu(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                'text-sm text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
            >
              <Download className="w-4 h-4" />
              Export Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}

// ============================================================================
// Enhancement 43: Reset to Defaults
// ============================================================================

interface ResetToDefaultsProps {
  groups: SettingsGroup[];
  onReset: (keys?: string[]) => void;
}

export function ResetToDefaults({ groups, onReset }: ResetToDefaultsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [resetAll, setResetAll] = useState(true);

  const allKeys = useMemo(() => {
    return groups.flatMap((g) => g.settings.map((s) => s.key));
  }, [groups]);

  const handleReset = () => {
    if (resetAll) {
      onReset();
    } else {
      onReset(Array.from(selectedKeys));
    }
    setShowModal(false);
    setSelectedKeys(new Set());
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl',
          'text-sm font-medium',
          'text-neutral-700 dark:text-neutral-300',
          'border border-neutral-300 dark:border-neutral-600',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
      >
        <RotateCcw className="w-4 h-4" />
        Reset to Defaults
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Reset Settings
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={resetAll}
                    onChange={() => setResetAll(true)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Reset all settings
                    </p>
                    <p className="text-sm text-neutral-500">
                      Restore all settings to their default values
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={!resetAll}
                    onChange={() => setResetAll(false)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Reset selected settings
                    </p>
                    <p className="text-sm text-neutral-500">
                      Choose specific settings to reset
                    </p>
                  </div>
                </label>

                {!resetAll && (
                  <div className="max-h-48 overflow-y-auto space-y-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    {groups.map((group) => (
                      <div key={group.id}>
                        <p className="text-xs font-medium text-neutral-500 uppercase mb-1">
                          {group.label}
                        </p>
                        {group.settings.map((setting) => (
                          <label
                            key={setting.key}
                            className="flex items-center gap-2 py-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedKeys.has(setting.key)}
                              onChange={(e) => {
                                const next = new Set(selectedKeys);
                                if (e.target.checked) {
                                  next.add(setting.key);
                                } else {
                                  next.delete(setting.key);
                                }
                                setSelectedKeys(next);
                              }}
                              className="w-4 h-4 rounded text-primary-600"
                            />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {setting.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={!resetAll && selectedKeys.size === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Enhancement 44: Settings Search
// ============================================================================

interface SettingsSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export function SettingsSearch({ value, onChange, resultCount }: SettingsSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search settings... (⌘K)"
        className={cn(
          'w-full pl-9 pr-20 py-2 rounded-xl',
          'border border-neutral-300 dark:border-neutral-600',
          'bg-white dark:bg-neutral-800',
          'text-neutral-900 dark:text-white',
          'placeholder-neutral-400',
          'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
        )}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-xs text-neutral-500">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => onChange('')}
            className="p-1 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

export const sampleSettingsGroups: SettingsGroup[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Basic plugin settings',
    icon: Settings,
    settings: [
      {
        id: '1',
        key: 'site_title',
        label: 'Site Title',
        description: 'The title shown in search results',
        type: 'text',
        defaultValue: '',
        placeholder: 'My Website',
        validation: { required: true, maxLength: 60 },
      },
      {
        id: '2',
        key: 'enable_feature',
        label: 'Enable Feature',
        description: 'Toggle this feature on or off',
        type: 'toggle',
        defaultValue: true,
      },
      {
        id: '3',
        key: 'content_type',
        label: 'Content Type',
        type: 'select',
        defaultValue: 'article',
        options: [
          { value: 'article', label: 'Article' },
          { value: 'product', label: 'Product' },
          { value: 'service', label: 'Service' },
        ],
      },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Customize the look and feel',
    icon: Palette,
    settings: [
      {
        id: '4',
        key: 'primary_color',
        label: 'Primary Color',
        type: 'color',
        defaultValue: '#3B82F6',
      },
      {
        id: '5',
        key: 'font_size',
        label: 'Base Font Size',
        type: 'slider',
        defaultValue: 16,
        validation: { min: 12, max: 24 },
      },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Advanced configuration options',
    icon: Code,
    settings: [
      {
        id: '6',
        key: 'custom_css',
        label: 'Custom CSS',
        type: 'code',
        defaultValue: '',
        placeholder: '/* Your custom CSS here */',
        advanced: true,
      },
      {
        id: '7',
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        defaultValue: '',
        validation: { required: true, minLength: 32 },
        pro: true,
      },
    ],
  },
];

export default PluginSettingsPanel;
