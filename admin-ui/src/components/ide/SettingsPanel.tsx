/**
 * SettingsPanel - Project settings for the IDE
 * Shows RustPress project configuration
 */

import React, { useState } from 'react';
import {
  Package, Tag, User, Globe, FileText, Cog,
  ChevronDown, ChevronRight, Info, Database, Server
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SettingsPanelProps {
  projectName?: string;
  projectVersion?: string;
}

interface SettingSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// ============================================
// SETTING SECTION COMPONENT
// ============================================

const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// FORM FIELD COMPONENT
// ============================================

interface FieldProps {
  label: string;
  value: string | number;
  type?: 'text' | 'textarea' | 'number';
  hint?: string;
  readOnly?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  type = 'text',
  hint,
  readOnly = false
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-gray-400">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          readOnly={readOnly}
          className={`w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded resize-none focus:outline-none focus:border-blue-500 ${
            readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-white'
          }`}
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          className={`w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 ${
            readOnly ? 'text-gray-500 cursor-not-allowed' : 'text-white'
          }`}
        />
      )}
      {hint && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </p>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  projectName = 'RustPress',
  projectVersion = '1.0.0'
}) => {
  return (
    <div className="divide-y divide-gray-700">
      {/* Project Identity */}
      <SettingSection
        title="Project"
        icon={<Package className="w-4 h-4 text-orange-400" />}
      >
        <Field
          label="Project Name"
          value={projectName}
          readOnly
        />
        <Field
          label="Version"
          value={projectVersion}
          hint="Defined in Cargo.toml"
          readOnly
        />
        <Field
          label="Description"
          value="A modern CMS built with Rust"
          type="textarea"
          readOnly
        />
      </SettingSection>

      {/* Server Configuration */}
      <SettingSection
        title="Server"
        icon={<Server className="w-4 h-4 text-blue-400" />}
      >
        <Field
          label="Host"
          value="127.0.0.1"
          hint="Server bind address"
        />
        <Field
          label="Port"
          value="8080"
          type="number"
          hint="Server port"
        />
        <Field
          label="Environment"
          value="development"
          readOnly
        />
      </SettingSection>

      {/* Database Configuration */}
      <SettingSection
        title="Database"
        icon={<Database className="w-4 h-4 text-green-400" />}
        defaultOpen={false}
      >
        <Field
          label="Type"
          value="PostgreSQL"
          readOnly
        />
        <Field
          label="Host"
          value="localhost"
        />
        <Field
          label="Database"
          value="rustpress"
        />
      </SettingSection>

      {/* Editor Settings */}
      <SettingSection
        title="Editor"
        icon={<Cog className="w-4 h-4 text-purple-400" />}
        defaultOpen={false}
      >
        <div className="space-y-1">
          <label className="block text-xs text-gray-400">Tab Size</label>
          <select className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-gray-400">Theme</label>
          <select className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500">
            <option value="vs-dark">Dark (VS Code)</option>
            <option value="monokai">Monokai</option>
            <option value="github-dark">GitHub Dark</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="minimap"
            defaultChecked
            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
          />
          <label htmlFor="minimap" className="text-sm text-gray-300">
            Show minimap
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="wordwrap"
            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
          />
          <label htmlFor="wordwrap" className="text-sm text-gray-300">
            Word wrap
          </label>
        </div>
      </SettingSection>

      {/* Project Stats (Read-only) */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Project Structure
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="px-3 py-2 bg-gray-800 rounded">
            <p className="text-lg font-semibold">5</p>
            <p className="text-xs text-gray-500">Crates</p>
          </div>
          <div className="px-3 py-2 bg-gray-800 rounded">
            <p className="text-lg font-semibold">1</p>
            <p className="text-xs text-gray-500">Themes</p>
          </div>
          <div className="px-3 py-2 bg-gray-800 rounded">
            <p className="text-lg font-semibold">0</p>
            <p className="text-xs text-gray-500">Plugins</p>
          </div>
          <div className="px-3 py-2 bg-gray-800 rounded">
            <p className="text-lg font-semibold">1</p>
            <p className="text-xs text-gray-500">Admin UI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
