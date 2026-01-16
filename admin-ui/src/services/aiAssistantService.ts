/**
 * AI Assistant Service
 * Handles AI-powered coding assistance: chat, code generation, explanations
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: AICodeBlock[];
  isStreaming?: boolean;
}

export interface AICodeBlock {
  id: string;
  language: string;
  code: string;
  file?: string;
  startLine?: number;
  endLine?: number;
  action?: 'insert' | 'replace' | 'suggest';
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: AIContext;
}

export interface AIContext {
  file?: string;
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  selectedCode?: string;
  language?: string;
  symbols?: string[];
}

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  codeContext: boolean;
  autoSuggest: boolean;
}

export interface AICompletion {
  id: string;
  text: string;
  confidence: number;
  insertText: string;
  range?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface AICodeAction {
  id: string;
  title: string;
  description: string;
  kind: 'quickfix' | 'refactor' | 'explain' | 'generate' | 'optimize';
  code?: string;
}

// ============================================
// API FUNCTIONS - CONVERSATIONS
// ============================================

/**
 * Get all conversations
 */
export async function getConversations(): Promise<AIConversation[]> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations`);
    if (!response.ok) throw new Error('Failed to get conversations');
    return await response.json();
  } catch (error) {
    console.error('Error getting conversations:', error);
    return getMockConversations();
  }
}

/**
 * Get a specific conversation
 */
export async function getConversation(id: string): Promise<AIConversation | null> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${id}`);
    if (!response.ok) throw new Error('Failed to get conversation');
    return await response.json();
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(title?: string): Promise<AIConversation> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return await response.json();
  } catch (error) {
    console.error('Error creating conversation:', error);
    return {
      id: `conv-${Date.now()}`,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return true;
  }
}

/**
 * Rename a conversation
 */
export async function renameConversation(id: string, title: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error renaming conversation:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - MESSAGES
// ============================================

/**
 * Send a message to the AI
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  context?: AIContext
): Promise<AIMessage> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, context }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return getMockAIResponse(content, context);
  }
}

/**
 * Stream a message response (for real-time output)
 */
export async function streamMessage(
  conversationId: string,
  content: string,
  context?: AIContext,
  onChunk?: (chunk: string) => void
): Promise<AIMessage> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${conversationId}/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, context }),
    });

    if (!response.ok) throw new Error('Failed to stream message');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullContent += chunk;
      onChunk?.(chunk);
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error streaming message:', error);
    return getMockAIResponse(content, context);
  }
}

/**
 * Cancel a streaming response
 */
export async function cancelStream(conversationId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ai/conversations/${conversationId}/cancel`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error cancelling stream:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - CODE ACTIONS
// ============================================

/**
 * Get AI code completions
 */
export async function getCompletions(
  file: string,
  content: string,
  position: { line: number; column: number }
): Promise<AICompletion[]> {
  try {
    const response = await fetch(`${API_BASE}/ai/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content, position }),
    });
    if (!response.ok) throw new Error('Failed to get completions');
    return await response.json();
  } catch (error) {
    console.error('Error getting completions:', error);
    return [];
  }
}

/**
 * Explain selected code
 */
export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    if (!response.ok) throw new Error('Failed to explain code');
    const data = await response.json();
    return data.explanation;
  } catch (error) {
    console.error('Error explaining code:', error);
    return getMockCodeExplanation(code, language);
  }
}

/**
 * Generate code from description
 */
export async function generateCode(
  description: string,
  language: string,
  context?: string
): Promise<AICodeBlock> {
  try {
    const response = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, language, context }),
    });
    if (!response.ok) throw new Error('Failed to generate code');
    return await response.json();
  } catch (error) {
    console.error('Error generating code:', error);
    return getMockGeneratedCode(description, language);
  }
}

/**
 * Refactor selected code
 */
