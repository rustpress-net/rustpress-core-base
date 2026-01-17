/**
 * EmailTemplateEditor - Email template management
 * RustPress-specific email template functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Plus, Save, Eye, Code, Send, Copy, Trash2,
  Edit2, FileText, Variable, Image, Link, Type,
  ChevronDown, Check, AlertTriangle, RefreshCw
} from 'lucide-react';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'transactional' | 'marketing' | 'notification';
  variables: string[];
  lastModified: string;
  active: boolean;
}

interface EmailTemplateEditorProps {
  onSave?: (template: EmailTemplate) => void;
  onSend?: (template: EmailTemplate, to: string) => void;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{site_name}}, {{user_name}}!',
    body: `<h1>Welcome, {{user_name}}!</h1>
<p>Thank you for joining {{site_name}}. We're excited to have you on board.</p>
<p>Here's what you can do next:</p>
<ul>
  <li>Complete your profile</li>
  <li>Explore our features</li>
  <li>Connect with others</li>
</ul>
<p>If you have any questions, feel free to reply to this email.</p>
<p>Best regards,<br>The {{site_name}} Team</p>`,
    type: 'transactional',
    variables: ['site_name', 'user_name', 'user_email'],
    lastModified: '2024-01-15',
    active: true
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password - {{site_name}}',
    body: `<h2>Password Reset Request</h2>
<p>Hi {{user_name}},</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<a href="{{reset_link}}" style="display:inline-block;padding:12px 24px;background:#8B5CF6;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
<p>This link will expire in {{expiry_time}}.</p>
<p>If you didn't request this, you can safely ignore this email.</p>`,
    type: 'transactional',
    variables: ['site_name', 'user_name', 'reset_link', 'expiry_time'],
    lastModified: '2024-01-14',
    active: true
  },
  {
    id: '3',
    name: 'New Comment Notification',
    subject: 'New comment on "{{post_title}}"',
    body: `<p>Hi {{user_name}},</p>
<p>{{commenter_name}} left a comment on your post "{{post_title}}":</p>
<blockquote style="border-left:3px solid #8B5CF6;padding-left:16px;margin:16px 0;">
{{comment_content}}
</blockquote>
<a href="{{post_url}}">View Comment</a>`,
    type: 'notification',
    variables: ['user_name', 'commenter_name', 'post_title', 'post_url', 'comment_content'],
    lastModified: '2024-01-12',
    active: true
  },
  {
    id: '4',
    name: 'Newsletter',
    subject: '{{newsletter_title}} - {{site_name}}',
    body: `<h1>{{newsletter_title}}</h1>
{{newsletter_content}}
<hr>
<p style="font-size:12px;color:#666;">
You received this because you subscribed to {{site_name}}.
<a href="{{unsubscribe_link}}">Unsubscribe</a>
</p>`,
    type: 'marketing',
    variables: ['site_name', 'newsletter_title', 'newsletter_content', 'unsubscribe_link'],
    lastModified: '2024-01-10',
    active: false
  },
];

const availableVariables = [
  { name: 'site_name', description: 'Your website name' },
  { name: 'site_url', description: 'Your website URL' },
  { name: 'user_name', description: 'Recipient\'s name' },
  { name: 'user_email', description: 'Recipient\'s email' },
  { name: 'current_date', description: 'Current date' },
  { name: 'current_year', description: 'Current year' },
];

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  onSave,
  onSend
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(mockTemplates[0]);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateTemplate = (updates: Partial<EmailTemplate>) => {
    if (!selectedTemplate) return;
    const updated = { ...selectedTemplate, ...updates, lastModified: new Date().toISOString().split('T')[0] };
    setSelectedTemplate(updated);
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (selectedTemplate) {
      onSave?.(selectedTemplate);
      setHasChanges(false);
    }
  };

  const handleSendTest = () => {
    if (selectedTemplate && testEmail) {
      onSend?.(selectedTemplate, testEmail);
      setShowTestModal(false);
      setTestEmail('');
    }
  };

  const insertVariable = (varName: string) => {
    if (!selectedTemplate) return;
    const textarea = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = selectedTemplate.body;
      const newText = text.substring(0, start) + `{{${varName}}}` + text.substring(end);
      handleUpdateTemplate({ body: newText });
    }
  };

  const createNewTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      subject: '',
      body: '<p>Your email content here...</p>',
      type: 'transactional',
      variables: [],
      lastModified: new Date().toISOString().split('T')[0],
      active: false
    };
    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    setHasChanges(true);
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const duplicate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      active: false,
      lastModified: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, duplicate]);
    setSelectedTemplate(duplicate);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(templates[0] || null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transactional': return 'text-blue-400 bg-blue-500/10';
      case 'marketing': return 'text-green-400 bg-green-500/10';
      case 'notification': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const renderPreview = () => {
    if (!selectedTemplate) return '';
    let html = selectedTemplate.body;
    // Replace variables with sample data
    html = html.replace(/\{\{site_name\}\}/g, 'RustPress');
    html = html.replace(/\{\{user_name\}\}/g, 'John Doe');
    html = html.replace(/\{\{user_email\}\}/g, 'john@example.com');
    html = html.replace(/\{\{[\w_]+\}\}/g, '[sample data]');
    return html;
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar - Template List */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={createNewTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`w-full p-3 text-left hover:bg-gray-800/50 border-b border-gray-800 ${
                selectedTemplate?.id === template.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium truncate">{template.name}</span>
                {!template.active && (
                  <span className="text-xs text-gray-500">Draft</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(template.type)}`}>
                  {template.type}
                </span>
                <span className="text-xs text-gray-500">{template.lastModified}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor */}
      {selectedTemplate ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    viewMode === 'edit' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4 inline-block mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded text-sm ${
                    viewMode === 'preview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-4 h-4 inline-block mr-1" />
                  Preview
                </button>
              </div>

              {hasChanges && (
                <span className="text-sm text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg"
              >
                <Send className="w-4 h-4" />
                Send Test
              </button>
              <button
                onClick={() => duplicateTemplate(selectedTemplate)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => deleteTemplate(selectedTemplate.id)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {viewMode === 'edit' ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="max-w-3xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={selectedTemplate.name}
                      onChange={(e) => handleUpdateTemplate({ name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                    <select
                      value={selectedTemplate.type}
                      onChange={(e) => handleUpdateTemplate({ type: e.target.value as EmailTemplate['type'] })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="transactional">Transactional</option>
                      <option value="marketing">Marketing</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={selectedTemplate.subject}
                    onChange={(e) => handleUpdateTemplate({ subject: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Use {{variable}} for dynamic content"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-400">Email Body (HTML)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Insert:</span>
                      {availableVariables.slice(0, 4).map(v => (
                        <button
                          key={v.name}
                          onClick={() => insertVariable(v.name)}
                          className="text-xs px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                          title={v.description}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    name="body"
                    value={selectedTemplate.body}
                    onChange={(e) => handleUpdateTemplate({ body: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                    rows={15}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTemplate.active}
                      onChange={(e) => handleUpdateTemplate({ active: e.target.checked })}
                      className="rounded bg-gray-800 border-gray-600 text-purple-600"
                    />
                    <span className="text-sm text-white">Active</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4 bg-gray-950">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 bg-gray-100 border-b">
                  <div className="text-sm text-gray-600">
                    <strong>Subject:</strong> {selectedTemplate.subject.replace(/\{\{[\w_]+\}\}/g, '[data]')}
                  </div>
                </div>
                <div
                  className="p-6 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview() }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No template selected</p>
            <p className="text-sm">Select or create a template</p>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-800 rounded-lg p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Send Test Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendTest}
                    disabled={!testEmail}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg"
                  >
                    Send Test
                  </button>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailTemplateEditor;
