/**
 * WritingSettings - Configure writing and publishing preferences
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3, FileText, Tags, Calendar, Clock, Type,
  Code, Image, Link2, Quote, List, Save, RefreshCw,
  Sparkles, Wand2, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WritingConfig {
  // Default settings
  defaultCategory: string;
  defaultFormat: 'standard' | 'aside' | 'gallery' | 'image' | 'video' | 'quote' | 'link' | 'status';
  defaultStatus: 'draft' | 'pending' | 'publish';
  defaultVisibility: 'public' | 'private' | 'password';

  // Editor settings
  defaultEditor: 'visual' | 'markdown' | 'code';
  enableAutosave: boolean;
  autosaveInterval: number;
  enableRevisions: boolean;
  maxRevisions: number;

  // Formatting
  convertSmilies: boolean;
  convertUrls: boolean;
  useTexFilters: boolean;
  formatOnPaste: boolean;

  // Remote publishing
  enableXmlRpc: boolean;
  enableAtomPub: boolean;
  pingServices: string[];

  // Press This
  enablePressThis: boolean;
  defaultMediaSettings: {
    alignment: 'left' | 'center' | 'right' | 'none';
    linkTo: 'none' | 'file' | 'attachment' | 'custom';
    size: 'thumbnail' | 'medium' | 'large' | 'full';
  };
}

const defaultConfig: WritingConfig = {
  defaultCategory: 'uncategorized',
  defaultFormat: 'standard',
  defaultStatus: 'draft',
  defaultVisibility: 'public',
  defaultEditor: 'visual',
  enableAutosave: true,
  autosaveInterval: 60,
  enableRevisions: true,
  maxRevisions: 10,
  convertSmilies: true,
  convertUrls: true,
  useTexFilters: false,
  formatOnPaste: true,
  enableXmlRpc: false,
  enableAtomPub: false,
  pingServices: [
    'http://rpc.pingomatic.com/',
    'http://api.my.yahoo.com/RPC2'
  ],
  enablePressThis: true,
  defaultMediaSettings: {
    alignment: 'none',
    linkTo: 'file',
    size: 'large'
  }
};

const postFormats = [
  { id: 'standard', label: 'Standard', icon: FileText, description: 'A standard post format' },
  { id: 'aside', label: 'Aside', icon: Quote, description: 'A brief snippet' },
  { id: 'gallery', label: 'Gallery', icon: Image, description: 'A gallery of images' },
  { id: 'image', label: 'Image', icon: Image, description: 'A single image' },
  { id: 'video', label: 'Video', icon: FileText, description: 'A video or playlist' },
  { id: 'quote', label: 'Quote', icon: Quote, description: 'A quotation' },
  { id: 'link', label: 'Link', icon: Link2, description: 'A link to another site' },
  { id: 'status', label: 'Status', icon: FileText, description: 'A short status update' }
];

const editorTypes = [
  { id: 'visual', label: 'Visual Editor', icon: Edit3, description: 'WYSIWYG editor with formatting toolbar' },
  { id: 'markdown', label: 'Markdown', icon: Type, description: 'Write in Markdown syntax' },
  { id: 'code', label: 'Code Editor', icon: Code, description: 'Raw HTML/code editing' }
];

export const WritingSettings: React.FC = () => {
  const [config, setConfig] = useState<WritingConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [newPingService, setNewPingService] = useState('');

  const updateConfig = (key: keyof WritingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Writing settings saved');
  };

  const addPingService = () => {
    if (newPingService && !config.pingServices.includes(newPingService)) {
      updateConfig('pingServices', [...config.pingServices, newPingService]);
      setNewPingService('');
    }
  };

  const removePingService = (url: string) => {
    updateConfig('pingServices', config.pingServices.filter(s => s !== url));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Edit3 className="w-7 h-7 text-orange-500" />
              Writing Settings
            </h1>
            <p className="text-gray-400 mt-1">Configure default writing and publishing options</p>
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
          {/* Default Post Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Default Post Settings
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Category</label>
                  <input
                    type="text"
                    value={config.defaultCategory}
                    onChange={(e) => updateConfig('defaultCategory', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Default Status</label>
                  <select
                    value={config.defaultStatus}
                    onChange={(e) => updateConfig('defaultStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="publish">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Post Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {postFormats.map(format => {
                    const Icon = format.icon;
                    const isSelected = config.defaultFormat === format.id;
                    return (
                      <button
                        key={format.id}
                        onClick={() => updateConfig('defaultFormat', format.id)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 text-white'
                            : 'border-gray-700 hover:border-gray-600 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <div className="text-xs font-medium">{format.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Visibility</label>
                <div className="flex gap-4">
                  {['public', 'private', 'password'].map(visibility => (
                    <label key={visibility} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={config.defaultVisibility === visibility}
                        onChange={() => updateConfig('defaultVisibility', visibility)}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm capitalize">{visibility === 'password' ? 'Password Protected' : visibility}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Editor Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-400" />
              Editor Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Editor</label>
                <div className="grid grid-cols-3 gap-3">
                  {editorTypes.map(editor => {
                    const Icon = editor.icon;
                    const isSelected = config.defaultEditor === editor.id;
                    return (
                      <button
                        key={editor.id}
                        onClick={() => updateConfig('defaultEditor', editor.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-green-400' : 'text-gray-400'}`} />
                        <div className="font-medium text-sm">{editor.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{editor.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Enable Autosave</div>
                    <div className="text-xs text-gray-500">Automatically save drafts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableAutosave}
                    onChange={(e) => updateConfig('enableAutosave', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Autosave Interval (seconds)</label>
                  <input
                    type="number"
                    value={config.autosaveInterval}
                    onChange={(e) => updateConfig('autosaveInterval', parseInt(e.target.value))}
                    min={10}
                    max={300}
                    disabled={!config.enableAutosave}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Enable Revisions</div>
                    <div className="text-xs text-gray-500">Keep post revision history</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableRevisions}
                    onChange={(e) => updateConfig('enableRevisions', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <div className="p-3 bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Max Revisions</label>
                  <input
                    type="number"
                    value={config.maxRevisions}
                    onChange={(e) => updateConfig('maxRevisions', parseInt(e.target.value))}
                    min={1}
                    max={100}
                    disabled={!config.enableRevisions}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formatting Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Formatting Options
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Convert Emoticons</div>
                  <div className="text-xs text-gray-500">:) becomes a smiley icon</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.convertSmilies}
                  onChange={(e) => updateConfig('convertSmilies', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Auto-link URLs</div>
                  <div className="text-xs text-gray-500">Convert URLs to clickable links</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.convertUrls}
                  onChange={(e) => updateConfig('convertUrls', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">LaTeX Support</div>
                  <div className="text-xs text-gray-500">Enable TeX math formatting</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.useTexFilters}
                  onChange={(e) => updateConfig('useTexFilters', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-sm">Format on Paste</div>
                  <div className="text-xs text-gray-500">Clean up pasted content</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.formatOnPaste}
                  onChange={(e) => updateConfig('formatOnPaste', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Remote Publishing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-cyan-400" />
              Remote Publishing
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">XML-RPC</div>
                    <div className="text-xs text-gray-500">Enable XML-RPC publishing</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableXmlRpc}
                    onChange={(e) => updateConfig('enableXmlRpc', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">AtomPub</div>
                    <div className="text-xs text-gray-500">Enable Atom Publishing Protocol</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableAtomPub}
                    onChange={(e) => updateConfig('enableAtomPub', e.target.checked)}
                    className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Update Services</label>
                <p className="text-xs text-gray-500 mb-2">Notify these services when you publish new content:</p>
                <div className="space-y-2 mb-3">
                  {config.pingServices.map(service => (
                    <div key={service} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                      <span className="flex-1 text-sm text-gray-300 truncate">{service}</span>
                      <button
                        onClick={() => removePingService(service)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPingService}
                    onChange={(e) => setNewPingService(e.target.value)}
                    placeholder="https://ping.example.com/"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={addPingService}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Default Media Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-pink-400" />
              Default Media Embedding
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image Alignment</label>
                <select
                  value={config.defaultMediaSettings.alignment}
                  onChange={(e) => updateConfig('defaultMediaSettings', {
                    ...config.defaultMediaSettings,
                    alignment: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="none">None</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Link To</label>
                <select
                  value={config.defaultMediaSettings.linkTo}
                  onChange={(e) => updateConfig('defaultMediaSettings', {
                    ...config.defaultMediaSettings,
                    linkTo: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="none">None</option>
                  <option value="file">Media File</option>
                  <option value="attachment">Attachment Page</option>
                  <option value="custom">Custom URL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Default Size</label>
                <select
                  value={config.defaultMediaSettings.size}
                  onChange={(e) => updateConfig('defaultMediaSettings', {
                    ...config.defaultMediaSettings,
                    size: e.target.value
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="thumbnail">Thumbnail</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="full">Full Size</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WritingSettings;