export async function refactorCode(
  code: string,
  language: string,
  instruction: string
): Promise<AICodeBlock> {
  try {
    const response = await fetch(`${API_BASE}/ai/refactor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, instruction }),
    });
    if (!response.ok) throw new Error('Failed to refactor code');
    return await response.json();
  } catch (error) {
    console.error('Error refactoring code:', error);
    return {
      id: `refactor-${Date.now()}`,
      language,
      code: code,
      action: 'suggest',
    };
  }
}

/**
 * Fix code issues
 */
export async function fixCode(
  code: string,
  language: string,
  error?: string
): Promise<AICodeBlock> {
  try {
    const response = await fetch(`${API_BASE}/ai/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, error }),
    });
    if (!response.ok) throw new Error('Failed to fix code');
    return await response.json();
  } catch (error) {
    console.error('Error fixing code:', error);
    return {
      id: `fix-${Date.now()}`,
      language,
      code: code,
      action: 'suggest',
    };
  }
}

/**
 * Get code actions for selection
 */
export async function getCodeActions(
  code: string,
  language: string,
  context?: AIContext
): Promise<AICodeAction[]> {
  try {
    const response = await fetch(`${API_BASE}/ai/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, context }),
    });
    if (!response.ok) throw new Error('Failed to get code actions');
    return await response.json();
  } catch (error) {
    console.error('Error getting code actions:', error);
    return getMockCodeActions();
  }
}

/**
 * Generate documentation for code
 */
export async function generateDocumentation(
  code: string,
  language: string,
  style?: 'jsdoc' | 'tsdoc' | 'rustdoc' | 'markdown'
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/ai/document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, style }),
    });
    if (!response.ok) throw new Error('Failed to generate documentation');
    const data = await response.json();
    return data.documentation;
  } catch (error) {
    console.error('Error generating documentation:', error);
    return '/** Generated documentation */';
  }
}

/**
 * Generate tests for code
 */
export async function generateTests(
  code: string,
  language: string,
  framework?: string
): Promise<AICodeBlock> {
  try {
    const response = await fetch(`${API_BASE}/ai/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, framework }),
    });
    if (!response.ok) throw new Error('Failed to generate tests');
    return await response.json();
  } catch (error) {
    console.error('Error generating tests:', error);
    return getMockGeneratedTests(code, language);
  }
}

// ============================================
// API FUNCTIONS - SETTINGS
// ============================================

/**
 * Get AI settings
 */
export async function getSettings(): Promise<AISettings> {
  try {
    const response = await fetch(`${API_BASE}/ai/settings`);
    if (!response.ok) throw new Error('Failed to get settings');
    return await response.json();
  } catch (error) {
    console.error('Error getting AI settings:', error);
    return {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
      codeContext: true,
      autoSuggest: true,
    };
  }
}

/**
 * Update AI settings
 */
export async function updateSettings(settings: Partial<AISettings>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ai/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return true;
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockConversations(): AIConversation[] {
  return [
    {
      id: 'conv-1',
      title: 'Help with React hooks',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'How do I use useEffect properly?',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'useEffect is a React hook for handling side effects...',
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3500000),
    },
    {
      id: 'conv-2',
      title: 'TypeScript generics',
      messages: [],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
    },
  ];
}

