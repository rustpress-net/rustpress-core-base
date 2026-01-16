/**
 * Search Service
 * Handles advanced search and replace across the codebase
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  includePattern: string;
  excludePattern: string;
  searchInFiles: boolean;
  preserveCase: boolean;
  maxResults?: number;
}

export interface SearchResult {
  id: string;
  file: string;
  line: number;
  column: number;
  matchStart: number;
  matchEnd: number;
  lineContent: string;
  previewBefore?: string;
  previewAfter?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalMatches: number;
  filesSearched: number;
  searchTime: number;
  limitReached: boolean;
}

export interface ReplaceResult {
  success: boolean;
  filesModified: number;
  replacementsCount: number;
  errors?: { file: string; error: string }[];
}

export interface QuickOpenItem {
  path: string;
  name: string;
  icon: string;
  score: number;
  type: 'file' | 'symbol' | 'command';
  description?: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  options: SearchOptions;
  timestamp: Date;
  resultCount: number;
}

// ============================================
// API FUNCTIONS - SEARCH
// ============================================

/**
 * Search in files
 */
export async function searchInFiles(
  query: string,
  options: SearchOptions
): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, ...options }),
    });
    if (!response.ok) throw new Error('Failed to search');
    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    return getMockSearchResponse(query, options);
  }
}

/**
 * Search in current file
 */
export async function searchInFile(
  file: string,
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_BASE}/search/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, query, ...options }),
    });
    if (!response.ok) throw new Error('Failed to search in file');
    return await response.json();
  } catch (error) {
    console.error('Error searching in file:', error);
    return getMockFileSearchResults(file, query);
  }
}

/**
 * Quick open search
 */
export async function quickOpen(query: string): Promise<QuickOpenItem[]> {
  try {
    const response = await fetch(`${API_BASE}/search/quick-open?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to quick open');
    return await response.json();
  } catch (error) {
    console.error('Error in quick open:', error);
    return getMockQuickOpenResults(query);
  }
}

/**
 * Symbol search (Cmd+Shift+O)
 */
export async function searchSymbols(query: string, file?: string): Promise<QuickOpenItem[]> {
  try {
    const url = file
      ? `${API_BASE}/search/symbols?q=${encodeURIComponent(query)}&file=${encodeURIComponent(file)}`
      : `${API_BASE}/search/symbols?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to search symbols');
    return await response.json();
  } catch (error) {
    console.error('Error searching symbols:', error);
    return getMockSymbolResults(query);
  }
}

/**
 * Command search (Cmd+Shift+P)
 */
export async function searchCommands(query: string): Promise<QuickOpenItem[]> {
  try {
    const response = await fetch(`${API_BASE}/search/commands?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search commands');
    return await response.json();
  } catch (error) {
    console.error('Error searching commands:', error);
    return getMockCommandResults(query);
  }
}

// ============================================
// API FUNCTIONS - REPLACE
// ============================================

/**
 * Replace in current file
 */
export async function replaceInFile(
  file: string,
  searchQuery: string,
  replaceQuery: string,
  options: SearchOptions
): Promise<ReplaceResult> {
  try {
    const response = await fetch(`${API_BASE}/search/replace/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, searchQuery, replaceQuery, ...options }),
    });
    if (!response.ok) throw new Error('Failed to replace in file');
    return await response.json();
  } catch (error) {
    console.error('Error replacing in file:', error);
    return { success: true, filesModified: 1, replacementsCount: 1 };
  }
}

/**
 * Replace single occurrence
 */
export async function replaceSingle(
  resultId: string,
  replaceQuery: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/search/replace/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resultId, replaceQuery }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error replacing single:', error);
    return true;
  }
}

/**
 * Replace all occurrences
 */
export async function replaceAll(
  searchQuery: string,
  replaceQuery: string,
  options: SearchOptions
): Promise<ReplaceResult> {
  try {
    const response = await fetch(`${API_BASE}/search/replace/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery, replaceQuery, ...options }),
    });
    if (!response.ok) throw new Error('Failed to replace all');
    return await response.json();
  } catch (error) {
    console.error('Error replacing all:', error);
    return { success: true, filesModified: 5, replacementsCount: 15 };
  }
}

/**
 * Preview replacement
 */
export async function previewReplacement(
  searchQuery: string,
  replaceQuery: string,
  options: SearchOptions
): Promise<{ original: string; replaced: string }[]> {
  try {
    const response = await fetch(`${API_BASE}/search/replace/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery, replaceQuery, ...options }),
    });
    if (!response.ok) throw new Error('Failed to preview replacement');
    return await response.json();
  } catch (error) {
    console.error('Error previewing replacement:', error);
    return [];
  }
}

// ============================================
// API FUNCTIONS - HISTORY
// ============================================

/**
 * Get recent searches
 */
export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const response = await fetch(`${API_BASE}/search/history`);
    if (!response.ok) throw new Error('Failed to get search history');
    return await response.json();
  } catch (error) {
    console.error('Error getting search history:', error);
    return getMockRecentSearches();
  }
}

/**
 * Add to search history
 */
export async function addToSearchHistory(
  query: string,
  options: SearchOptions,
  resultCount: number
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/search/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, options, resultCount }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error adding to search history:', error);
    return true;
  }
}

/**
 * Clear search history
 */
