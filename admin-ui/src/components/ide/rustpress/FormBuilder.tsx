/**
 * FormBuilder - Drag-and-drop form creation
 * RustPress-specific form building functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FormInput, Type, Mail, Phone, Calendar, Hash, List,
  CheckSquare, Circle, Upload, FileText, Link, Star,
  Plus, Trash2, Copy, Settings, Eye, Save, Code,
  GripVertical, ChevronDown, ChevronRight, Palette
} from 'lucide-react';

export interface FormFieldType {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'url' | 'rating';
  icon: React.ReactNode;
  label: string;
}

export interface FormField {
  id: string;
  type: FormFieldType['type'];
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  submitButton: string;
  successMessage: string;
  notifications: {
    email?: string;
    webhook?: string;
  };
}

interface FormBuilderProps {
  onSave?: (form: Form) => void;
  onPreview?: (form: Form) => void;
}

const fieldTypes: FormFieldType[] = [
  { id: 'text', type: 'text', icon: <Type className="w-4 h-4" />, label: 'Text Input' },
  { id: 'email', type: 'email', icon: <Mail className="w-4 h-4" />, label: 'Email' },
  { id: 'phone', type: 'phone', icon: <Phone className="w-4 h-4" />, label: 'Phone' },
  { id: 'number', type: 'number', icon: <Hash className="w-4 h-4" />, label: 'Number' },
  { id: 'textarea', type: 'textarea', icon: <FileText className="w-4 h-4" />, label: 'Text Area' },
  { id: 'select', type: 'select', icon: <List className="w-4 h-4" />, label: 'Dropdown' },
  { id: 'checkbox', type: 'checkbox', icon: <CheckSquare className="w-4 h-4" />, label: 'Checkbox' },
  { id: 'radio', type: 'radio', icon: <Circle className="w-4 h-4" />, label: 'Radio Group' },
  { id: 'file', type: 'file', icon: <Upload className="w-4 h-4" />, label: 'File Upload' },
  { id: 'date', type: 'date', icon: <Calendar className="w-4 h-4" />, label: 'Date Picker' },
  { id: 'url', type: 'url', icon: <Link className="w-4 h-4" />, label: 'URL' },
  { id: 'rating', type: 'rating', icon: <Star className="w-4 h-4" />, label: 'Star Rating' },
];

const mockForm: Form = {
  id: '1',
  name: 'Contact Form',
  description: 'Get in touch with us',
  fields: [
    { id: 'f1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
    { id: 'f2', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
    { id: 'f3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false },
    { id: 'f4', type: 'select', label: 'Subject', required: true, options: ['General Inquiry', 'Support', 'Sales', 'Partnership'] },
    { id: 'f5', type: 'textarea', label: 'Message', placeholder: 'Your message...', required: true },
  ],
  submitButton: 'Send Message',
  successMessage: 'Thank you! We\'ll get back to you soon.',
  notifications: { email: 'contact@example.com' }
};

export const FormBuilder: React.FC<FormBuilderProps> = ({
  onSave,
  onPreview
}) => {
  const [form, setForm] = useState<Form>(mockForm);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [activeTab, setActiveTab] = useState<'fields' | 'settings' | 'code'>('fields');
  const [showPreview, setShowPreview] = useState(false);

  const addField = (type: FormFieldType['type']) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: fieldTypes.find(f => f.type === type)?.label || 'New Field',
      required: false,
      options: ['select', 'checkbox', 'radio'].includes(type) ? ['Option 1', 'Option 2'] : undefined
    };
    setForm({ ...form, fields: [...form.fields, newField] });
    setSelectedField(newField);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      )
    });
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (fieldId: string) => {
    setForm({ ...form, fields: form.fields.filter(f => f.id !== fieldId) });
    if (selectedField?.id === fieldId) setSelectedField(null);
  };

  const duplicateField = (field: FormField) => {
    const newField = { ...field, id: `field-${Date.now()}`, label: `${field.label} (Copy)` };
    const index = form.fields.findIndex(f => f.id === field.id);
    const newFields = [...form.fields];
    newFields.splice(index + 1, 0, newField);
    setForm({ ...form, fields: newFields });
  };

  const generateCode = () => {
    return `<form id="${form.id}" class="rustpress-form">
  ${form.fields.map(field => {
    switch (field.type) {
      case 'textarea':
        return `  <div class="form-group">
    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
    <textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''}></textarea>
  </div>`;
      case 'select':
        return `  <div class="form-group">
    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
    <select id="${field.id}" name="${field.id}"${field.required ? ' required' : ''}>
      ${field.options?.map(opt => `<option value="${opt}">${opt}</option>`).join('\n      ')}
    </select>
  </div>`;
      default:
        return `  <div class="form-group">
    <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>
    <input type="${field.type}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}"${field.required ? ' required' : ''} />
  </div>`;
    }
  }).join('\n')}
  <button type="submit">${form.submitButton}</button>
</form>`;
  };

  const getFieldIcon = (type: string) => {
    return fieldTypes.find(f => f.type === type)?.icon || <FormInput className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Left Panel - Field Types */}
      <div className="w-56 border-r border-gray-800 flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <h3 className="text-sm font-medium text-white">Field Types</h3>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map(fieldType => (
              <button
                key={fieldType.id}
                onClick={() => addField(fieldType.type)}
                className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
              >
                {fieldType.icon}
                <span className="text-xs">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - Form Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-transparent text-lg font-semibold text-white border-none focus:outline-none"
            />
            <input
              type="text"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Form description..."
              className="block w-full bg-transparent text-sm text-gray-400 border-none focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSave?.(form)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
            >
              <Save className="w-4 h-4" />
              Save Form
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6">
          {showPreview ? (
            /* Preview Mode */
            <div className="max-w-lg mx-auto bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">{form.name}</h2>
              {form.description && <p className="text-gray-400 mb-6">{form.description}</p>}
              <div className="space-y-4">
                {form.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-white mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-2">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-gray-300">
                            <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-gray-300">
                            <input type="radio" name={field.id} className="bg-gray-700 border-gray-600" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'rating' ? (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-yellow-400" />
                        ))}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    )}
                    {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg">
                {form.submitButton}
              </button>
            </div>
          ) : (
            /* Edit Mode */
            <div className="max-w-lg mx-auto space-y-3">
              <Reorder.Group
                axis="y"
                values={form.fields}
                onReorder={(fields) => setForm({ ...form, fields })}
              >
                {form.fields.map(field => (
                  <Reorder.Item key={field.id} value={field}>
                    <motion.div
                      onClick={() => setSelectedField(field)}
                      className={`bg-gray-800/50 rounded-lg p-4 cursor-pointer border-2 transition-colors ${
                        selectedField?.id === field.id ? 'border-purple-500' : 'border-transparent hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                        <span className="text-purple-400">{getFieldIcon(field.type)}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{field.label}</div>
                          <div className="text-xs text-gray-500">{fieldTypes.find(f => f.type === field.type)?.label}</div>
                        </div>
                        {field.required && (
                          <span className="text-xs text-red-400">Required</span>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateField(field); }}
                          className="p-1.5 hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                          className="p-1.5 hover:bg-gray-700 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {form.fields.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FormInput className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No fields yet</p>
                  <p className="text-sm">Click a field type on the left to add it</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Field Settings */}
      <div className="w-72 border-l border-gray-800 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'fields' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
            }`}
          >
            Field
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'settings' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'code' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'
            }`}
          >
            Code
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'fields' && selectedField ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Placeholder</label>
                <input
                  type="text"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Help Text</label>
                <input
                  type="text"
                  value={selectedField.helpText || ''}
                  onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="rounded bg-gray-800 border-gray-600 text-purple-600"
                />
                <span className="text-sm text-white">Required field</span>
              </label>

              {selectedField.options && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Options</label>
                  <div className="space-y-2">
                    {selectedField.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...selectedField.options!];
                            newOpts[i] = e.target.value;
                            updateField(selectedField.id, { options: newOpts });
                          }}
                          className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        />
                        <button
                          onClick={() => {
                            const newOpts = selectedField.options!.filter((_, idx) => idx !== i);
                            updateField(selectedField.id, { options: newOpts });
                          }}
                          className="p-1.5 hover:bg-gray-700 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        updateField(selectedField.id, { options: [...selectedField.options!, `Option ${selectedField.options!.length + 1}`] });
                      }}
                      className="w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Option
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'settings' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Submit Button Text</label>
                <input
                  type="text"
                  value={form.submitButton}
                  onChange={(e) => setForm({ ...form, submitButton: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Success Message</label>
                <textarea
                  value={form.successMessage}
                  onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email Notification</label>
                <input
                  type="email"
                  value={form.notifications.email || ''}
                  onChange={(e) => setForm({ ...form, notifications: { ...form.notifications, email: e.target.value } })}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Webhook URL</label>
                <input
                  type="url"
                  value={form.notifications.webhook || ''}
                  onChange={(e) => setForm({ ...form, notifications: { ...form.notifications, webhook: e.target.value } })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">HTML Output</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generateCode())}
                  className="p-1.5 hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <pre className="p-3 bg-gray-950 rounded-lg text-xs text-gray-300 overflow-auto max-h-96">
                {generateCode()}
              </pre>
            </div>
          )}

          {activeTab === 'fields' && !selectedField && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a field to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
