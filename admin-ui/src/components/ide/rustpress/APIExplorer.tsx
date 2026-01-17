/**
 * APIExplorer - REST API documentation and testing
 * RustPress-specific API exploration functionality
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Play, Copy, Check, ChevronDown, ChevronRight, Search,
  Lock, Unlock, Clock, AlertCircle, RefreshCw, Code, FileJson,
  Eye, EyeOff, Settings, BookOpen, Zap, Shield, Server
} from 'lucide-react';

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  name: string;
  description: string;
  category: string;
  auth: 'none' | 'api-key' | 'jwt' | 'oauth';
  parameters?: APIParameter[];
  requestBody?: {
    type: string;
    schema: Record<string, any>;
    example?: any;
  };
  responses?: {
    status: number;
    description: string;
    schema?: Record<string, any>;
    example?: any;
  }[];
}

export interface APIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  type: string;
  required: boolean;
  description?: string;
  default?: string;
  enum?: string[];
}

interface APIExplorerProps {
  baseUrl?: string;
  apiKey?: string;
  onExecute?: (endpoint: APIEndpoint, params: Record<string, any>) => void;
}

// Mock API endpoints
const mockEndpoints: APIEndpoint[] = [
  {
    id: '1',
    method: 'GET',
    path: '/api/posts',
    name: 'List Posts',
    description: 'Retrieve a paginated list of all published posts',
    category: 'Posts',
    auth: 'none',
    parameters: [
      { name: 'page', in: 'query', type: 'integer', required: false, description: 'Page number', default: '1' },
      { name: 'per_page', in: 'query', type: 'integer', required: false, description: 'Items per page', default: '10' },
      { name: 'status', in: 'query', type: 'string', required: false, description: 'Filter by status', enum: ['draft', 'published', 'scheduled'] },
      { name: 'category', in: 'query', type: 'string', required: false, description: 'Filter by category slug' }
    ],
    responses: [
      { status: 200, description: 'Successful response', example: { data: [], meta: { total: 0, page: 1, per_page: 10 } } }
    ]
  },
  {
    id: '2',
    method: 'GET',
    path: '/api/posts/{id}',
    name: 'Get Post',
    description: 'Retrieve a single post by ID',
    category: 'Posts',
    auth: 'none',
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Post ID' }
    ],
    responses: [
      { status: 200, description: 'Successful response' },
      { status: 404, description: 'Post not found' }
    ]
  },
  {
    id: '3',
    method: 'POST',
    path: '/api/posts',
    name: 'Create Post',
    description: 'Create a new post',
    category: 'Posts',
    auth: 'jwt',
    requestBody: {
      type: 'application/json',
      schema: {
        title: { type: 'string', required: true },
        content: { type: 'string', required: true },
        status: { type: 'string', enum: ['draft', 'published'] },
        category_id: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      },
      example: { title: 'New Post', content: 'Post content here...', status: 'draft' }
    },
    responses: [
      { status: 201, description: 'Post created' },
      { status: 400, description: 'Validation error' },
      { status: 401, description: 'Unauthorized' }
    ]
  },
  {
    id: '4',
    method: 'PUT',
    path: '/api/posts/{id}',
    name: 'Update Post',
    description: 'Update an existing post',
    category: 'Posts',
    auth: 'jwt',
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Post ID' }
    ],
    requestBody: {
      type: 'application/json',
      schema: {
        title: { type: 'string' },
        content: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'published'] }
      }
    }
  },
  {
    id: '5',
    method: 'DELETE',
    path: '/api/posts/{id}',
    name: 'Delete Post',
    description: 'Delete a post',
    category: 'Posts',
    auth: 'jwt',
    parameters: [
      { name: 'id', in: 'path', type: 'string', required: true, description: 'Post ID' }
    ]
  },
  {
    id: '6',
    method: 'GET',
    path: '/api/users',
    name: 'List Users',
    description: 'Retrieve a list of users',
    category: 'Users',
    auth: 'jwt',
    parameters: [
      { name: 'role', in: 'query', type: 'string', required: false, enum: ['admin', 'editor', 'author', 'subscriber'] }
    ]
  },
  {
    id: '7',
    method: 'GET',
    path: '/api/categories',
    name: 'List Categories',
    description: 'Retrieve all categories',
    category: 'Taxonomy',
    auth: 'none'
  },
  {
    id: '8',
    method: 'POST',
    path: '/api/media/upload',
    name: 'Upload Media',
    description: 'Upload a media file',
    category: 'Media',
    auth: 'jwt',
    requestBody: {
      type: 'multipart/form-data',
      schema: {
        file: { type: 'file', required: true },
        alt: { type: 'string' },
        folder: { type: 'string' }
      }
    }
  },
  {
    id: '9',
    method: 'GET',
    path: '/api/settings',
    name: 'Get Settings',
    description: 'Retrieve site settings',
    category: 'Settings',
    auth: 'api-key'
  },
  {
    id: '10',
    method: 'POST',
    path: '/api/auth/login',
    name: 'Login',
    description: 'Authenticate user and get JWT token',
    category: 'Authentication',
    auth: 'none',
    requestBody: {
      type: 'application/json',
      schema: {
        email: { type: 'string', required: true },
        password: { type: 'string', required: true }
      }
    }
  }
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PATCH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const APIExplorer: React.FC<APIExplorerProps> = ({
  baseUrl = 'https://api.rustpress.dev',
  apiKey,
  onExecute
}) => {
  const [endpoints] = useState<APIEndpoint[]>(mockEndpoints);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Posts']));
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [bodyContent, setBodyContent] = useState('');
  const [showResponse, setShowResponse] = useState(true);
  const [copied, setCopied] = useState(false);

  const categories = [...new Set(endpoints.map(e => e.category))];

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || endpoint.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedEndpoints = categories.reduce((acc, category) => {
    acc[category] = filteredEndpoints.filter(e => e.category === category);
    return acc;
  }, {} as Record<string, APIEndpoint[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleExecute = async () => {
    if (!selectedEndpoint) return;

    setIsExecuting(true);
    const startTime = Date.now();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const endTime = Date.now();
    setResponseTime(endTime - startTime);

    // Mock response
    setResponse({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': 'req_' + Math.random().toString(36).substr(2, 9)
      },
      data: selectedEndpoint.responses?.[0]?.example || {
        message: 'Success',
        data: {}
      }
    });

    setIsExecuting(false);
    setShowResponse(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAuthIcon = (auth: string) => {
    switch (auth) {
      case 'none': return <Unlock className="w-3 h-3 text-green-400" />;
      case 'api-key': return <Shield className="w-3 h-3 text-yellow-400" />;
      case 'jwt': return <Lock className="w-3 h-3 text-orange-400" />;
      case 'oauth': return <Shield className="w-3 h-3 text-purple-400" />;
      default: return <Lock className="w-3 h-3 text-gray-400" />;
    }
  };

  const buildUrl = (endpoint: APIEndpoint) => {
    let url = baseUrl + endpoint.path;
    const queryParams: string[] = [];

    endpoint.parameters?.forEach(param => {
      const value = paramValues[param.name];
      if (value) {
        if (param.in === 'path') {
          url = url.replace(`{${param.name}}`, value);
        } else if (param.in === 'query') {
          queryParams.push(`${param.name}=${encodeURIComponent(value)}`);
        }
      }
    });

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar - Endpoints List */}
      <div className="w-72 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            API Explorer
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search endpoints..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {categories.map(category => {
            const categoryEndpoints = groupedEndpoints[category] || [];
            if (categoryEndpoints.length === 0) return null;
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="border-b border-gray-800/50">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-300 hover:bg-gray-800/50"
                >
                  <span>{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{categoryEndpoints.length}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      {categoryEndpoints.map(endpoint => (
                        <button
                          key={endpoint.id}
                          onClick={() => {
                            setSelectedEndpoint(endpoint);
                            setParamValues({});
                            setBodyContent(endpoint.requestBody?.example ? JSON.stringify(endpoint.requestBody.example, null, 2) : '');
                            setResponse(null);
                          }}
                          className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                            selectedEndpoint?.id === endpoint.id
                              ? 'bg-cyan-900/30 text-white'
                              : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                          }`}
                        >
                          <span className={`px-1.5 py-0.5 text-xs font-mono rounded border ${methodColors[endpoint.method]}`}>
                            {endpoint.method}
                          </span>
                          <span className="truncate flex-1 text-left">{endpoint.name}</span>
                          {getAuthIcon(endpoint.auth)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content - Request/Response */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedEndpoint ? (
          <>
            {/* Endpoint Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 text-sm font-mono rounded border ${methodColors[selectedEndpoint.method]}`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-white font-mono">{selectedEndpoint.path}</code>
                {getAuthIcon(selectedEndpoint.auth)}
                <span className="text-xs text-gray-500 capitalize">{selectedEndpoint.auth} auth</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{selectedEndpoint.name}</h3>
              <p className="text-sm text-gray-400">{selectedEndpoint.description}</p>
            </div>

            {/* Request Builder */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* URL Preview */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase">Request URL</span>
                  <button
                    onClick={() => handleCopy(buildUrl(selectedEndpoint))}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="text-sm text-cyan-400 font-mono break-all">{buildUrl(selectedEndpoint)}</code>
              </div>

              {/* Parameters */}
              {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {selectedEndpoint.parameters.map(param => (
                      <div key={param.name} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-2">
                        <div className="w-32">
                          <span className="text-sm text-white font-mono">{param.name}</span>
                          {param.required && <span className="text-red-400 ml-1">*</span>}
                          <span className="text-xs text-gray-500 block">{param.in} • {param.type}</span>
                        </div>
                        <div className="flex-1">
                          {param.enum ? (
                            <select
                              value={paramValues[param.name] || ''}
                              onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
                            >
                              <option value="">Select...</option>
                              {param.enum.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={paramValues[param.name] || ''}
                              onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                              placeholder={param.default || param.description}
                              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Body */}
              {selectedEndpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Request Body ({selectedEndpoint.requestBody.type})</h4>
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    className="w-full h-40 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-cyan-500"
                    placeholder="Enter request body..."
                  />
                </div>
              )}

              {/* Response */}
              {response && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-300">Response</h4>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${response.status < 400 ? 'text-green-400' : 'text-red-400'}`}>
                        {response.status} {response.status < 400 ? 'OK' : 'Error'}
                      </span>
                      {responseTime && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {responseTime}ms
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(JSON.stringify(response.data, null, 2))}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <pre className="bg-gray-800/50 rounded-lg p-3 text-sm text-green-400 font-mono overflow-auto max-h-60">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <div className="p-4 border-t border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedEndpoint.auth !== 'none' && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    This endpoint requires {selectedEndpoint.auth} authentication
                  </span>
                )}
              </div>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isExecuting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isExecuting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Globe className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select an endpoint</p>
            <p className="text-sm">Choose an endpoint from the sidebar to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIExplorer;