function getMockAIResponse(userMessage: string, context?: AIContext): AIMessage {
  const responses: Record<string, string> = {
    'explain': `I'll explain this code for you:\n\nThis code defines a function that handles user interactions. It uses modern JavaScript features like arrow functions and async/await for cleaner syntax.\n\nKey points:\n1. The function is asynchronous\n2. It validates input before processing\n3. Error handling is implemented with try/catch`,
    'generate': `Here's the generated code:\n\n\`\`\`typescript\nexport function processData(items: Item[]): ProcessedItem[] {\n  return items\n    .filter(item => item.active)\n    .map(item => ({\n      ...item,\n      processed: true,\n      timestamp: new Date()\n    }));\n}\n\`\`\``,
    'fix': `I found the issue! The error occurs because you're trying to access a property on a potentially undefined value.\n\nHere's the fix:\n\n\`\`\`typescript\nconst value = obj?.property ?? defaultValue;\n\`\`\``,
    'default': `I understand you're asking about ${userMessage.substring(0, 50)}...\n\nLet me help you with that. Based on the context${context?.file ? ` in ${context.file}` : ''}, here's my suggestion:\n\n1. First, ensure your setup is correct\n2. Then, implement the solution step by step\n3. Finally, test thoroughly\n\nWould you like me to elaborate on any of these points?`,
  };

  const messageType = userMessage.toLowerCase().includes('explain') ? 'explain'
    : userMessage.toLowerCase().includes('generate') ? 'generate'
    : userMessage.toLowerCase().includes('fix') ? 'fix'
    : 'default';

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: responses[messageType],
    timestamp: new Date(),
    codeBlocks: messageType === 'generate' ? [{
      id: `code-${Date.now()}`,
      language: 'typescript',
      code: `export function processData(items: Item[]): ProcessedItem[] {\n  return items\n    .filter(item => item.active)\n    .map(item => ({\n      ...item,\n      processed: true,\n      timestamp: new Date()\n    }));\n}`,
      action: 'suggest',
    }] : undefined,
  };
}

function getMockCodeExplanation(code: string, language: string): string {
  return `This ${language} code performs the following operations:\n\n1. **Purpose**: The code defines functionality for processing data\n2. **Key Components**:\n   - Input validation\n   - Data transformation\n   - Error handling\n3. **Best Practices Used**:\n   - Type safety\n   - Clean code principles\n   - Proper error handling`;
}

function getMockGeneratedCode(description: string, language: string): AICodeBlock {
  const templates: Record<string, string> = {
    typescript: `// Generated code for: ${description}\n\nexport function generatedFunction() {\n  // Implementation here\n  return null;\n}`,
    javascript: `// Generated code for: ${description}\n\nfunction generatedFunction() {\n  // Implementation here\n  return null;\n}`,
    rust: `// Generated code for: ${description}\n\npub fn generated_function() {\n    // Implementation here\n}`,
    default: `// Generated code for: ${description}\n// Language: ${language}`,
  };

  return {
    id: `gen-${Date.now()}`,
    language,
    code: templates[language] || templates.default,
    action: 'insert',
  };
}

function getMockGeneratedTests(code: string, language: string): AICodeBlock {
  return {
    id: `test-${Date.now()}`,
    language,
    code: `describe('Generated Tests', () => {\n  test('should work correctly', () => {\n    // Test implementation\n    expect(true).toBe(true);\n  });\n\n  test('should handle edge cases', () => {\n    // Edge case tests\n    expect(null).toBeNull();\n  });\n});`,
    action: 'insert',
  };
}

function getMockCodeActions(): AICodeAction[] {
  return [
    { id: 'action-1', title: 'Explain Code', description: 'Get an explanation of what this code does', kind: 'explain' },
    { id: 'action-2', title: 'Refactor', description: 'Improve code structure and readability', kind: 'refactor' },
    { id: 'action-3', title: 'Generate Tests', description: 'Create unit tests for this code', kind: 'generate' },
    { id: 'action-4', title: 'Optimize', description: 'Improve performance of this code', kind: 'optimize' },
    { id: 'action-5', title: 'Fix Issues', description: 'Identify and fix potential issues', kind: 'quickfix' },
  ];
}

export default {
  // Conversations
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  renameConversation,
  // Messages
  sendMessage,
  streamMessage,
  cancelStream,
  // Code Actions
  getCompletions,
  explainCode,
  generateCode,
  refactorCode,
  fixCode,
  getCodeActions,
  generateDocumentation,
  generateTests,
  // Settings
  getSettings,
  updateSettings,
};
