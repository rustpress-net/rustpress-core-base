import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Storage Provider Types
export type StorageProviderType =
  | 'local'
  | 'aws-s3'
  | 'google-cloud'
  | 'azure-blob'
  | 'digitalocean-spaces'
  | 'cloudflare-r2'
  | 'backblaze-b2'
  | 'wasabi'
  | 'minio'
  | 'linode';

export interface StorageProviderConfig {
  id: string;
  type: StorageProviderType;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  settings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface StorageProviderDefinition {
  type: StorageProviderType;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: StorageField[];
}

export interface StorageField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number';
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

// Storage Provider Definitions
export const storageProviderDefinitions: StorageProviderDefinition[] = [
  {
    type: 'local',
    name: 'Local Storage',
    description: 'Store files on the local server filesystem',
    icon: 'HardDrive',
    color: 'gray',
    fields: [
      { key: 'uploadPath', label: 'Upload Path', type: 'text', placeholder: '/uploads', required: true, helpText: 'Local directory for file storage' },
      { key: 'maxFileSize', label: 'Max File Size (MB)', type: 'number', placeholder: '50', required: false },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://yoursite.com/uploads', required: true },
    ],
  },
  {
    type: 'aws-s3',
    name: 'Amazon S3',
    description: 'Amazon Simple Storage Service - highly scalable cloud storage',
    icon: 'Cloud',
    color: 'orange',
    fields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'region', label: 'Region', type: 'select', required: true, options: [
        { value: 'us-east-1', label: 'US East (N. Virginia)' },
        { value: 'us-east-2', label: 'US East (Ohio)' },
        { value: 'us-west-1', label: 'US West (N. California)' },
        { value: 'us-west-2', label: 'US West (Oregon)' },
        { value: 'eu-west-1', label: 'Europe (Ireland)' },
        { value: 'eu-west-2', label: 'Europe (London)' },
        { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
        { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
        { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
        { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
      ]},
      { key: 'endpoint', label: 'Custom Endpoint (Optional)', type: 'text', placeholder: 'https://s3.amazonaws.com', required: false },
      { key: 'cdnUrl', label: 'CDN URL (Optional)', type: 'text', placeholder: 'https://cdn.example.com', required: false },
    ],
  },
  {
    type: 'google-cloud',
    name: 'Google Cloud Storage',
    description: 'Google Cloud Platform object storage service',
    icon: 'Cloud',
    color: 'blue',
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-123', required: true },
      { key: 'clientEmail', label: 'Client Email', type: 'text', placeholder: 'service-account@project.iam.gserviceaccount.com', required: true },
      { key: 'privateKey', label: 'Private Key', type: 'password', placeholder: '-----BEGIN PRIVATE KEY-----', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'cdnUrl', label: 'CDN URL (Optional)', type: 'text', placeholder: 'https://cdn.example.com', required: false },
    ],
  },
  {
    type: 'azure-blob',
    name: 'Azure Blob Storage',
    description: 'Microsoft Azure cloud object storage',
    icon: 'Cloud',
    color: 'blue',
    fields: [
      { key: 'accountName', label: 'Storage Account Name', type: 'text', placeholder: 'mystorageaccount', required: true },
      { key: 'accountKey', label: 'Account Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'containerName', label: 'Container Name', type: 'text', placeholder: 'media', required: true },
      { key: 'cdnUrl', label: 'CDN URL (Optional)', type: 'text', placeholder: 'https://cdn.example.com', required: false },
    ],
  },
  {
    type: 'digitalocean-spaces',
    name: 'DigitalOcean Spaces',
    description: 'S3-compatible object storage from DigitalOcean',
    icon: 'Cloud',
    color: 'blue',
    fields: [
      { key: 'accessKeyId', label: 'Access Key', type: 'text', placeholder: 'DO00X...', required: true },
      { key: 'secretAccessKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'spaceName', label: 'Space Name', type: 'text', placeholder: 'my-space', required: true },
      { key: 'region', label: 'Region', type: 'select', required: true, options: [
        { value: 'nyc3', label: 'New York 3' },
        { value: 'ams3', label: 'Amsterdam 3' },
        { value: 'sgp1', label: 'Singapore 1' },
        { value: 'fra1', label: 'Frankfurt 1' },
        { value: 'sfo3', label: 'San Francisco 3' },
      ]},
      { key: 'cdnEnabled', label: 'Enable CDN', type: 'select', required: false, options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ]},
    ],
  },
  {
    type: 'cloudflare-r2',
    name: 'Cloudflare R2',
    description: 'S3-compatible storage with no egress fees',
    icon: 'Cloud',
    color: 'orange',
    fields: [
      { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'abc123...', required: true },
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: '...', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'publicUrl', label: 'Public URL', type: 'text', placeholder: 'https://pub-xxx.r2.dev', required: false },
    ],
  },
  {
    type: 'backblaze-b2',
    name: 'Backblaze B2',
    description: 'Affordable cloud storage with S3 compatibility',
    icon: 'Cloud',
    color: 'red',
    fields: [
      { key: 'applicationKeyId', label: 'Application Key ID', type: 'text', placeholder: '...', required: true },
      { key: 'applicationKey', label: 'Application Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'bucketId', label: 'Bucket ID', type: 'text', placeholder: '...', required: true },
      { key: 'endpoint', label: 'S3 Endpoint', type: 'text', placeholder: 's3.us-west-001.backblazeb2.com', required: true },
    ],
  },
  {
    type: 'wasabi',
    name: 'Wasabi',
    description: 'Hot cloud storage with S3 compatibility',
    icon: 'Cloud',
    color: 'green',
    fields: [
      { key: 'accessKeyId', label: 'Access Key', type: 'text', placeholder: '...', required: true },
      { key: 'secretAccessKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'region', label: 'Region', type: 'select', required: true, options: [
        { value: 'us-east-1', label: 'US East 1 (N. Virginia)' },
        { value: 'us-east-2', label: 'US East 2 (N. Virginia)' },
        { value: 'us-central-1', label: 'US Central 1 (Texas)' },
        { value: 'us-west-1', label: 'US West 1 (Oregon)' },
        { value: 'eu-central-1', label: 'EU Central 1 (Amsterdam)' },
        { value: 'eu-central-2', label: 'EU Central 2 (Frankfurt)' },
        { value: 'eu-west-1', label: 'EU West 1 (London)' },
        { value: 'eu-west-2', label: 'EU West 2 (Paris)' },
        { value: 'ap-northeast-1', label: 'AP Northeast 1 (Tokyo)' },
        { value: 'ap-northeast-2', label: 'AP Northeast 2 (Osaka)' },
        { value: 'ap-southeast-1', label: 'AP Southeast 1 (Singapore)' },
        { value: 'ap-southeast-2', label: 'AP Southeast 2 (Sydney)' },
      ]},
    ],
  },
  {
    type: 'minio',
    name: 'MinIO',
    description: 'Self-hosted S3-compatible object storage',
    icon: 'Server',
    color: 'red',
    fields: [
      { key: 'endpoint', label: 'Endpoint URL', type: 'text', placeholder: 'https://minio.example.com', required: true },
      { key: 'accessKeyId', label: 'Access Key', type: 'text', placeholder: 'minioadmin', required: true },
      { key: 'secretAccessKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'media', required: true },
      { key: 'useSSL', label: 'Use SSL', type: 'select', required: true, options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ]},
      { key: 'port', label: 'Port (Optional)', type: 'number', placeholder: '9000', required: false },
    ],
  },
  {
    type: 'linode',
    name: 'Linode Object Storage',
    description: 'S3-compatible object storage from Linode',
    icon: 'Cloud',
    color: 'green',
    fields: [
      { key: 'accessKeyId', label: 'Access Key', type: 'text', placeholder: '...', required: true },
      { key: 'secretAccessKey', label: 'Secret Key', type: 'password', placeholder: '••••••••', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'cluster', label: 'Cluster', type: 'select', required: true, options: [
        { value: 'us-east-1', label: 'Newark, NJ' },
        { value: 'eu-central-1', label: 'Frankfurt, DE' },
        { value: 'ap-south-1', label: 'Singapore, SG' },
        { value: 'us-southeast-1', label: 'Atlanta, GA' },
      ]},
    ],
  },
];

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  service: string;
  key: string;
  secret?: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: { key: string; label: string; type: 'text' | 'password'; placeholder: string; required: boolean }[];
}

// Common API services
export const apiServiceDefinitions: ApiServiceDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI text and image generation',
    icon: 'Brain',
    color: 'green',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
      { key: 'orgId', label: 'Organization ID (Optional)', type: 'text', placeholder: 'org-...', required: false },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing',
    icon: 'CreditCard',
    color: 'purple',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_...', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_...', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', placeholder: 'whsec_...', required: false },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery service',
    icon: 'Mail',
    color: 'blue',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'SG...', required: true },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing platform',
    icon: 'Mail',
    color: 'yellow',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...', required: true },
      { key: 'server', label: 'Server Prefix', type: 'text', placeholder: 'us1', required: true },
    ],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website analytics',
    icon: 'BarChart',
    color: 'orange',
    fields: [
      { key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX', required: true },
    ],
  },
  {
    id: 'google-recaptcha',
    name: 'Google reCAPTCHA',
    description: 'Bot protection',
    icon: 'Shield',
    color: 'blue',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'text', placeholder: '...', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: '...', required: true },
    ],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    description: 'Image and video management',
    icon: 'Image',
    color: 'blue',
    fields: [
      { key: 'cloudName', label: 'Cloud Name', type: 'text', placeholder: '...', required: true },
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: '...', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: '...', required: true },
    ],
  },
  {
    id: 'algolia',
    name: 'Algolia',
    description: 'Search as a service',
    icon: 'Search',
    color: 'purple',
    fields: [
      { key: 'appId', label: 'Application ID', type: 'text', placeholder: '...', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...', required: true },
      { key: 'indexName', label: 'Index Name', type: 'text', placeholder: '...', required: true },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communications',
    icon: 'Phone',
    color: 'red',
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: '...', required: true },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '+1...', required: false },
    ],
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Add your own API credentials',
    icon: 'Key',
    color: 'gray',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: '...', required: true },
      { key: 'apiSecret', label: 'API Secret (Optional)', type: 'password', placeholder: '...', required: false },
      { key: 'endpoint', label: 'Endpoint URL (Optional)', type: 'text', placeholder: 'https://api.example.com', required: false },
    ],
  },
];