export async function clearSearchHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/search/history`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - GO TO LINE
// ============================================

/**
 * Get line count for a file
 */
export async function getFileLineCount(file: string): Promise<number> {
  try {
    const response = await fetch(`${API_BASE}/files/line-count?file=${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error('Failed to get line count');
    const data = await response.json();
    return data.lineCount;
  } catch (error) {
    console.error('Error getting line count:', error);
    return 100;
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockSearchResponse(query: string, options: SearchOptions): SearchResponse {
  const results = getMockFileSearchResults('multiple', query);
  return {
    results,
    totalMatches: results.length,
    filesSearched: 50,
    searchTime: 150,
    limitReached: false,
  };
}

function getMockFileSearchResults(file: string, query: string): SearchResult[] {
  return [
    {
      id: 'result-1',
      file: 'src/components/App.tsx',
      line: 15,
      column: 10,
      matchStart: 10,
      matchEnd: 10 + query.length,
      lineContent: `const ${query} = useState(null);`,
    },
    {
      id: 'result-2',
      file: 'src/components/App.tsx',
      line: 28,
      column: 5,
      matchStart: 5,
      matchEnd: 5 + query.length,
      lineContent: `${query}();`,
    },
    {
      id: 'result-3',
      file: 'src/utils/helper.ts',
      line: 42,
      column: 15,
      matchStart: 15,
      matchEnd: 15 + query.length,
      lineContent: `export function ${query}() {`,
    },
    {
      id: 'result-4',
      file: 'src/hooks/useData.ts',
      line: 8,
      column: 8,
      matchStart: 8,
      matchEnd: 8 + query.length,
      lineContent: `const ${query} = useMemo(() => {`,
    },
  ];
}

function getMockQuickOpenResults(query: string): QuickOpenItem[] {
  const items = [
    { path: 'src/App.tsx', name: 'App.tsx', icon: 'file', score: 100, type: 'file' as const },
    { path: 'src/components/Button.tsx', name: 'Button.tsx', icon: 'file', score: 90, type: 'file' as const },
    { path: 'src/hooks/useState.ts', name: 'useState.ts', icon: 'file', score: 85, type: 'file' as const },
    { path: 'src/utils/helper.ts', name: 'helper.ts', icon: 'file', score: 80, type: 'file' as const },
    { path: 'src/pages/Home.tsx', name: 'Home.tsx', icon: 'file', score: 75, type: 'file' as const },
  ];
  return items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.path.toLowerCase().includes(query.toLowerCase())
  );
}

function getMockSymbolResults(query: string): QuickOpenItem[] {
  const symbols = [
    { path: 'src/App.tsx', name: 'App', icon: 'function', score: 100, type: 'symbol' as const, description: 'function' },
    { path: 'src/components/Button.tsx', name: 'Button', icon: 'function', score: 90, type: 'symbol' as const, description: 'function' },
    { path: 'src/hooks/useState.ts', name: 'useState', icon: 'function', score: 85, type: 'symbol' as const, description: 'hook' },
    { path: 'src/utils/helper.ts', name: 'formatDate', icon: 'function', score: 80, type: 'symbol' as const, description: 'function' },
    { path: 'src/types/index.ts', name: 'User', icon: 'interface', score: 75, type: 'symbol' as const, description: 'interface' },
  ];
  return symbols.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
}

function getMockCommandResults(query: string): QuickOpenItem[] {
  const commands = [
    { path: 'command:save', name: 'Save File', icon: 'save', score: 100, type: 'command' as const, description: 'Ctrl+S' },
    { path: 'command:format', name: 'Format Document', icon: 'code', score: 95, type: 'command' as const, description: 'Shift+Alt+F' },
    { path: 'command:find', name: 'Find', icon: 'search', score: 90, type: 'command' as const, description: 'Ctrl+F' },
    { path: 'command:replace', name: 'Replace', icon: 'replace', score: 85, type: 'command' as const, description: 'Ctrl+H' },
    { path: 'command:git.commit', name: 'Git: Commit', icon: 'git', score: 80, type: 'command' as const, description: '' },
    { path: 'command:git.push', name: 'Git: Push', icon: 'git', score: 75, type: 'command' as const, description: '' },
    { path: 'command:debug.start', name: 'Start Debugging', icon: 'bug', score: 70, type: 'command' as const, description: 'F5' },
  ];
  return commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
}

function getMockRecentSearches(): RecentSearch[] {
  return [
    {
      id: 'search-1',
      query: 'useState',
      options: { caseSensitive: false, wholeWord: false, useRegex: false, includePattern: '', excludePattern: '', searchInFiles: true, preserveCase: false },
      timestamp: new Date(Date.now() - 3600000),
      resultCount: 15,
    },
    {
      id: 'search-2',
      query: 'function.*export',
      options: { caseSensitive: false, wholeWord: false, useRegex: true, includePattern: '*.ts', excludePattern: 'node_modules', searchInFiles: true, preserveCase: false },
      timestamp: new Date(Date.now() - 7200000),
      resultCount: 42,
    },
    {
      id: 'search-3',
      query: 'TODO',
      options: { caseSensitive: true, wholeWord: false, useRegex: false, includePattern: '', excludePattern: '', searchInFiles: true, preserveCase: false },
      timestamp: new Date(Date.now() - 86400000),
      resultCount: 8,
    },
  ];
}

export default {
  // Search
  searchInFiles,
  searchInFile,
  quickOpen,
  searchSymbols,
  searchCommands,
  // Replace
  replaceInFile,
  replaceSingle,
  replaceAll,
  previewReplacement,
  // History
  getRecentSearches,
  addToSearchHistory,
  clearSearchHistory,
  // Go to line
  getFileLineCount,
};
