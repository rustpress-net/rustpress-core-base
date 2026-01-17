/**
 * ReminderPicker - Set reminder for a message
 */

import React, { useState } from 'react';
import { Clock, Calendar, X } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';

interface ReminderPickerProps {
  messageId: string;
  onClose: () => void;
}

// Quick reminder presets
const PRESETS = [
  { label: 'In 20 minutes', minutes: 20 },
  { label: 'In 1 hour', minutes: 60 },
  { label: 'In 3 hours', minutes: 180 },
  { label: 'Tomorrow morning', getTime: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  }},
  { label: 'Tomorrow afternoon', getTime: () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return tomorrow;
  }},
  { label: 'Next Monday', getTime: () => {
    const date = new Date();
    const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
    date.setDate(date.getDate() + daysUntilMonday);
    date.setHours(9, 0, 0, 0);
    return date;
  }},
];

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  messageId,
  onClose,
}) => {
  const { setReminder } = useChatStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePresetClick = async (preset: typeof PRESETS[0]) => {
    setIsSubmitting(true);
    try {
      let remindAt: Date;
      if ('minutes' in preset) {
        remindAt = new Date(Date.now() + preset.minutes * 60 * 1000);
      } else {
        remindAt = preset.getTime();
      }
      await setReminder(messageId, remindAt.toISOString());
      onClose();
    } catch (error) {
      console.error('Failed to set reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customDate || !customTime) return;

    setIsSubmitting(true);
    try {
      const remindAt = new Date(`${customDate}T${customTime}`);
      await setReminder(messageId, remindAt.toISOString());
      onClose();
    } catch (error) {
      console.error('Failed to set reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Clock className="w-4 h-4" />
          Set Reminder
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Presets */}
      {!showCustom && (
        <div className="p-2">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(preset)}
              disabled={isSubmitting}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-gray-800 rounded transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Custom date & time
          </button>
        </div>
      )}

      {/* Custom date/time */}
      {showCustom && (
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time</label>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCustomSubmit}
              disabled={!customDate || !customTime || isSubmitting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium text-white transition-colors"
            >
              Set Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderPicker;
