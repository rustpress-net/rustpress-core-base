/**
 * Notes App - Simple note-taking application
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2, Search, Pin, PinOff,
  ArrowLeft, MoreVertical, Edit2, Clock, Folder,
  Tag, Archive, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  archived: boolean;
  color: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const noteColors = [
  'bg-gray-800',
  'bg-red-900/30',
  'bg-orange-900/30',
  'bg-yellow-900/30',
  'bg-green-900/30',
  'bg-blue-900/30',
  'bg-purple-900/30',
  'bg-pink-900/30',
];

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Project Ideas',
    content: 'Build a task management app with real-time collaboration features. Consider using WebSockets for live updates.',
    pinned: true,
    archived: false,
    color: 'bg-blue-900/30',
    tags: ['ideas', 'projects'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Meeting Notes',
    content: 'Discussed Q1 goals and roadmap. Key points:\n- Launch new feature by Feb\n- Hire 2 more developers\n- Improve test coverage to 80%',
    pinned: false,
    archived: false,
    color: 'bg-yellow-900/30',
    tags: ['meetings', 'work'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Shopping List',
    content: '- Milk\n- Bread\n- Eggs\n- Coffee\n- Vegetables',
    pinned: false,
    archived: false,
    color: 'bg-green-900/30',
    tags: ['personal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Learning Goals',
    content: 'Topics to learn this month:\n1. Rust programming\n2. WebAssembly\n3. Advanced TypeScript patterns',
    pinned: true,
    archived: false,
    color: 'bg-purple-900/30',
    tags: ['learning', 'goals'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const NotesApp: React.FC = () => {
  const navigate = useNavigate();
  const { closeLaunchedApp, siteModeSettings } = useAppStore();

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleBack = () => {
    closeLaunchedApp();
    if (siteModeSettings.mode === 'app') {
      navigate('/app-selector');
    } else {
      navigate('/dashboard');
    }
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      pinned: false,
      archived: false,
      color: noteColors[Math.floor(Math.random() * noteColors.length)],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setEditingNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
    ));
    if (editingNote?.id === id) {
      setEditingNote({ ...editingNote, ...updates });
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
    if (editingNote?.id === id) setEditingNote(null);
  };

  const togglePin = (id: string) => {
    updateNote(id, { pinned: !notes.find(n => n.id === id)?.pinned });
  };

  const toggleArchive = (id: string) => {
    updateNote(id, { archived: !notes.find(n => n.id === id)?.archived });
  };

  const filteredNotes = notes
    .filter(note => showArchived ? note.archived : !note.archived)
    .filter(note =>
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20">
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
                <h1 className="text-xl font-bold text-white">Notes</h1>
                <p className="text-sm text-gray-400">{filteredNotes.length} notes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showArchived
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                <Archive className="w-4 h-4" />
                {showArchived ? 'Showing Archived' : 'Show Archived'}
              </button>
              <button
                onClick={createNote}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Note
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex gap-6">
          {/* Notes Grid */}
          <div className="flex-1">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setEditingNote(note)}
                    className={`${note.color} border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-all group relative`}
                  >
                    {note.pinned && (
                      <div className="absolute top-2 right-2">
                        <Pin className="w-4 h-4 text-purple-400" />
                      </div>
                    )}

                    <h3 className="font-medium text-white mb-2 pr-6">{note.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-4 whitespace-pre-wrap">
                      {note.content || 'No content'}
                    </p>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          {note.pinned ? (
                            <PinOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Pin className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleArchive(note.id); }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Archive className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {filteredNotes.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notes found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery ? 'Try a different search term' : 'Create your first note'}
                </p>
                <button
                  onClick={createNote}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Create Note
                </button>
              </div>
            )}
          </div>

          {/* Editor Panel */}
          <AnimatePresence>
            {editingNote && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="w-96 bg-gray-800/50 border border-gray-700 rounded-xl p-6 sticky top-24 h-fit"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Edit Note</h3>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => updateNote(editingNote.id, { title: e.target.value })}
                  placeholder="Note title"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4 focus:outline-none focus:border-purple-500"
                />

                <textarea
                  value={editingNote.content}
                  onChange={(e) => updateNote(editingNote.id, { content: e.target.value })}
                  placeholder="Write your note..."
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-500"
                />

                <div className="mt-4">
                  <label className="text-sm text-gray-400 block mb-2">Color</label>
                  <div className="flex gap-2">
                    {noteColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateNote(editingNote.id, { color })}
                        className={`w-6 h-6 rounded-full ${color} border-2 ${
                          editingNote.color === color ? 'border-white' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;
