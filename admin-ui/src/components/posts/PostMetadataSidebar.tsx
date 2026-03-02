/**
 * PostMetadataSidebar — Right-sidebar panel for post settings
 * Collapsible sections wired to usePostStore
 */

import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Lock,
  Eye,
  Calendar,
  Link,
  RefreshCw,
  Folder,
  Tag,
  Image,
  FileText,
  Search,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { usePostStore } from '../../store/postStore';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const PostMetadataSidebar: React.FC = () => {
  const store = usePostStore();
  const { currentPost, availableCategories, availableTags, updateField, updateSEOField, generateSlug } = store;
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!currentPost.tags.includes(tag)) {
        updateField('tags', [...currentPost.tags, tag]);
      }
      setTagInput('');
    }
  }, [tagInput, currentPost.tags, updateField]);

  const removeTag = useCallback((tag: string) => {
    updateField('tags', currentPost.tags.filter((t) => t !== tag));
  }, [currentPost.tags, updateField]);

  return (
    <div className="h-full overflow-y-auto">
      {/* Status & Visibility */}
      <Section title="Status & Visibility" icon={<Globe size={16} />} defaultOpen>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={currentPost.status}
              onChange={(e) => updateField('status', e.target.value as 'draft' | 'published' | 'scheduled' | 'pending')}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="pending">Pending Review</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Visibility</label>
            <div className="space-y-1.5">
              {[
                { value: 'public', label: 'Public', icon: <Globe size={14} />, desc: 'Visible to everyone' },
                { value: 'private', label: 'Private', icon: <Lock size={14} />, desc: 'Only visible to admins' },
                { value: 'password', label: 'Password Protected', icon: <Eye size={14} />, desc: 'Requires a password' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={clsx(
                    'flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-colors',
                    currentPost.visibility === opt.value
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                      : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={currentPost.visibility === opt.value}
                    onChange={(e) => updateField('visibility', e.target.value as 'public' | 'private' | 'password')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {opt.icon} {opt.label}
                    </div>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {currentPost.visibility === 'password' && (
              <input
                type="text"
                placeholder="Enter password..."
                value={currentPost.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            )}
          </div>
        </div>
      </Section>

      {/* Publish Schedule */}
      <Section title="Publish Schedule" icon={<Calendar size={16} />}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              name="schedule"
              checked={!currentPost.scheduled_at}
              onChange={() => updateField('scheduled_at', '')}
            />
            Publish immediately
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="radio"
              name="schedule"
              checked={!!currentPost.scheduled_at}
              onChange={() => updateField('scheduled_at', new Date(Date.now() + 86400000).toISOString().slice(0, 16))}
            />
            Schedule for later
          </label>
          {currentPost.scheduled_at && (
            <input
              type="datetime-local"
              value={currentPost.scheduled_at.slice(0, 16)}
              onChange={(e) => updateField('scheduled_at', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          )}
        </div>
      </Section>

      {/* Permalink / Slug */}
      <Section title="Permalink / Slug" icon={<Link size={16} />}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={currentPost.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="post-url-slug"
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={() => updateField('slug', generateSlug(currentPost.title))}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Generate from title"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {currentPost.slug && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              /blog/{currentPost.slug}
            </p>
          )}
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories" icon={<Folder size={16} />}>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 py-0.5">
              <input
                type="checkbox"
                checked={currentPost.categories.includes(cat)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateField('categories', [...currentPost.categories, cat]);
                  } else {
                    updateField('categories', currentPost.categories.filter((c) => c !== cat));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {cat}
            </label>
          ))}
        </div>
      </Section>

      {/* Tags */}
      <Section title="Tags" icon={<Tag size={16} />}>
        <div className="space-y-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag and press Enter..."
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {currentPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {availableTags.length > 0 && (
            <div className="pt-1">
              <p className="text-xs text-gray-400 mb-1">Suggested:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter((t) => !currentPost.tags.includes(t))
                  .slice(0, 6)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => updateField('tags', [...currentPost.tags, tag])}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Featured Image */}
      <Section title="Featured Image" icon={<Image size={16} />}>
        <div className="space-y-2">
          <input
            type="text"
            value={currentPost.featured_image}
            onChange={(e) => updateField('featured_image', e.target.value)}
            placeholder="Image URL..."
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {currentPost.featured_image && (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={currentPost.featured_image}
                alt={currentPost.featured_image_alt || 'Featured'}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <input
            type="text"
            value={currentPost.featured_image_alt}
            onChange={(e) => updateField('featured_image_alt', e.target.value)}
            placeholder="Alt text..."
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </Section>

      {/* Excerpt */}
      <Section title="Excerpt" icon={<FileText size={16} />}>
        <div className="space-y-1">
          <textarea
            value={currentPost.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            placeholder="Write a short summary..."
            rows={3}
            maxLength={300}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{currentPost.excerpt.length}/300</p>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO Settings" icon={<Search size={16} />}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Meta Title <span className="text-gray-400">({currentPost.seo.meta_title.length}/60)</span>
            </label>
            <input
              type="text"
              value={currentPost.seo.meta_title}
              onChange={(e) => updateSEOField('meta_title', e.target.value)}
              placeholder={currentPost.title || 'SEO Title...'}
              maxLength={60}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  currentPost.seo.meta_title.length <= 50 ? 'bg-green-500' :
                  currentPost.seo.meta_title.length <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(100, (currentPost.seo.meta_title.length / 60) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Meta Description <span className="text-gray-400">({currentPost.seo.meta_description.length}/160)</span>
            </label>
            <textarea
              value={currentPost.seo.meta_description}
              onChange={(e) => updateSEOField('meta_description', e.target.value)}
              placeholder="Meta description for search engines..."
              rows={2}
              maxLength={160}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Focus Keyword</label>
            <input
              type="text"
              value={currentPost.seo.focus_keyword}
              onChange={(e) => updateSEOField('focus_keyword', e.target.value)}
              placeholder="Primary keyword..."
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PostMetadataSidebar;
