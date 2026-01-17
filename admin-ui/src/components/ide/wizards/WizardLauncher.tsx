/**
 * WizardLauncher - Central hub for launching project creation wizards
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Palette, Puzzle, Zap, AppWindow, Wand2, Plus,
  ChevronRight, Sparkles
} from 'lucide-react';
import { ThemeWizard } from './ThemeWizard';
import { PluginWizard } from './PluginWizard';
import { FunctionWizard } from './FunctionWizard';
import { AppWizard } from './AppWizard';

type WizardType = 'theme' | 'plugin' | 'function' | 'app' | null;

interface WizardLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (type: string, config: unknown) => void;
  defaultWizard?: WizardType;
}

const wizardOptions = [
  {
    id: 'theme',
    name: 'Theme',
    description: 'Create a new website theme with templates, colors, and typography',
    icon: Palette,
    color: 'from-purple-500 to-violet-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  {
    id: 'plugin',
    name: 'Plugin',
    description: 'Build a plugin to extend RustPress functionality with hooks and features',
    icon: Puzzle,
    color: 'from-green-500 to-emerald-600',
    textColor: 'text-green-400',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500/20',
  },
  {
    id: 'function',
    name: 'Function',
    description: 'Create serverless functions with triggers, scheduling, and APIs',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-500/20',
  },
  {
    id: 'app',
    name: 'App',
    description: 'Build a full application using RustPress as middleware platform',
    icon: AppWindow,
    color: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500',
    bgColor: 'bg-cyan-500/20',
  },
];

export const WizardLauncher: React.FC<WizardLauncherProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  defaultWizard = null,
}) => {
  const [activeWizard, setActiveWizard] = useState<WizardType>(defaultWizard);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleWizardSelect = (wizardId: WizardType) => {
    setActiveWizard(wizardId);
  };

  const handleWizardClose = () => {
    setActiveWizard(null);
  };

  const handleProjectCreate = (type: string, config: unknown) => {
    onProjectCreated?.(type, config);
    setActiveWizard(null);
    onClose();
  };

  // If a wizard is active, show it instead of the launcher
  if (activeWizard === 'theme') {
    return (
      <ThemeWizard
        isOpen={true}
        onClose={handleWizardClose}
        onCreate={(config) => handleProjectCreate('theme', config)}
      />
    );
  }

  if (activeWizard === 'plugin') {
    return (
      <PluginWizard
        isOpen={true}
        onClose={handleWizardClose}
        onCreate={(config) => handleProjectCreate('plugin', config)}
      />
    );
  }

  if (activeWizard === 'function') {
    return (
      <FunctionWizard
        isOpen={true}
        onClose={handleWizardClose}
        onCreate={(config) => handleProjectCreate('function', config)}
      />
    );
  }

  if (activeWizard === 'app') {
    return (
      <AppWizard
        isOpen={true}
        onClose={handleWizardClose}
        onCreate={(config) => handleProjectCreate('app', config)}
      />
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-3xl mx-4"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                  <Wand2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Project</h2>
                  <p className="text-sm text-gray-400">Choose a project type to get started</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {wizardOptions.map((option) => {
                  const Icon = option.icon;
                  const isHovered = hoveredOption === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleWizardSelect(option.id as WizardType)}
                      onMouseEnter={() => setHoveredOption(option.id)}
                      onMouseLeave={() => setHoveredOption(null)}
                      className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                        isHovered
                          ? `${option.borderColor} bg-gray-800/80`
                          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Gradient Background on Hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />

                      <div className="relative">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                          isHovered
                            ? `bg-gradient-to-br ${option.color}`
                            : option.bgColor
                        }`}>
                          <Icon className={`w-7 h-7 ${isHovered ? 'text-white' : option.textColor}`} />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          {option.name}
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                            isHovered ? 'translate-x-1 opacity-100' : 'opacity-0'
                          }`} />
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {option.description}
                        </p>

                        {/* Action hint */}
                        <div className={`mt-4 flex items-center gap-2 text-sm transition-all duration-300 ${
                          isHovered ? `${option.textColor} opacity-100` : 'text-gray-500 opacity-0'
                        }`}>
                          <Plus className="w-4 h-4" />
                          <span>Create {option.name}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Each wizard will guide you through creating a complete project structure
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WizardLauncher;
