/**
 * RustPress Enterprise API Management
 * Comprehensive API key management, secrets vault, and settings configuration
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Shield,
  Lock,
  Unlock,
  Settings,
  Globe,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Code,
  Zap,
  Database,
  Server,
  Webhook,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Pause,
  Play,
  History,
  FileText,
  Terminal,
  Link,
  Clipboard,
  Check,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Badge,
  Tabs,
  Tab,
  Modal,
  Switch,
  Tooltip,
  Alert,
  PageHeader,
} from '../../design-system';

// Custom Select component
const Select: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${className}`}
  >
    {children}
  </select>
);

// Custom Table components
const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table className="w-full">{children}</table>
);

const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
    {children}
  </thead>
);

const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">{children}</tbody>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">{children}</tr>
);

const TableCell: React.FC<{ children: React.ReactNode; header?: boolean; className?: string }> = ({
  children,
  header = false,
  className = '',
}) =>
  header ? (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  ) : (
    <td className={`px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300 ${className}`}>
      {children}
    </td>
  );

// Types
interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
  usageCount: number;
  rateLimit: number;
  ipWhitelist: string[];
  environment: 'production' | 'staging' | 'development';
}

interface ApiSecret {
  id: string;
  name: string;
  description: string;
  value: string;
  category: 'database' | 'external-api' | 'encryption' | 'oauth' | 'webhook' | 'other';
  environment: 'production' | 'staging' | 'development' | 'all';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isEncrypted: boolean;
  rotationPolicy: 'manual' | '30-days' | '60-days' | '90-days';
  lastRotated: string | null;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'failing';
  secret: string;
  createdAt: string;
  lastTriggered: string | null;
  successRate: number;
  totalDeliveries: number;
}

interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  peakRpm: number;
  bandwidthUsed: string;
}

// Mock data
const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'rp_live_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    prefix: 'rp_live_sk',
    permissions: ['read:content', 'write:content', 'read:users', 'read:media'],
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    expiresAt: '2025-01-15T10:30:00Z',
    lastUsed: '2024-12-20T14:22:00Z',
    usageCount: 125430,
    rateLimit: 1000,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    environment: 'production',
  },
  {
    id: '2',
    name: 'Mobile App Key',
    key: 'rp_live_pk_x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4',
    prefix: 'rp_live_pk',
    permissions: ['read:content', 'read:media'],
    status: 'active',
    createdAt: '2024-03-10T08:00:00Z',
    expiresAt: null,
    lastUsed: '2024-12-20T16:45:00Z',
    usageCount: 892150,
    rateLimit: 500,
    ipWhitelist: [],
    environment: 'production',
  },
  {
    id: '3',
    name: 'Development Key',
    key: 'rp_test_sk_dev123456789abcdef0123456789abcd',
    prefix: 'rp_test_sk',
    permissions: ['*'],
    status: 'active',
    createdAt: '2024-06-01T12:00:00Z',
    expiresAt: null,
    lastUsed: '2024-12-19T09:30:00Z',
    usageCount: 45280,
    rateLimit: 100,
    ipWhitelist: ['127.0.0.1'],
    environment: 'development',
  },
  {
    id: '4',
    name: 'Legacy Integration',
    key: 'rp_live_sk_legacy_integration_key_deprecated',
    prefix: 'rp_live_sk',
    permissions: ['read:content'],
    status: 'expired',
    createdAt: '2023-01-01T00:00:00Z',
    expiresAt: '2024-01-01T00:00:00Z',
    lastUsed: '2023-12-28T23:59:00Z',
    usageCount: 1250000,
    rateLimit: 200,
    ipWhitelist: [],
    environment: 'production',
  },
];

const mockSecrets: ApiSecret[] = [
  {
    id: '1',
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    value: 'postgres://user:password@localhost:5432/rustpress',
    category: 'database',
    environment: 'production',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-11-15T14:30:00Z',
    createdBy: 'admin@rustpress.dev',
    isEncrypted: true,
    rotationPolicy: '90-days',
    lastRotated: '2024-11-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe payment processing API key',
    value: 'sk_test_EXAMPLE_PLACEHOLDER_NOT_REAL',
    category: 'external-api',
    environment: 'production',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-09-01T10:00:00Z',
    createdBy: 'admin@rustpress.dev',
    isEncrypted: true,
    rotationPolicy: '30-days',
    lastRotated: '2024-12-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'JWT_SECRET',
    description: 'JWT token signing secret',
    value: 'super_secret_jwt_signing_key_256_bits',
    category: 'encryption',
    environment: 'all',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: 'system',
    isEncrypted: true,
    rotationPolicy: '60-days',
    lastRotated: '2024-10-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'SENDGRID_API_KEY',
    description: 'SendGrid email service API key',
    value: 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    category: 'external-api',
    environment: 'production',
    createdAt: '2024-03-15T12:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
    createdBy: 'admin@rustpress.dev',
    isEncrypted: true,
    rotationPolicy: 'manual',
    lastRotated: null,
  },
  {
    id: '5',
    name: 'OAUTH_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    value: 'GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx',
    category: 'oauth',
    environment: 'all',
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2024-04-01T08:00:00Z',
    createdBy: 'admin@rustpress.dev',
    isEncrypted: true,
    rotationPolicy: 'manual',
    lastRotated: null,
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'Content Updates',
    url: 'https://api.example.com/webhooks/content',
    events: ['post.created', 'post.updated', 'post.deleted'],
    status: 'active',
    secret: 'whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2024-05-01T10:00:00Z',
    lastTriggered: '2024-12-20T15:30:00Z',
    successRate: 99.8,
    totalDeliveries: 15420,
  },
  {
    id: '2',
    name: 'User Registration',
    url: 'https://crm.example.com/hooks/new-user',
    events: ['user.created', 'user.verified'],
    status: 'active',
    secret: 'whsec_yyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    createdAt: '2024-06-15T14:00:00Z',
    lastTriggered: '2024-12-20T12:15:00Z',
    successRate: 100,
    totalDeliveries: 3250,
  },
  {
    id: '3',
    name: 'Analytics Sync',
    url: 'https://analytics.internal.com/ingest',
    events: ['analytics.pageview', 'analytics.event'],
    status: 'failing',
    secret: 'whsec_zzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    createdAt: '2024-08-01T09:00:00Z',
    lastTriggered: '2024-12-18T08:00:00Z',
    successRate: 45.2,
    totalDeliveries: 89000,
  },
];

const mockUsageStats: ApiUsageStats = {
  totalRequests: 2458930,
  successfulRequests: 2445120,
  failedRequests: 13810,
  avgResponseTime: 45,
  peakRpm: 12500,
  bandwidthUsed: '1.2 TB',
};

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Helper Components
const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={handleCopy}
      className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      {label && <span className="ml-1">{copied ? 'Copied!' : label}</span>}
    </Button>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { variant: 'success' | 'warning' | 'error' | 'neutral'; icon: React.ReactNode }> = {
    active: { variant: 'success', icon: <CheckCircle className="w-3 h-3" /> },
    inactive: { variant: 'neutral', icon: <Pause className="w-3 h-3" /> },
    expired: { variant: 'warning', icon: <Clock className="w-3 h-3" /> },
    revoked: { variant: 'error', icon: <XCircle className="w-3 h-3" /> },
    failing: { variant: 'error', icon: <AlertTriangle className="w-3 h-3" /> },
  };

  const { variant, icon } = config[status] || config.inactive;

  return (
    <Badge variant={variant} size="sm" className="flex items-center gap-1">
      {icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

const MaskedValue: React.FC<{ value: string; showFirst?: number; showLast?: number }> = ({
  value,
  showFirst = 8,
  showLast = 4,
}) => {
  const [revealed, setRevealed] = useState(false);

  const maskedValue = useMemo(() => {
    if (revealed) return value;
    const first = value.slice(0, showFirst);
    const last = value.slice(-showLast);
    const middle = '•'.repeat(Math.min(value.length - showFirst - showLast, 24));
    return `${first}${middle}${last}`;
  }, [value, revealed, showFirst, showLast]);

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">{maskedValue}</span>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setRevealed(!revealed)}
        className="text-neutral-500"
      >
        {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>
      <CopyButton text={value} />
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}> = ({ title, value, change, changeType = 'neutral', icon }) => (
  <Card className="p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change && (
          <p
            className={`text-xs mt-1 ${
              changeType === 'positive'
                ? 'text-green-600'
                : changeType === 'negative'
                ? 'text-red-600'
                : 'text-neutral-500'
            }`}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
        {icon}
      </div>
    </div>
  </Card>
);

// API Keys Tab Component
const ApiKeysTab: React.FC = () => {
  const [keys, setKeys] = useState(mockApiKeys);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  const filteredKeys = useMemo(() => {
    return keys.filter((key) => {
      const matchesSearch =
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.prefix.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || key.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [keys, searchQuery, statusFilter]);

  const handleRevokeKey = (keyId: string) => {
    setKeys(keys.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k)));
  };

  const handleToggleKey = (keyId: string) => {
    setKeys(
      keys.map((k) =>
        k.id === keyId
          ? { ...k, status: k.status === 'active' ? 'inactive' : 'active' }
          : k
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search API keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </Select>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Keys Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>Name / Key</TableCell>
              <TableCell header>Permissions</TableCell>
              <TableCell header>Environment</TableCell>
              <TableCell header>Usage</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Last Used</TableCell>
              <TableCell header className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{key.name}</p>
                    <MaskedValue value={key.key} showFirst={12} showLast={4} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {key.permissions.slice(0, 2).map((perm) => (
                      <Badge key={perm} variant="neutral" size="xs">
                        {perm}
                      </Badge>
                    ))}
                    {key.permissions.length > 2 && (
                      <Badge variant="neutral" size="xs">
                        +{key.permissions.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      key.environment === 'production'
                        ? 'error'
                        : key.environment === 'staging'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {key.environment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="text-neutral-900 dark:text-white font-medium">
                      {key.usageCount.toLocaleString()}
                    </p>
                    <p className="text-neutral-500 text-xs">
                      {key.rateLimit} req/min
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={key.status} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-neutral-500">
                    {key.lastUsed
                      ? new Date(key.lastUsed).toLocaleDateString()
                      : 'Never'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip content={key.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleToggleKey(key.id)}
                        disabled={key.status === 'revoked' || key.status === 'expired'}
                      >
                        {key.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip content="View Details">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setSelectedKey(key)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Revoke Key">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={key.status === 'revoked'}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create API Key Modal */}
      <CreateApiKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(newKey) => {
          setKeys([newKey, ...keys]);
          setShowCreateModal(false);
        }}
      />

      {/* Key Details Modal */}
      {selectedKey && (
        <ApiKeyDetailsModal
          apiKey={selectedKey}
          isOpen={!!selectedKey}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
};

// Create API Key Modal
const CreateApiKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (key: ApiKey) => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('development');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [rateLimit, setRateLimit] = useState('1000');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [ipWhitelist, setIpWhitelist] = useState('');

  const availablePermissions = [
    'read:content',
    'write:content',
    'read:users',
    'write:users',
    'read:media',
    'write:media',
    'read:analytics',
    'admin:settings',
  ];

  const handleCreate = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: `rp_${environment === 'production' ? 'live' : 'test'}_sk_${Math.random().toString(36).substring(2, 34)}`,
      prefix: `rp_${environment === 'production' ? 'live' : 'test'}_sk`,
      permissions,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiresIn === 'never' ? null : new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: null,
      usageCount: 0,
      rateLimit: parseInt(rateLimit),
      ipWhitelist: ipWhitelist.split(',').map((ip) => ip.trim()).filter(Boolean),
      environment,
    };
    onCreated(newKey);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New API Key" size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Key Name
          </label>
          <Input
            placeholder="e.g., Production API Key"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Environment
          </label>
          <Select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as typeof environment)}
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Permissions
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availablePermissions.map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPermissions([...permissions, perm]);
                    } else {
                      setPermissions(permissions.filter((p) => p !== perm));
                    }
                  }}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">{perm}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Rate Limit (req/min)
            </label>
            <Input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Expires In
            </label>
            <Select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}>
              <option value="never">Never</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            IP Whitelist (comma-separated, optional)
          </label>
          <Input
            placeholder="e.g., 192.168.1.0/24, 10.0.0.0/8"
            value={ipWhitelist}
            onChange={(e) => setIpWhitelist(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || permissions.length === 0}>
            Create API Key
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// API Key Details Modal
const ApiKeyDetailsModal: React.FC<{
  apiKey: ApiKey;
  isOpen: boolean;
  onClose: () => void;
}> = ({ apiKey, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Key Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {apiKey.name}
            </h3>
            <p className="text-sm text-neutral-500">
              Created on {new Date(apiKey.createdAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={apiKey.status} />
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <p className="text-sm text-neutral-500 mb-2">API Key</p>
          <MaskedValue value={apiKey.key} showFirst={12} showLast={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-neutral-500">Environment</p>
            <Badge
              variant={
                apiKey.environment === 'production'
                  ? 'error'
                  : apiKey.environment === 'staging'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {apiKey.environment}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Rate Limit</p>
            <p className="font-medium">{apiKey.rateLimit} req/min</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Usage</p>
            <p className="font-medium">{apiKey.usageCount.toLocaleString()} requests</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Last Used</p>
            <p className="font-medium">
              {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-neutral-500 mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {apiKey.permissions.map((perm) => (
              <Badge key={perm} variant="neutral">
                {perm}
              </Badge>
            ))}
          </div>
        </div>

        {apiKey.ipWhitelist.length > 0 && (
          <div>
            <p className="text-sm text-neutral-500 mb-2">IP Whitelist</p>
            <div className="flex flex-wrap gap-2">
              {apiKey.ipWhitelist.map((ip) => (
                <Badge key={ip} variant="neutral">
                  {ip}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Secrets Vault Tab Component
const SecretsVaultTab: React.FC = () => {
  const [secrets, setSecrets] = useState(mockSecrets);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredSecrets = useMemo(() => {
    return secrets.filter((secret) => {
      const matchesSearch =
        secret.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        secret.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || secret.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [secrets, searchQuery, categoryFilter]);

  const categoryIcons: Record<string, React.ReactNode> = {
    database: <Database className="w-4 h-4" />,
    'external-api': <Globe className="w-4 h-4" />,
    encryption: <Lock className="w-4 h-4" />,
    oauth: <Users className="w-4 h-4" />,
    webhook: <Webhook className="w-4 h-4" />,
    other: <Key className="w-4 h-4" />,
  };

  const handleRotateSecret = (secretId: string) => {
    setSecrets(
      secrets.map((s) =>
        s.id === secretId
          ? { ...s, lastRotated: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert variant="warning">
        <Shield className="w-5 h-5" />
        <div>
          <p className="font-medium">Secrets are encrypted at rest</p>
          <p className="text-sm">
            All secrets are encrypted using AES-256 encryption. Only authorized users can view or
            modify these values.
          </p>
        </div>
      </Alert>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">All Categories</option>
            <option value="database">Database</option>
            <option value="external-api">External API</option>
            <option value="encryption">Encryption</option>
            <option value="oauth">OAuth</option>
            <option value="webhook">Webhook</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
      </div>

      {/* Secrets Grid */}
      <div className="grid gap-4">
        {filteredSecrets.map((secret) => (
          <Card key={secret.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  {categoryIcons[secret.category]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono font-semibold text-neutral-900 dark:text-white">
                      {secret.name}
                    </h4>
                    <Badge
                      variant={
                        secret.environment === 'production'
                          ? 'error'
                          : secret.environment === 'all'
                          ? 'primary'
                          : 'neutral'
                      }
                      size="xs"
                    >
                      {secret.environment}
                    </Badge>
                    {secret.isEncrypted && (
                      <Lock className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">{secret.description}</p>
                  <div className="mt-3">
                    <MaskedValue value={secret.value} showFirst={6} showLast={4} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content="Rotate Secret">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRotateSecret(secret.id)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Edit">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <span>Created by {secret.createdBy}</span>
                <span>Updated {new Date(secret.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>
                  Rotation: {secret.rotationPolicy === 'manual' ? 'Manual' : `Every ${secret.rotationPolicy}`}
                </span>
                {secret.lastRotated && (
                  <span className="text-neutral-400">
                    (Last: {new Date(secret.lastRotated).toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Secret Modal */}
      <CreateSecretModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(newSecret) => {
          setSecrets([newSecret, ...secrets]);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

// Create Secret Modal
const CreateSecretModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreated: (secret: ApiSecret) => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<ApiSecret['category']>('other');
  const [environment, setEnvironment] = useState<ApiSecret['environment']>('all');
  const [rotationPolicy, setRotationPolicy] = useState<ApiSecret['rotationPolicy']>('manual');

  const handleCreate = () => {
    const newSecret: ApiSecret = {
      id: Date.now().toString(),
      name: name.toUpperCase().replace(/\s+/g, '_'),
      description,
      value,
      category,
      environment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin@rustpress.dev',
      isEncrypted: true,
      rotationPolicy,
      lastRotated: null,
    };
    onCreated(newSecret);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Secret" size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Secret Name
          </label>
          <Input
            placeholder="e.g., DATABASE_URL"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Will be converted to uppercase with underscores
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <Input
            placeholder="Brief description of this secret"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Secret Value
          </label>
          <Input
            type="password"
            placeholder="Enter secret value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Category
            </label>
            <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              <option value="database">Database</option>
              <option value="external-api">External API</option>
              <option value="encryption">Encryption</option>
              <option value="oauth">OAuth</option>
              <option value="webhook">Webhook</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Environment
            </label>
            <Select value={environment} onChange={(e) => setEnvironment(e.target.value as typeof environment)}>
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Rotation Policy
            </label>
            <Select value={rotationPolicy} onChange={(e) => setRotationPolicy(e.target.value as typeof rotationPolicy)}>
              <option value="manual">Manual</option>
              <option value="30-days">Every 30 days</option>
              <option value="60-days">Every 60 days</option>
              <option value="90-days">Every 90 days</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || !value}>
            Add Secret
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Webhooks Tab Component
const WebhooksTab: React.FC = () => {
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(
      webhooks.map((w) =>
        w.id === webhookId
          ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
          : w
      )
    );
  };

  const availableEvents = [
    'post.created',
    'post.updated',
    'post.deleted',
    'post.published',
    'user.created',
    'user.updated',
    'user.deleted',
    'user.verified',
    'media.uploaded',
    'media.deleted',
    'comment.created',
    'comment.approved',
    'analytics.pageview',
    'analytics.event',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-neutral-500">
            Webhooks allow you to receive real-time notifications when events occur in your RustPress instance.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    webhook.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : webhook.status === 'failing'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  }`}
                >
                  <Webhook
                    className={`w-5 h-5 ${
                      webhook.status === 'active'
                        ? 'text-green-600'
                        : webhook.status === 'failing'
                        ? 'text-red-600'
                        : 'text-neutral-500'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      {webhook.name}
                    </h4>
                    <StatusBadge status={webhook.status} />
                  </div>
                  <a
                    href={webhook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    {webhook.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="neutral" size="xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={webhook.status === 'active'}
                  onChange={() => handleToggleWebhook(webhook.id)}
                />
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-neutral-500">Total Deliveries</p>
                <p className="font-semibold">{webhook.totalDeliveries.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Success Rate</p>
                <p
                  className={`font-semibold ${
                    webhook.successRate >= 95
                      ? 'text-green-600'
                      : webhook.successRate >= 80
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {webhook.successRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Last Triggered</p>
                <p className="font-semibold">
                  {webhook.lastTriggered
                    ? new Date(webhook.lastTriggered).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Webhook Secret</p>
                <MaskedValue value={webhook.secret} showFirst={6} showLast={4} />
              </div>
            </div>

            {/* Warning for failing webhooks */}
            {webhook.status === 'failing' && (
              <Alert variant="error" className="mt-4">
                <AlertTriangle className="w-4 h-4" />
                <div>
                  <p className="font-medium">Webhook is failing</p>
                  <p className="text-sm">
                    This webhook has been experiencing delivery failures. Please check the endpoint
                    URL and ensure it's accessible.
                  </p>
                </div>
              </Alert>
            )}
          </Card>
        ))}
      </div>

      {/* Create Webhook Modal */}
      <CreateWebhookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        availableEvents={availableEvents}
        onCreated={(newWebhook) => {
          setWebhooks([newWebhook, ...webhooks]);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

// Create Webhook Modal
const CreateWebhookModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  availableEvents: string[];
  onCreated: (webhook: WebhookEndpoint) => void;
}> = ({ isOpen, onClose, availableEvents, onCreated }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);

  const handleCreate = () => {
    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name,
      url,
      events,
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substring(2, 34)}`,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      successRate: 100,
      totalDeliveries: 0,
    };
    onCreated(newWebhook);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Webhook" size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Webhook Name
          </label>
          <Input
            placeholder="e.g., Content Updates"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Endpoint URL
          </label>
          <Input
            placeholder="https://api.example.com/webhooks"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Events to Subscribe
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {availableEvents.map((event) => (
              <label
                key={event}
                className="flex items-center gap-2 p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEvents([...events, event]);
                    } else {
                      setEvents(events.filter((ev) => ev !== event));
                    }
                  }}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm font-mono">{event}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || !url || events.length === 0}>
            Create Webhook
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    rateLimiting: {
      enabled: true,
      globalLimit: 10000,
      perKeyLimit: 1000,
      windowSize: 60,
    },
    cors: {
      enabled: true,
      allowedOrigins: ['https://example.com', 'https://app.example.com'],
      allowCredentials: true,
      maxAge: 86400,
    },
    authentication: {
      jwtExpiry: 3600,
      refreshTokenExpiry: 604800,
      requireApiKey: true,
      allowPublicAccess: false,
    },
    versioning: {
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2-beta'],
      deprecatedVersions: ['v0'],
    },
    logging: {
      enabled: true,
      logLevel: 'info',
      retentionDays: 30,
      includeRequestBody: false,
      includeResponseBody: false,
    },
  });

  const [newOrigin, setNewOrigin] = useState('');

  const handleAddOrigin = () => {
    if (newOrigin && !settings.cors.allowedOrigins.includes(newOrigin)) {
      setSettings({
        ...settings,
        cors: {
          ...settings.cors,
          allowedOrigins: [...settings.cors.allowedOrigins, newOrigin],
        },
      });
      setNewOrigin('');
    }
  };

  const handleRemoveOrigin = (origin: string) => {
    setSettings({
      ...settings,
      cors: {
        ...settings.cors,
        allowedOrigins: settings.cors.allowedOrigins.filter((o) => o !== origin),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Rate Limiting */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Rate Limiting</h3>
              <p className="text-sm text-neutral-500">Control API request rates</p>
            </div>
          </div>
          <Switch
            checked={settings.rateLimiting.enabled}
            onChange={(checked) =>
              setSettings({
                ...settings,
                rateLimiting: { ...settings.rateLimiting, enabled: checked },
              })
            }
          />
        </div>
        {settings.rateLimiting.enabled && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Global Limit (req/min)</label>
              <Input
                type="number"
                value={settings.rateLimiting.globalLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimiting: {
                      ...settings.rateLimiting,
                      globalLimit: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Per-Key Limit (req/min)</label>
              <Input
                type="number"
                value={settings.rateLimiting.perKeyLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimiting: {
                      ...settings.rateLimiting,
                      perKeyLimit: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Window Size (seconds)</label>
              <Input
                type="number"
                value={settings.rateLimiting.windowSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimiting: {
                      ...settings.rateLimiting,
                      windowSize: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </Card>

      {/* CORS Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">CORS Configuration</h3>
              <p className="text-sm text-neutral-500">Cross-Origin Resource Sharing settings</p>
            </div>
          </div>
          <Switch
            checked={settings.cors.enabled}
            onChange={(checked) =>
              setSettings({
                ...settings,
                cors: { ...settings.cors, enabled: checked },
              })
            }
          />
        </div>
        {settings.cors.enabled && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-2">Allowed Origins</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="https://example.com"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddOrigin}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.cors.allowedOrigins.map((origin) => (
                  <Badge key={origin} variant="neutral" className="flex items-center gap-1">
                    {origin}
                    <button
                      onClick={() => handleRemoveOrigin(origin)}
                      className="ml-1 hover:text-red-500"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Allow Credentials
                </span>
                <Switch
                  checked={settings.cors.allowCredentials}
                  onChange={(checked) =>
                    setSettings({
                      ...settings,
                      cors: { ...settings.cors, allowCredentials: checked },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Max Age (seconds)</label>
                <Input
                  type="number"
                  value={settings.cors.maxAge}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cors: { ...settings.cors, maxAge: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Authentication */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">Authentication</h3>
            <p className="text-sm text-neutral-500">API authentication settings</p>
          </div>
        </div>
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">JWT Expiry (seconds)</label>
              <Input
                type="number"
                value={settings.authentication.jwtExpiry}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    authentication: {
                      ...settings.authentication,
                      jwtExpiry: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">
                Refresh Token Expiry (seconds)
              </label>
              <Input
                type="number"
                value={settings.authentication.refreshTokenExpiry}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    authentication: {
                      ...settings.authentication,
                      refreshTokenExpiry: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Require API Key
              </p>
              <p className="text-xs text-neutral-500">All requests must include a valid API key</p>
            </div>
            <Switch
              checked={settings.authentication.requireApiKey}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  authentication: { ...settings.authentication, requireApiKey: checked },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Allow Public Access
              </p>
              <p className="text-xs text-neutral-500">
                Some endpoints can be accessed without authentication
              </p>
            </div>
            <Switch
              checked={settings.authentication.allowPublicAccess}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  authentication: { ...settings.authentication, allowPublicAccess: checked },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* API Versioning */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Code className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">API Versioning</h3>
            <p className="text-sm text-neutral-500">Manage API versions</p>
          </div>
        </div>
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-1">Default Version</label>
            <Select
              value={settings.versioning.defaultVersion}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  versioning: { ...settings.versioning, defaultVersion: e.target.value },
                })
              }
            >
              {settings.versioning.supportedVersions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">Supported Versions</label>
            <div className="flex flex-wrap gap-2">
              {settings.versioning.supportedVersions.map((version) => (
                <Badge key={version} variant="success">
                  {version}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">Deprecated Versions</label>
            <div className="flex flex-wrap gap-2">
              {settings.versioning.deprecatedVersions.map((version) => (
                <Badge key={version} variant="warning">
                  {version}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Logging */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">API Logging</h3>
              <p className="text-sm text-neutral-500">Request and response logging</p>
            </div>
          </div>
          <Switch
            checked={settings.logging.enabled}
            onChange={(checked) =>
              setSettings({
                ...settings,
                logging: { ...settings.logging, enabled: checked },
              })
            }
          />
        </div>
        {settings.logging.enabled && (
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Log Level</label>
                <Select
                  value={settings.logging.logLevel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logging: { ...settings.logging, logLevel: e.target.value },
                    })
                  }
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Retention (days)</label>
                <Input
                  type="number"
                  value={settings.logging.retentionDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logging: { ...settings.logging, retentionDays: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Include Request Body
                </p>
                <p className="text-xs text-neutral-500">Log full request payloads (may contain sensitive data)</p>
              </div>
              <Switch
                checked={settings.logging.includeRequestBody}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    logging: { ...settings.logging, includeRequestBody: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Include Response Body
                </p>
                <p className="text-xs text-neutral-500">Log full response payloads</p>
              </div>
              <Switch
                checked={settings.logging.includeResponseBody}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    logging: { ...settings.logging, includeResponseBody: checked },
                  })
                }
              />
            </div>
          </div>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// Main Component
export function ApiManagement() {
  const [activeTab, setActiveTab] = useState('keys');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="API Management"
        description="Manage API keys, secrets, webhooks, and configuration"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              API Docs
            </Button>
            <Button variant="outline">
              <Terminal className="w-4 h-4 mr-2" />
              API Console
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests (30d)"
          value={mockUsageStats.totalRequests}
          change="+12.5% vs last month"
          changeType="positive"
          icon={<Activity className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Success Rate"
          value={`${((mockUsageStats.successfulRequests / mockUsageStats.totalRequests) * 100).toFixed(2)}%`}
          change="99.44% successful"
          changeType="positive"
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Avg Response Time"
          value={`${mockUsageStats.avgResponseTime}ms`}
          change="-5ms vs last week"
          changeType="positive"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
        />
        <StatCard
          title="Peak RPM"
          value={mockUsageStats.peakRpm}
          change="Within limits"
          changeType="neutral"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="keys" icon={<Key className="w-4 h-4" />}>
            API Keys
          </Tab>
          <Tab value="secrets" icon={<Lock className="w-4 h-4" />}>
            Secrets Vault
          </Tab>
          <Tab value="webhooks" icon={<Webhook className="w-4 h-4" />}>
            Webhooks
          </Tab>
          <Tab value="settings" icon={<Settings className="w-4 h-4" />}>
            Settings
          </Tab>
        </Tabs>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={fadeInUp}>
        <AnimatePresence mode="wait">
          {activeTab === 'keys' && <ApiKeysTab />}
          {activeTab === 'secrets' && <SecretsVaultTab />}
          {activeTab === 'webhooks' && <WebhooksTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default ApiManagement;
