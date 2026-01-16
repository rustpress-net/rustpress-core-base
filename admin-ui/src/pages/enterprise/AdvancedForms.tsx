/**
 * RustPress Advanced Forms Demo
 * Showcases all form enhancement components
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Tags,
  Calendar,
  ListOrdered,
  Save,
  AlertCircle,
  Puzzle,
  User,
  Mail,
  Lock,
  Building,
  MapPin,
  CreditCard,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  RichTextEditor,
  FileUpload,
  MultiSelectComboBox,
  DateRangePicker,
  FormWizard,
  WizardStepContent,
  WizardProgressBar,
  useWizard,
  AutoSaveForm,
  AutoSaveStatus,
  AutoSaveButton,
  useAutoSave,
  ValidationSummary,
  DynamicFormBuilder,
  createFormSchema,
  staggerContainer,
  fadeInUp,
} from '../../design-system';

// ============================================================================
// Rich Text Editor Demo
// ============================================================================

function RichTextEditorDemo() {
  const [content, setContent] = useState('<p>Start writing your <strong>amazing</strong> content here...</p>');

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Full-featured WYSIWYG editor with formatting toolbar, image uploads, and more.
      </p>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write something amazing..."
        features={[
          'bold', 'italic', 'underline', 'heading',
          'alignment', 'list', 'link', 'image',
          'code', 'quote', 'undo', 'fullscreen', 'preview', 'source'
        ]}
        onImageUpload={async (file) => {
          // Simulate upload
          await new Promise(r => setTimeout(r, 1000));
          return URL.createObjectURL(file);
        }}
      />
      <div className="text-xs text-neutral-400">
        Character count: {content.replace(/<[^>]*>/g, '').length}
      </div>
    </div>
  );
}

// ============================================================================
// File Upload Demo
// ============================================================================

function FileUploadDemo() {
  const handleUpload = async (file: File) => {
    // Simulate upload
    await new Promise(r => setTimeout(r, 2000));
    return `https://example.com/uploads/${file.name}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Dropzone Variant</h4>
        <FileUpload
          variant="dropzone"
          multiple
          accept={['image/*', '.pdf', '.doc', '.docx']}
          maxSize={10 * 1024 * 1024}
          onUpload={handleUpload}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Button Variant</h4>
        <FileUpload
          variant="button"
          accept={['image/*']}
          onUpload={handleUpload}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Compact Variant</h4>
        <FileUpload
          variant="compact"
          accept={['.pdf']}
          onUpload={handleUpload}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Multi-Select Combo Box Demo
// ============================================================================

function MultiSelectDemo() {
  const [selectedTags, setSelectedTags] = useState<(string | number)[]>(['react', 'typescript']);
  const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);

  const tagOptions = [
    { value: 'react', label: 'React', description: 'JavaScript library for building UIs' },
    { value: 'typescript', label: 'TypeScript', description: 'Typed superset of JavaScript' },
    { value: 'rust', label: 'Rust', description: 'Systems programming language' },
    { value: 'golang', label: 'Go', description: 'Efficient compiled language' },
    { value: 'python', label: 'Python', description: 'Versatile scripting language' },
    { value: 'docker', label: 'Docker', description: 'Container platform' },
    { value: 'kubernetes', label: 'Kubernetes', description: 'Container orchestration' },
  ];

  const loadUsers = async (search: string) => {
    await new Promise(r => setTimeout(r, 500));
    const allUsers = [
      { value: 1, label: 'John Doe', description: 'john@example.com' },
      { value: 2, label: 'Jane Smith', description: 'jane@example.com' },
      { value: 3, label: 'Bob Wilson', description: 'bob@example.com' },
      { value: 4, label: 'Alice Brown', description: 'alice@example.com' },
    ];
    return allUsers.filter(u =>
      u.label.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Static Options</h4>
        <MultiSelectComboBox
          value={selectedTags}
          onChange={setSelectedTags}
          options={tagOptions}
          placeholder="Select technologies..."
          createOption
          onCreate={(value) => {
            console.log('Creating new tag:', value);
            return { value, label: value };
          }}
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-2">Async Loading</h4>
        <MultiSelectComboBox
          value={selectedUsers}
          onChange={setSelectedUsers}
          loadOptions={loadUsers}
          placeholder="Search users..."
          variant="pills"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Date Range Picker Demo
// ============================================================================

function DateRangePickerDemo() {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  return (
    <div className="space-y-4">
      <DateRangePicker
        value={range}
        onChange={setRange}
        showPresets
        dualMonth
      />
      {range.start && range.end && (
        <p className="text-sm text-neutral-500">
          Selected: {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Form Wizard Demo
// ============================================================================

function FormWizardDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    plan: 'pro',
    cardNumber: '',
  });

  const steps = [
    {
      id: 'account',
      title: 'Account',
      description: 'Create your account',
      icon: <User className="w-5 h-5" />,
      validate: () => formData.name.length > 0 && formData.email.length > 0 && formData.password.length > 0,
    },
    {
      id: 'company',
      title: 'Company',
      description: 'Your organization',
      icon: <Building className="w-5 h-5" />,
      optional: true,
    },
    {
      id: 'plan',
      title: 'Plan',
      description: 'Choose your plan',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Payment details',
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onComplete={() => {
        console.log('Wizard completed:', formData);
        alert('Registration complete!');
      }}
      variant="horizontal"
      stepperPosition="top"
    >
      <WizardStepContent stepIndex={0}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="********"
            />
          </div>
        </div>
      </WizardStepContent>

      <WizardStepContent stepIndex={1}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="Developer"
            />
          </div>
        </div>
      </WizardStepContent>

      <WizardStepContent stepIndex={2}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'starter', name: 'Starter', price: '$9/mo', features: ['5 Projects', '1GB Storage'] },
            { id: 'pro', name: 'Pro', price: '$29/mo', features: ['Unlimited Projects', '10GB Storage', 'Priority Support'] },
            { id: 'enterprise', name: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', 'SSO', 'SLA'] },
          ].map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setFormData({ ...formData, plan: plan.id })}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                formData.plan === plan.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-lg font-bold text-primary-600">{plan.price}</p>
              <ul className="mt-2 text-sm text-neutral-500 space-y-1">
                {plan.features.map((f) => (
                  <li key={f}>- {f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </WizardStepContent>

      <WizardStepContent stepIndex={3}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVC</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </WizardStepContent>
    </FormWizard>
  );
}

// ============================================================================
// Auto-Save Form Demo
// ============================================================================

function AutoSaveFormDemo() {
  return (
    <AutoSaveForm
      initialValues={{
        title: '',
        content: '',
        category: 'general',
      }}
      onSave={async (values) => {
        await new Promise(r => setTimeout(r, 1000));
        console.log('Saved:', values);
      }}
      saveInterval={10000}
      debounceMs={1500}
      localStorageKey="auto-save-demo"
    >
      {({ values, setFieldValue, isDirty }) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Draft Post</h4>
            <div className="flex items-center gap-3">
              <AutoSaveStatus />
              <AutoSaveButton />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={values.title as string}
              onChange={(e) => setFieldValue('title', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
              placeholder="Enter title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={values.category as string}
              onChange={(e) => setFieldValue('category', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800"
            >
              <option value="general">General</option>
              <option value="news">News</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={values.content as string}
              onChange={(e) => setFieldValue('content', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 min-h-[150px]"
              placeholder="Write your content..."
            />
          </div>

          {isDirty && (
            <p className="text-xs text-warning-600">You have unsaved changes</p>
          )}
        </div>
      )}
    </AutoSaveForm>
  );
}

// ============================================================================
// Validation Summary Demo
// ============================================================================

function ValidationSummaryDemo() {
  const sampleErrors = [
    { id: '1', field: 'email', fieldLabel: 'Email', message: 'Please enter a valid email address', severity: 'error' as const },
    { id: '2', field: 'password', fieldLabel: 'Password', message: 'Password must be at least 8 characters', severity: 'error' as const },
    { id: '3', field: 'username', fieldLabel: 'Username', message: 'Username is already taken', severity: 'error' as const },
    { id: '4', field: 'bio', fieldLabel: 'Bio', message: 'Bio is recommended for better profile visibility', severity: 'warning' as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">List Variant</h4>
        <ValidationSummary
          errors={sampleErrors}
          variant="list"
          collapsible
          dismissible
          showFieldLabels
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Inline Variant</h4>
        <ValidationSummary
          errors={sampleErrors.slice(0, 2)}
          variant="inline"
          showFieldLabels
        />
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 dark:text-white mb-3">Banner Variant</h4>
        <ValidationSummary
          errors={sampleErrors.slice(0, 2)}
          variant="banner"
          dismissible
        />
      </div>
    </div>
  );
}

// ============================================================================
// Dynamic Form Builder Demo
// ============================================================================

function DynamicFormBuilderDemo() {
  const schema = createFormSchema([
    {
      id: 'name',
      name: 'name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'John Doe',
      validation: { required: true, minLength: 2 },
    },
    {
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'john@example.com',
      validation: { required: true },
    },
    {
      id: 'role',
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'user', label: 'User' },
        { value: 'editor', label: 'Editor' },
        { value: 'admin', label: 'Administrator' },
      ],
      defaultValue: 'user',
    },
    {
      id: 'notify',
      name: 'notify',
      type: 'switch',
      label: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      defaultValue: true,
    },
    {
      id: 'bio',
      name: 'bio',
      type: 'textarea',
      label: 'Bio',
      placeholder: 'Tell us about yourself...',
      showIf: { field: 'role', operator: 'not_equals', value: 'user' },
    },
    {
      id: 'permissions',
      name: 'permissions',
      type: 'multiselect',
      label: 'Permissions',
      options: [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete' },
        { value: 'admin', label: 'Admin' },
      ],
      showIf: { field: 'role', operator: 'equals', value: 'admin' },
    },
  ], {
    layout: 'two-column',
    submitLabel: 'Create User',
    showReset: true,
  });

  return (
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        This form is generated from a JSON schema. Try changing the Role to see conditional fields.
      </p>
      <DynamicFormBuilder
        schema={schema}
        onSubmit={async (values) => {
          console.log('Form submitted:', values);
          await new Promise(r => setTimeout(r, 1000));
          alert('User created successfully!');
        }}
      />
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export function AdvancedForms() {
  const components = [
    { id: 'richtext', label: 'Rich Text Editor', icon: FileText },
    { id: 'fileupload', label: 'File Upload', icon: Upload },
    { id: 'multiselect', label: 'Multi-Select', icon: Tags },
    { id: 'daterange', label: 'Date Range Picker', icon: Calendar },
    { id: 'wizard', label: 'Form Wizard', icon: ListOrdered },
    { id: 'autosave', label: 'Auto-Save Form', icon: Save },
    { id: 'validation', label: 'Validation Summary', icon: AlertCircle },
    { id: 'dynamic', label: 'Dynamic Form', icon: Puzzle },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Advanced Forms Demo"
        description="Enterprise-grade form components for complex data entry scenarios"
      />

      {/* Feature highlights */}
      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Rich Text Editor', desc: 'WYSIWYG editing' },
          { label: 'Form Wizard', desc: 'Multi-step forms' },
          { label: 'Auto-Save', desc: 'Never lose data' },
          { label: 'Dynamic Forms', desc: 'JSON schema based' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {feature.label}
            </h3>
            <p className="text-sm text-neutral-500">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabbed demos */}
      <motion.div variants={fadeInUp}>
        <Card>
          <Tabs defaultValue="richtext">
            <CardHeader>
              <TabList>
                {components.map((comp) => (
                  <Tab key={comp.id} value={comp.id}>
                    <comp.icon className="w-4 h-4 mr-2" />
                    {comp.label}
                  </Tab>
                ))}
              </TabList>
            </CardHeader>
            <CardBody>
              <TabPanels>
                <TabPanel value="richtext">
                  <RichTextEditorDemo />
                </TabPanel>
                <TabPanel value="fileupload">
                  <FileUploadDemo />
                </TabPanel>
                <TabPanel value="multiselect">
                  <MultiSelectDemo />
                </TabPanel>
                <TabPanel value="daterange">
                  <DateRangePickerDemo />
                </TabPanel>
                <TabPanel value="wizard">
                  <FormWizardDemo />
                </TabPanel>
                <TabPanel value="autosave">
                  <AutoSaveFormDemo />
                </TabPanel>
                <TabPanel value="validation">
                  <ValidationSummaryDemo />
                </TabPanel>
                <TabPanel value="dynamic">
                  <DynamicFormBuilderDemo />
                </TabPanel>
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default AdvancedForms;
