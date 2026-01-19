/**
 * DiscussionSettings - Configure comments and discussion options
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Bell, Shield, Mail, Link2, Users,
  Clock, Flag, ThumbsUp, Save, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Filter, Eye, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DiscussionConfig {
  // Default article settings
  allowPingbacks: boolean;
  allowTrackbacks: boolean;
  allowComments: boolean;

  // Other comment settings
  requireNameEmail: boolean;
  requireRegistration: boolean;
  closeCommentsAfter: number; // 0 = never
  enableThreadedComments: boolean;
  threadingDepth: number;
  commentsPerPage: number;
  defaultCommentsPage: 'oldest' | 'newest';
  commentsOrder: 'asc' | 'desc';

  // Email notifications
  notifyOnComment: boolean;
  notifyOnModeration: boolean;
  moderationEmail: string;

  // Comment moderation
  moderationMode: 'none' | 'first-time' | 'always';
  holdForModeration: string[]; // words that trigger moderation
  blacklist: string[]; // words that block comment
  maxLinks: number; // max links before moderation

  // Avatars
  showAvatars: boolean;
  avatarRating: 'G' | 'PG' | 'R' | 'X';
  defaultAvatar: 'mystery' | 'blank' | 'gravatar' | 'identicon' | 'monsterid' | 'wavatar' | 'retro';

  // Comment reactions
  enableReactions: boolean;
  availableReactions: string[];

  // Anti-spam
  enableAkismet: boolean;
  enableRecaptcha: boolean;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  honeypotEnabled: boolean;
}

const defaultConfig: DiscussionConfig = {
  allowPingbacks: true,
  allowTrackbacks: true,
  allowComments: true,
  requireNameEmail: true,
  requireRegistration: false,
  closeCommentsAfter: 0,
  enableThreadedComments: true,
  threadingDepth: 5,
  commentsPerPage: 50,
  defaultCommentsPage: 'newest',
  commentsOrder: 'desc',
  notifyOnComment: true,
  notifyOnModeration: true,
  moderationEmail: 'admin@example.com',
  moderationMode: 'first-time',
  holdForModeration: ['viagra', 'casino', 'loan'],
  blacklist: ['spam', 'xxx'],
  maxLinks: 2,
  showAvatars: true,
  avatarRating: 'G',
  defaultAvatar: 'mystery',
  enableReactions: true,
  availableReactions: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
  enableAkismet: false,
  enableRecaptcha: false,
  recaptchaSiteKey: '',
  recaptchaSecretKey: '',
  honeypotEnabled: true
};

const avatarOptions = [
  { id: 'mystery', label: 'Mystery Person', icon: '👤' },
  { id: 'blank', label: 'Blank', icon: '⬜' },
  { id: 'gravatar', label: 'Gravatar Logo', icon: '🔵' },
  { id: 'identicon', label: 'Identicon', icon: '🔷' },
  { id: 'monsterid', label: 'MonsterID', icon: '👾' },
  { id: 'wavatar', label: 'Wavatar', icon: '🌊' },
  { id: 'retro', label: 'Retro', icon: '👾' }
];

const reactionOptions = [
  { id: 'like', emoji: '👍', label: 'Like' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'laugh', emoji: '😂', label: 'Haha' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'angry', emoji: '😠', label: 'Angry' }
];

export const DiscussionSettings: React.FC = () => {
  const [config, setConfig] = useState<DiscussionConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [newModerationWord, setNewModerationWord] = useState('');
  const [newBlacklistWord, setNewBlacklistWord] = useState('');

  const updateConfig = (key: keyof DiscussionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleReaction = (reactionId: string) => {
    const current = config.availableReactions;
    if (current.includes(reactionId)) {
      updateConfig('availableReactions', current.filter(r => r !== reactionId));
    } else {
      updateConfig('availableReactions', [...current, reactionId]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Discussion settings saved');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-orange-500" />
              Discussion Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure comments and discussion options</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          {/* Default Article Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-400" />
              Default Article Settings
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Allow link notifications from other blogs</div>
                  <div className="text-xs text-gray-500">Pingbacks and trackbacks on new posts</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowPingbacks}
                  onChange={(e) => updateConfig('allowPingbacks', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Allow comments on new posts</div>
                  <div className="text-xs text-gray-500">Can be overridden per post</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowComments}
                  onChange={(e) => updateConfig('allowComments', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Comment Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Comment Settings
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Require Name & Email</div>
                    <div className="text-xs text-gray-500">For comment submission</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.requireNameEmail}
                    onChange={(e) => updateConfig('requireNameEmail', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Require Registration</div>
                    <div className="text-xs text-gray-500">Users must be logged in</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.requireRegistration}
                    onChange={(e) => updateConfig('requireRegistration', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Close comments after (days)</label>
                  <input
                    type="number"
                    value={config.closeCommentsAfter}
                    onChange={(e) => updateConfig('closeCommentsAfter', parseInt(e.target.value))}
                    min={0}
                    placeholder="0 = never"
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = never close</p>
                </div>

                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Comments per page</label>
                  <input
                    type="number"
                    value={config.commentsPerPage}
                    onChange={(e) => updateConfig('commentsPerPage', parseInt(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Enable Threaded Comments</div>
                  <div className="text-xs text-gray-500">Allow nested replies</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableThreadedComments}
                  onChange={(e) => updateConfig('enableThreadedComments', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              {config.enableThreadedComments && (
                <div className="pl-4 p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Threading Depth</label>
                  <input
                    type="range"
                    value={config.threadingDepth}
                    onChange={(e) => updateConfig('threadingDepth', parseInt(e.target.value))}
                    min={2}
                    max={10}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{config.threadingDepth} levels deep</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comments Order</label>
                  <select
                    value={config.commentsOrder}
                    onChange={(e) => updateConfig('commentsOrder', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="asc">Oldest first</option>
                    <option value="desc">Newest first</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Page</label>
                  <select
                    value={config.defaultCommentsPage}
                    onChange={(e) => updateConfig('defaultCommentsPage', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="oldest">First page</option>
                    <option value="newest">Last page</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Email Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              Email Notifications
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Email me when someone posts a comment</div>
                  <div className="text-xs text-gray-500">Notification for all new comments</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyOnComment}
                  onChange={(e) => updateConfig('notifyOnComment', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Email me when a comment needs moderation</div>
                  <div className="text-xs text-gray-500">Notification for pending comments</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifyOnModeration}
                  onChange={(e) => updateConfig('notifyOnModeration', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Moderation Email</label>
                <input
                  type="email"
                  value={config.moderationEmail}
                  onChange={(e) => updateConfig('moderationEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </motion.div>

          {/* Comment Moderation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Comment Moderation
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Moderation Mode</label>
                <div className="space-y-2">
                  {[
                    { id: 'none', label: 'No moderation', desc: 'All comments appear immediately' },
                    { id: 'first-time', label: 'First-time commenters', desc: 'Hold for moderation until approved once' },
                    { id: 'always', label: 'All comments', desc: 'Every comment requires approval' }
                  ].map(mode => (
                    <label key={mode.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="moderation"
                        checked={config.moderationMode === mode.id}
                        onChange={() => updateConfig('moderationMode', mode.id)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-medium text-sm">{mode.label}</div>
                        <div className="text-xs text-gray-500">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Links Before Moderation
                </label>
                <input
                  type="number"
                  value={config.maxLinks}
                  onChange={(e) => updateConfig('maxLinks', parseInt(e.target.value))}
                  min={0}
                  max={10}
                  className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Comments with more links will be held for moderation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-400" />
                  Moderation Words
                </label>
                <p className="text-xs text-gray-500 mb-2">Comments containing these words will be held for moderation</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {config.holdForModeration.map(word => (
                    <span key={word} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm flex items-center gap-1">
                      {word}
                      <button onClick={() => updateConfig('holdForModeration', config.holdForModeration.filter(w => w !== word))} className="hover:text-white">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newModerationWord}
                    onChange={(e) => setNewModerationWord(e.target.value)}
                    placeholder="Add word..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newModerationWord) {
                        updateConfig('holdForModeration', [...config.holdForModeration, newModerationWord]);
                        setNewModerationWord('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newModerationWord) {
                        updateConfig('holdForModeration', [...config.holdForModeration, newModerationWord]);
                        setNewModerationWord('');
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <XCircle className="w-4 h-4 inline mr-1 text-red-400" />
                  Blacklist Words
                </label>
                <p className="text-xs text-gray-500 mb-2">Comments containing these words will be automatically rejected</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {config.blacklist.map(word => (
                    <span key={word} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm flex items-center gap-1">
                      {word}
                      <button onClick={() => updateConfig('blacklist', config.blacklist.filter(w => w !== word))} className="hover:text-white">
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBlacklistWord}
                    onChange={(e) => setNewBlacklistWord(e.target.value)}
                    placeholder="Add word..."
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newBlacklistWord) {
                        updateConfig('blacklist', [...config.blacklist, newBlacklistWord]);
                        setNewBlacklistWord('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newBlacklistWord) {
                        updateConfig('blacklist', [...config.blacklist, newBlacklistWord]);
                        setNewBlacklistWord('');
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Avatars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Avatars
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Show Avatars</div>
                  <div className="text-xs text-gray-500">Display user avatars in comments</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showAvatars}
                  onChange={(e) => updateConfig('showAvatars', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              {config.showAvatars && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Rating</label>
                    <div className="flex gap-2">
                      {(['G', 'PG', 'R', 'X'] as const).map(rating => (
                        <button
                          key={rating}
                          onClick={() => updateConfig('avatarRating', rating)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            config.avatarRating === rating
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Avatar</label>
                    <div className="grid grid-cols-4 gap-2">
                      {avatarOptions.map(avatar => (
                        <button
                          key={avatar.id}
                          onClick={() => updateConfig('defaultAvatar', avatar.id)}
                          className={`p-3 rounded-lg border transition-all ${
                            config.defaultAvatar === avatar.id
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-2xl mb-1">{avatar.icon}</div>
                          <div className="text-xs">{avatar.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Comment Reactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-pink-400" />
              Comment Reactions
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Enable Reactions</div>
                  <div className="text-xs text-gray-500">Allow users to react to comments</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableReactions}
                  onChange={(e) => updateConfig('enableReactions', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              {config.enableReactions && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Available Reactions</label>
                  <div className="flex gap-2">
                    {reactionOptions.map(reaction => (
                      <button
                        key={reaction.id}
                        onClick={() => toggleReaction(reaction.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          config.availableReactions.includes(reaction.id)
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-gray-700 hover:border-gray-600 opacity-50'
                        }`}
                        title={reaction.label}
                      >
                        <div className="text-2xl">{reaction.emoji}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Anti-Spam */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              Anti-Spam Protection
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Honeypot Field</div>
                  <div className="text-xs text-gray-500">Hidden field to catch bots (recommended)</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.honeypotEnabled}
                  onChange={(e) => updateConfig('honeypotEnabled', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Enable reCAPTCHA</div>
                  <div className="text-xs text-gray-500">Google reCAPTCHA verification</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.enableRecaptcha}
                  onChange={(e) => updateConfig('enableRecaptcha', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              {config.enableRecaptcha && (
                <div className="space-y-3 pl-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Site Key</label>
                    <input
                      type="text"
                      value={config.recaptchaSiteKey}
                      onChange={(e) => updateConfig('recaptchaSiteKey', e.target.value)}
                      placeholder="Enter reCAPTCHA site key"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Secret Key</label>
                    <input
                      type="password"
                      value={config.recaptchaSecretKey}
                      onChange={(e) => updateConfig('recaptchaSecretKey', e.target.value)}
                      placeholder="Enter reCAPTCHA secret key"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionSettings;
