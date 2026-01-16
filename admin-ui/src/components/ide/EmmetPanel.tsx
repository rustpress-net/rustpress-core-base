/**
 * EmmetPanel - Emmet abbreviation expansion and snippets
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ChevronRight, Search, Star, Clock,
  FileCode, Copy, Check, Settings, Eye
} from 'lucide-react';

export interface EmmetSnippet {
  id: string;
  abbreviation: string;
  expansion: string;
  description?: string;
  language: string;
  isFavorite?: boolean;
  lastUsed?: string;
}

export interface EmmetSettings {
  enabled: boolean;
  triggerExpansionOnTab: boolean;
  showPreview: boolean;
  showSuggestions: boolean;
  syntaxProfiles: Record<string, string>;
  variables: Record<string, string>;
}

interface EmmetPanelProps {
  snippets: EmmetSnippet[];
  recentSnippets: string[];
  settings: EmmetSettings;
  currentLanguage?: string;
  onExpand: (abbreviation: string) => string;
  onInsert: (expansion: string) => void;
  onToggleFavorite: (snippetId: string) => void;
  onSettingsChange: (settings: EmmetSettings) => void;
}

const defaultSnippets: Omit<EmmetSnippet, 'id'>[] = [
  { abbreviation: '!', expansion: '<!DOCTYPE html>...', description: 'HTML5 boilerplate', language: 'html' },
  { abbreviation: 'div.container', expansion: '<div class="container"></div>', description: 'Div with class', language: 'html' },
  { abbreviation: 'ul>li*5', expansion: '<ul><li></li>×5</ul>', description: 'List with 5 items', language: 'html' },
  { abbreviation: 'a[href="#"]', expansion: '<a href="#"></a>', description: 'Anchor with href', language: 'html' },
  { abbreviation: 'input:text', expansion: '<input type="text">', description: 'Text input', language: 'html' },
  { abbreviation: 'btn.primary', expansion: '<button class="primary"></button>', description: 'Primary button', language: 'html' },
  { abbreviation: 'form>input+button', expansion: '<form>...</form>', description: 'Form with input', language: 'html' },
  { abbreviation: 'table>(tr>td*3)*3', expansion: '<table>3×3 grid</table>', description: '3x3 table', language: 'html' },
];

const cheatSheet = [
  { category: 'Child', operator: '>', example: 'div>p', result: '<div><p></p></div>' },
  { category: 'Sibling', operator: '+', example: 'div+p', result: '<div></div><p></p>' },
  { category: 'Climb Up', operator: '^', example: 'div>p^span', result: '<div><p></p></div><span></span>' },
  { category: 'Multiply', operator: '*', example: 'ul>li*3', result: '<ul><li></li>×3</ul>' },
  { category: 'Grouping', operator: '()', example: 'div>(header+main)', result: 'Group elements' },
  { category: 'ID', operator: '#', example: 'div#main', result: '<div id="main"></div>' },
  { category: 'Class', operator: '.', example: 'div.container', result: '<div class="container"></div>' },
  { category: 'Attribute', operator: '[]', example: 'a[href="#"]', result: '<a href="#"></a>' },
  { category: 'Text', operator: '{}', example: 'p{Hello}', result: '<p>Hello</p>' },
  { category: 'Numbering', operator: '$', example: 'li.item$*3', result: 'item1, item2, item3' },
];

export const EmmetPanel: React.FC<EmmetPanelProps> = ({
  snippets,
  recentSnippets,
  settings,
  currentLanguage,
  onExpand,
  onInsert,
  onToggleFavorite,
  onSettingsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customAbbr, setCustomAbbr] = useState('');
  const [previewExpansion, setPreviewExpansion] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'snippets' | 'cheatsheet' | 'settings'>('snippets');

  const allSnippets = [
    ...snippets,
    ...defaultSnippets.map((s, i) => ({ ...s, id: `default-${i}` })),
  ];

  const filteredSnippets = allSnippets.filter((snippet) => {
    const matchesSearch =
      searchQuery === '' ||
      snippet.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage =
      !currentLanguage || snippet.language === currentLanguage || snippet.language === 'all';
    return matchesSearch && matchesLanguage;
  });

  const favoriteSnippets = filteredSnippets.filter((s) => s.isFavorite);
  const recentFilteredSnippets = filteredSnippets.filter((s) => recentSnippets.includes(s.id));

  const handlePreview = () => {
    if (customAbbr.trim()) {
      const expansion = onExpand(customAbbr.trim());
      setPreviewExpansion(expansion);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const updateSetting = <K extends keyof EmmetSettings>(
    key: K,
    value: EmmetSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Emmet
        </h3>
        <button
          onClick={() => updateSetting('enabled', !settings.enabled)}
          className={`p-1 rounded transition-colors ${
            settings.enabled
              ? 'text-yellow-400 bg-yellow-500/20'
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title={settings.enabled ? 'Disable Emmet' : 'Enable Emmet'}
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['snippets', 'cheatsheet', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'snippets' && (
          <div className="p-3 space-y-3">
            {/* Custom Expansion */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Try Abbreviation</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAbbr}
                  onChange={(e) => setCustomAbbr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
                  placeholder="div.container>p*3"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
                <button
                  onClick={handlePreview}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm text-white"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              {previewExpansion && (
                <div className="p-2 bg-gray-800 rounded font-mono text-xs text-gray-300 overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{previewExpansion}</pre>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets..."
                className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Favorites */}
            {favoriteSnippets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>Favorites</span>
                </div>
                {favoriteSnippets.map((snippet) => (
                  <SnippetRow
                    key={snippet.id}
                    snippet={snippet}
                    copied={copied}
                    onInsert={() => onInsert(snippet.expansion)}
                    onCopy={(text) => handleCopy(text, snippet.id)}
                    onToggleFavorite={() => onToggleFavorite(snippet.id)}
                  />
                ))}
              </div>
            )}

            {/* Recent */}
            {recentFilteredSnippets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Recent</span>
                </div>
                {recentFilteredSnippets.slice(0, 5).map((snippet) => (
                  <SnippetRow
                    key={snippet.id}
                    snippet={snippet}
                    copied={copied}
                    onInsert={() => onInsert(snippet.expansion)}
                    onCopy={(text) => handleCopy(text, snippet.id)}
                    onToggleFavorite={() => onToggleFavorite(snippet.id)}
                  />
                ))}
              </div>
            )}

            {/* All Snippets */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FileCode className="w-3 h-3" />
                <span>All Snippets ({filteredSnippets.length})</span>
              </div>
              {filteredSnippets.map((snippet) => (
                <SnippetRow
                  key={snippet.id}
                  snippet={snippet}
                  copied={copied}
                  onInsert={() => onInsert(snippet.expansion)}
                  onCopy={(text) => handleCopy(text, snippet.id)}
                  onToggleFavorite={() => onToggleFavorite(snippet.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cheatsheet' && (
          <div className="p-3">
            <div className="space-y-1">
              {cheatSheet.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-gray-800/50 rounded hover:bg-gray-800"
                >
                  <span className="w-16 text-xs text-gray-500">{item.category}</span>
                  <code className="w-8 text-center text-yellow-400 font-bold">{item.operator}</code>
                  <code className="flex-1 text-xs text-gray-300 font-mono">{item.example}</code>
                  <ChevronRight className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-500 truncate max-w-[100px]">{item.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-3 space-y-3">
            <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
              <span className="text-sm text-gray-300">Expand on Tab</span>
              <input
                type="checkbox"
                checked={settings.triggerExpansionOnTab}
                onChange={(e) => updateSetting('triggerExpansionOnTab', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
              <span className="text-sm text-gray-300">Show Preview</span>
              <input
                type="checkbox"
                checked={settings.showPreview}
                onChange={(e) => updateSetting('showPreview', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
              <span className="text-sm text-gray-300">Show Suggestions</span>
              <input
                type="checkbox"
                checked={settings.showSuggestions}
                onChange={(e) => updateSetting('showSuggestions', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500"
              />
            </label>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">Tab</kbd> to expand
      </div>
    </div>
  );
};

// Snippet Row Component
const SnippetRow: React.FC<{
  snippet: EmmetSnippet;
  copied: string | null;
  onInsert: () => void;
  onCopy: (text: string) => void;
  onToggleFavorite: () => void;
}> = ({ snippet, copied, onInsert, onCopy, onToggleFavorite }) => (
  <div className="group flex items-center gap-2 p-2 bg-gray-800/50 rounded hover:bg-gray-800">
    <button
      onClick={onToggleFavorite}
      className={`p-1 rounded ${
        snippet.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
      }`}
    >
      <Star className={`w-3 h-3 ${snippet.isFavorite ? 'fill-current' : ''}`} />
    </button>
    <code className="text-sm text-yellow-400 font-mono">{snippet.abbreviation}</code>
    <span className="flex-1 text-xs text-gray-500 truncate">{snippet.description}</span>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onCopy(snippet.expansion)}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
      >
        {copied === snippet.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
      <button
        onClick={onInsert}
        className="px-2 py-0.5 bg-yellow-600 hover:bg-yellow-700 rounded text-xs text-white"
      >
        Insert
      </button>
    </div>
  </div>
);

export default EmmetPanel;