interface StorageState {
  providers: StorageProviderConfig[];
  apiKeys: ApiKey[];
  activeProviderId: string | null;

  // Provider actions
  addProvider: (provider: Omit<StorageProviderConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProvider: (id: string, updates: Partial<StorageProviderConfig>) => void;
  deleteProvider: (id: string) => void;
  setDefaultProvider: (id: string) => void;
  testProviderConnection: (id: string) => Promise<boolean>;

  // API Key actions
  addApiKey: (apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateApiKey: (id: string, updates: Partial<ApiKey>) => void;
  deleteApiKey: (id: string) => void;
  toggleApiKey: (id: string) => void;
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set, get) => ({
      providers: [
        {
          id: 'local-default',
          type: 'local',
          name: 'Local Storage',
          isDefault: true,
          isActive: true,
          settings: {
            uploadPath: '/uploads',
            maxFileSize: '50',
            baseUrl: '/uploads',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      apiKeys: [],
      activeProviderId: 'local-default',

      addProvider: (provider) => {
        const id = `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        set((state) => ({
          providers: [
            ...state.providers,
            {
              ...provider,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },

      updateProvider: (id, updates) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProvider: (id) => {
        const state = get();
        if (state.providers.length <= 1) return; // Keep at least one provider

        set((state) => {
          const newProviders = state.providers.filter((p) => p.id !== id);
          // If deleting the default, set another as default
          if (state.providers.find((p) => p.id === id)?.isDefault && newProviders.length > 0) {
            newProviders[0].isDefault = true;
          }
          return {
            providers: newProviders,
            activeProviderId: state.activeProviderId === id ? newProviders[0]?.id || null : state.activeProviderId,
          };
        });
      },

      setDefaultProvider: (id) => {
        set((state) => ({
          providers: state.providers.map((p) => ({
            ...p,
            isDefault: p.id === id,
            updatedAt: p.id === id ? new Date().toISOString() : p.updatedAt,
          })),
          activeProviderId: id,
        }));
      },

      testProviderConnection: async (id) => {
        // Simulate connection test
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return Math.random() > 0.2; // 80% success rate for demo
      },

      addApiKey: (apiKey) => {
        const id = `apikey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        set((state) => ({
          apiKeys: [
            ...state.apiKeys,
            {
              ...apiKey,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },

      updateApiKey: (id, updates) => {
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.id === id
              ? { ...k, ...updates, updatedAt: new Date().toISOString() }
              : k
          ),
        }));
      },

      deleteApiKey: (id) => {
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id),
        }));
      },

      toggleApiKey: (id) => {
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.id === id
              ? { ...k, isActive: !k.isActive, updatedAt: new Date().toISOString() }
              : k
          ),
        }));
      },
    }),
    {
      name: 'rustpress-storage',
    }
  )
);
