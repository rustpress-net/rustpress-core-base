/**
 * OnboardingWizard - Full tutorial wizard for first-time IDE users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, ArrowRight,
  Files, Search, GitBranch, Terminal, Keyboard, Settings,
  Code, Palette, FolderOpen, Save, Eye, Zap, Split,
  Command, MousePointer, BookOpen, Sparkles, Play, SkipForward
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  highlightArea?: string; // CSS selector for highlight
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to RustPress IDE',
    description: 'Your powerful code editor for themes and plugins',
    icon: Sparkles,
    content: (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
        >
          <Code className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Let's Get Started!
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          This quick tour will show you the main features of the RustPress IDE.
          You'll learn how to edit files, use Git, and boost your productivity.
        </p>
      </div>
    )
  },
  {
    id: 'file-explorer',
    title: 'File Explorer',
    description: 'Browse and manage your project files',
    icon: Files,
    highlightArea: '.file-tree',
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Files className="w-5 h-5 text-blue-400" />
            File Explorer Panel
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            The left sidebar shows all your project files organized by type:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <strong>Themes</strong> - HTML templates, CSS, and assets
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <strong>Functions</strong> - Custom PHP functions
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <strong>Plugins</strong> - Extend functionality
            </li>
            <li className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <strong>Assets</strong> - Images, fonts, and media
            </li>
          </ul>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white text-sm font-medium mb-2">Pro Tips:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Right-click files for context menu options</li>
            <li>• Drag files to reorder or move between folders</li>
            <li>• Double-click a folder to collapse/expand</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'editor',
    title: 'Code Editor',
    description: 'Write code with powerful features',
    icon: Code,
    highlightArea: '.monaco-editor',
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Monaco Editor Features
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Powered by the same editor as VS Code, with full support for:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              IntelliSense
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Palette className="w-4 h-4 text-purple-400" />
              Syntax Highlighting
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Search className="w-4 h-4 text-green-400" />
              Find & Replace
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Split className="w-4 h-4 text-blue-400" />
              Split View
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white text-sm font-medium mb-2">Keyboard Shortcuts:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>Save file</span>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Find</span>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+F</kbd>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Go to line</span>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+G</kbd>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Format</span>
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Shift+Alt+F</kbd>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'quick-open',
    title: 'Quick Navigation',
    description: 'Find files and commands instantly',
    icon: Search,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Command className="w-5 h-5 text-blue-400" />
            Command Palette & Quick Open
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Access any feature or file in seconds:
          </p>
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">Ctrl+P</kbd>
              <div>
                <p className="text-white text-sm">Quick Open</p>
                <p className="text-gray-500 text-xs">Search and open any file by name</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">Ctrl+Shift+P</kbd>
              <div>
                <p className="text-white text-sm">Command Palette</p>
                <p className="text-gray-500 text-xs">Access all IDE commands</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-white">Ctrl+Shift+F</kbd>
              <div>
                <p className="text-white text-sm">Global Search</p>
                <p className="text-gray-500 text-xs">Search across all files</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'git',
    title: 'Git Integration',
    description: 'Version control made easy',
    icon: GitBranch,
    highlightArea: '.git-panel',
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-green-400" />
            Built-in Git Support
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Manage your code versions without leaving the editor:
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              View changed files at a glance
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Stage, unstage, and commit changes
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Switch between branches
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Push and pull from remote
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              View file diff with inline changes
            </li>
          </ul>
        </div>
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <p className="text-green-400 text-sm">
            💡 Click the Git icon in the right panel or press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+Shift+G</kbd> to open Git panel
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'terminal',
    title: 'Integrated Terminal',
    description: 'Run commands without switching windows',
    icon: Terminal,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            Terminal Panel
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Run build commands, scripts, and more:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <p className="text-green-400">$ npm run build</p>
            <p className="text-gray-400">Building theme...</p>
            <p className="text-green-400">✓ Build complete!</p>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white text-sm font-medium mb-2">Features:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Multiple terminal sessions</li>
            <li>• Command history (↑/↓ arrows)</li>
            <li>• Resizable panel</li>
            <li>• Open with <kbd className="px-1 bg-gray-700 rounded">Ctrl+`</kbd></li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'settings',
    title: 'Customize Your Editor',
    description: 'Make the IDE work for you',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Editor Settings
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Customize the editor to your preferences:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-900 rounded p-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Theme (Dark/Light)</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Font Size</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Minimap</span>
            </div>
            <div className="bg-gray-900 rounded p-2 flex items-center gap-2">
              <Save className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Auto-save</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">
            Access settings from the gear icon in the status bar or Activity Bar
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start building amazing themes',
    icon: Check,
    content: (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Code!
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          You now know the basics of the RustPress IDE. Start editing your theme
          files and remember - the Command Palette is always one shortcut away!
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Keyboard className="w-4 h-4" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">?</kbd> for keyboard shortcuts</span>
          </div>
        </div>
      </div>
    )
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <step.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress */}
              <div className="px-6 py-3 bg-gray-800/50">
                <div className="flex items-center gap-2">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-1 rounded-full transition-colors ${
                        idx <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>

              {/* Content */}
              <div className={`p-6 min-h-[300px] ${isFirstStep || isLastStep ? 'flex items-center justify-center' : ''}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={isFirstStep || isLastStep ? 'w-full' : ''}
                  >
                    {step.content}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-800/30">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Tutorial
                </button>

                <div className="flex items-center gap-3">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
                  >
                    {isLastStep ? (
                      <>
                        Get Started
                        <Play className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingWizard;
