/**
 * Calendar App - Simple calendar/schedule application
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus,
  Clock, MapPin, Users, ArrowLeft, X, Edit2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  location?: string;
  attendees?: string[];
}

const eventColors = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team sync meeting',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    color: 'bg-blue-500',
    location: 'Meeting Room A',
    attendees: ['John', 'Jane', 'Bob'],
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Q1 project milestone review',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    color: 'bg-purple-500',
    location: 'Conference Room',
  },
  {
    id: '3',
    title: 'Client Call',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    color: 'bg-green-500',
  },
  {
    id: '4',
    title: 'Lunch with Team',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    startTime: '12:30',
    endTime: '13:30',
    color: 'bg-orange-500',
    location: 'Cafe Downtown',
  },
];

const CalendarApp: React.FC = () => {
  const navigate = useNavigate();
  const { closeLaunchedApp, siteModeSettings } = useAppStore();

  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    color: 'bg-blue-500',
  });

  const handleBack = () => {
    closeLaunchedApp();
    if (siteModeSettings.mode === 'app') {
      navigate('/app-selector');
    } else {
      navigate('/dashboard');
    }
  };

  // Calendar helpers
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !selectedDate) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      startTime: newEvent.startTime || '09:00',
      endTime: newEvent.endTime || '10:00',
      color: newEvent.color || 'bg-blue-500',
      location: newEvent.location,
    };

    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: '',
      startTime: '09:00',
      endTime: '10:00',
      color: 'bg-blue-500',
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setEditingEvent(null);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/20">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Calendar</h1>
                <p className="text-sm text-gray-400">Manage your schedule</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-sm font-medium text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before first of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-28 border-b border-r border-gray-700/50" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = getDateString(day);
                  const dayEvents = getEventsForDate(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-28 border-b border-r border-gray-700/50 p-2 cursor-pointer transition-colors ${
                        isSelected ? 'bg-green-500/10' : 'hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                            isToday(day)
                              ? 'bg-green-500 text-white font-bold'
                              : 'text-gray-300'
                          }`}
                        >
                          {day}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`${event.color} px-2 py-0.5 rounded text-xs text-white truncate`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Date Events */}
          <div className="w-80">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Select a date'}
                </h3>
                {selectedDate && (
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="p-1.5 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full min-h-[40px] ${event.color} rounded-full`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{event.title}</h4>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {event.startTime} - {event.endTime}
                          </p>
                          {event.location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    {selectedDate ? 'No events for this day' : 'Select a date to view events'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">New Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.startTime || '09:00'}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEvent.endTime || '10:00'}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Color</label>
                  <div className="flex gap-2">
                    {eventColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                        className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                          newEvent.color === color.value ? 'border-white' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarApp;
