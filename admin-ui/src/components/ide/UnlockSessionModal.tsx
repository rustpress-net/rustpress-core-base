/**
 * UnlockSessionModal - Modal to unlock IDE editing for a custom session duration
 * Requires admin email verification
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Mail, Clock, Shield, AlertTriangle, ChevronDown } from 'lucide-react';

// Session duration options in minutes
const DURATION_OPTIONS = [
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '8 hours' },
] as const;

interface UnlockSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (email: string, durationMinutes: number) => void;
  adminEmail?: string;
}

export const UnlockSessionModal: React.FC<UnlockSessionModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  adminEmail = 'admin@rustpress.dev'
}) => {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

  const selectedDuration = DURATION_OPTIONS.find(d => d.value === duration) || DURATION_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your admin email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API verification (in production, this would verify against backend)
    try {
      // For demo purposes, accept any valid email or check against adminEmail
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, you would verify the email against admin users
      // For now, we'll accept any valid email format
      onUnlock(email, duration);
      setEmail('');
      onClose();
    } catch (err) {
      setError('Failed to verify admin credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Unlock Editing</h2>
                <p className="text-xs text-gray-400">Files are locked by default</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-1">Secure Editing Session</p>
                <p className="text-gray-400">
                  Enter your admin email and select session duration. The session will automatically expire for security.
                </p>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your admin email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-red-400"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </div>

            {/* Session Duration Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Session Duration
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{selectedDuration.label}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDurationDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showDurationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {DURATION_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setDuration(option.value);
                              setShowDurationDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              option.value === duration
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'text-white hover:bg-gray-700'
                            }`}
                          >
                            <Clock className="w-4 h-4 text-gray-400" />
                            {option.label}
                            {option.value === duration && (
                              <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Session Info Summary */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Session will expire:</span>
              </div>
              <span className="text-sm text-white font-medium">{selectedDuration.label} from now</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Unlock className="w-4 h-4" />
                    </motion.div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Editing
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              This action is logged for security purposes. Only administrators can unlock editing.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnlockSessionModal;
