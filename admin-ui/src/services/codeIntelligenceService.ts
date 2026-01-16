/**
 * Code Intelligence Service
 * Handles code analysis: references, definitions, call hierarchy, type hierarchy, symbols
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface SymbolInfo {
  name: string;
  kind: SymbolKind;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  containerName?: string;
  detail?: string;
}

export type SymbolKind =
  | 'file' | 'module' | 'namespace' | 'package'
  | 'class' | 'method' | 'property' | 'field'
  | 'constructor' | 'enum' | 'interface' | 'function'
  | 'variable' | 'constant' | 'string' | 'number'
  | 'boolean' | 'array' | 'object' | 'key'
  | 'null' | 'enummember' | 'struct' | 'event'
  | 'operator' | 'typeparameter';

export interface Definition {
  file: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  preview: string;
  kind: SymbolKind;
  containerName?: string;
}

export interface Reference {
  id: string;
  file: string;
  line: number;
  column: number;
  endColumn: number;
  preview: string;
  isDeclaration: boolean;
  isWrite: boolean;
}

export interface ReferenceGroup {
  file: string;
  references: Reference[];
  count: number;
}

export interface CallHierarchyItem {
  id: string;
  name: string;
  kind: SymbolKind;
  file: string;
  line: number;
  column: number;
  detail?: string;
  data?: unknown;
}

export interface CallHierarchyIncoming {
  from: CallHierarchyItem;
  fromRanges: { line: number; column: number }[];
}

export interface CallHierarchyOutgoing {
  to: CallHierarchyItem;
  fromRanges: { line: number; column: number }[];
}

export interface TypeHierarchyItem {
  id: string;
  name: string;
  kind: SymbolKind;
  file: string;
  line: number;
  column: number;
  detail?: string;
  data?: unknown;
}

export interface CodeLensItem {
  id: string;
  file: string;
  line: number;
  title: string;
  command: string;
  arguments?: unknown[];
  tooltip?: string;
}

export interface Hover {
  contents: string;
  range?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  language?: string;
}

export interface SignatureHelp {
  signatures: SignatureInfo[];
  activeSignature: number;
  activeParameter: number;
}

export interface SignatureInfo {
  label: string;
  documentation?: string;
  parameters: ParameterInfo[];
}

export interface ParameterInfo {
  label: string;
  documentation?: string;
}

export interface DiagnosticInfo {
  file: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'hint';
  source?: string;
  code?: string | number;
  relatedInformation?: {
    file: string;
    line: number;
    message: string;
  }[];
}

// ============================================
// API FUNCTIONS - DEFINITIONS & REFERENCES
// ============================================

/**
 * Go to definition
 */
export async function getDefinition(
  file: string,
  line: number,
  column: number
): Promise<Definition[]> {
  try {
    const response = await fetch(`${API_BASE}/code/definition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get definition');
    return await response.json();
  } catch (error) {
    console.error('Error getting definition:', error);
    return getMockDefinitions(file, line);
  }
}

/**
 * Go to type definition
 */
export async function getTypeDefinition(
  file: string,
  line: number,
  column: number
): Promise<Definition[]> {
  try {
    const response = await fetch(`${API_BASE}/code/type-definition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get type definition');
    return await response.json();
  } catch (error) {
    console.error('Error getting type definition:', error);
    return getMockDefinitions(file, line);
  }
}

/**
 * Go to implementation
 */
export async function getImplementation(
  file: string,
  line: number,
  column: number
): Promise<Definition[]> {
  try {
    const response = await fetch(`${API_BASE}/code/implementation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get implementation');
    return await response.json();
  } catch (error) {
    console.error('Error getting implementation:', error);
    return getMockDefinitions(file, line);
  }
}

/**
 * Find all references
 */
export async function findReferences(
  file: string,
  line: number,
  column: number,
  includeDeclaration: boolean = true
): Promise<ReferenceGroup[]> {
  try {
    const response = await fetch(`${API_BASE}/code/references`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column, includeDeclaration }),
    });
    if (!response.ok) throw new Error('Failed to find references');
    return await response.json();
  } catch (error) {
    console.error('Error finding references:', error);
    return getMockReferences();
  }
}

/**
 * Rename symbol
 */
export async function renameSymbol(
  file: string,
  line: number,
  column: number,
  newName: string
): Promise<{ file: string; edits: { line: number; column: number; oldText: string; newText: string }[] }[]> {
  try {
    const response = await fetch(`${API_BASE}/code/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column, newName }),
    });
    if (!response.ok) throw new Error('Failed to rename symbol');
    return await response.json();
  } catch (error) {
    console.error('Error renaming symbol:', error);
    return [];
  }
}

// ============================================
// API FUNCTIONS - CALL HIERARCHY
// ============================================

/**
 * Prepare call hierarchy
 */
export async function prepareCallHierarchy(
  file: string,
  line: number,
  column: number
): Promise<CallHierarchyItem[]> {
  try {
    const response = await fetch(`${API_BASE}/code/call-hierarchy/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to prepare call hierarchy');
    return await response.json();
  } catch (error) {
    console.error('Error preparing call hierarchy:', error);
    return getMockCallHierarchyItems();
  }
}

/**
 * Get incoming calls
 */
export async function getIncomingCalls(item: CallHierarchyItem): Promise<CallHierarchyIncoming[]> {
  try {
    const response = await fetch(`${API_BASE}/code/call-hierarchy/incoming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to get incoming calls');
    return await response.json();
  } catch (error) {
    console.error('Error getting incoming calls:', error);
    return getMockIncomingCalls();
  }
}

/**
 * Get outgoing calls
 */
export async function getOutgoingCalls(item: CallHierarchyItem): Promise<CallHierarchyOutgoing[]> {
  try {
    const response = await fetch(`${API_BASE}/code/call-hierarchy/outgoing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to get outgoing calls');
    return await response.json();
  } catch (error) {
    console.error('Error getting outgoing calls:', error);
    return getMockOutgoingCalls();
  }
}

// ============================================
// API FUNCTIONS - TYPE HIERARCHY
// ============================================

/**
 * Prepare type hierarchy
 */
export async function prepareTypeHierarchy(
  file: string,
  line: number,
  column: number
): Promise<TypeHierarchyItem[]> {
  try {
    const response = await fetch(`${API_BASE}/code/type-hierarchy/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to prepare type hierarchy');
    return await response.json();
  } catch (error) {
    console.error('Error preparing type hierarchy:', error);
    return getMockTypeHierarchyItems();
  }
}

/**
 * Get supertypes
 */
export async function getSupertypes(item: TypeHierarchyItem): Promise<TypeHierarchyItem[]> {
  try {
    const response = await fetch(`${API_BASE}/code/type-hierarchy/supertypes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to get supertypes');
    return await response.json();
  } catch (error) {
    console.error('Error getting supertypes:', error);
    return getMockSupertypes();
  }
}

/**
 * Get subtypes
 */
export async function getSubtypes(item: TypeHierarchyItem): Promise<TypeHierarchyItem[]> {
  try {
    const response = await fetch(`${API_BASE}/code/type-hierarchy/subtypes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to get subtypes');
    return await response.json();
  } catch (error) {
    console.error('Error getting subtypes:', error);
    return getMockSubtypes();
  }
}

// ============================================
// API FUNCTIONS - SYMBOLS
// ============================================

/**
 * Get document symbols (outline)
 */
export async function getDocumentSymbols(file: string): Promise<SymbolInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/code/symbols/document?file=${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error('Failed to get document symbols');
    return await response.json();
  } catch (error) {
    console.error('Error getting document symbols:', error);
    return getMockDocumentSymbols();
  }
}

/**
 * Search workspace symbols
 */
export async function searchWorkspaceSymbols(query: string): Promise<SymbolInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/code/symbols/workspace?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search workspace symbols');
    return await response.json();
  } catch (error) {
    console.error('Error searching workspace symbols:', error);
    return getMockWorkspaceSymbols(query);
  }
}

// ============================================
// API FUNCTIONS - CODE LENS & HOVER
// ============================================

/**
 * Get code lenses for a file
 */
export async function getCodeLenses(file: string): Promise<CodeLensItem[]> {
  try {
    const response = await fetch(`${API_BASE}/code/codelens?file=${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error('Failed to get code lenses');
    return await response.json();
  } catch (error) {
    console.error('Error getting code lenses:', error);
    return getMockCodeLenses(file);
  }
}

/**
 * Resolve code lens
 */
export async function resolveCodeLens(codeLens: CodeLensItem): Promise<CodeLensItem> {
  try {
    const response = await fetch(`${API_BASE}/code/codelens/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codeLens),
    });
    if (!response.ok) throw new Error('Failed to resolve code lens');
    return await response.json();
  } catch (error) {
    console.error('Error resolving code lens:', error);
    return codeLens;
  }
}

/**
 * Get hover information
 */
export async function getHover(
  file: string,
  line: number,
  column: number
): Promise<Hover | null> {
  try {
    const response = await fetch(`${API_BASE}/code/hover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get hover');
    return await response.json();
  } catch (error) {
    console.error('Error getting hover:', error);
    return getMockHover();
  }
}

/**
 * Get signature help
 */
export async function getSignatureHelp(
  file: string,
  line: number,
  column: number
): Promise<SignatureHelp | null> {
  try {
    const response = await fetch(`${API_BASE}/code/signature-help`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get signature help');
    return await response.json();
  } catch (error) {
    console.error('Error getting signature help:', error);
    return getMockSignatureHelp();
  }
}

// ============================================
// API FUNCTIONS - DIAGNOSTICS
// ============================================

/**
 * Get diagnostics for a file
 */
export async function getDiagnostics(file: string): Promise<DiagnosticInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/code/diagnostics?file=${encodeURIComponent(file)}`);
    if (!response.ok) throw new Error('Failed to get diagnostics');
    return await response.json();
  } catch (error) {
    console.error('Error getting diagnostics:', error);
    return getMockDiagnostics();
  }
}

/**
 * Get all workspace diagnostics
 */
export async function getWorkspaceDiagnostics(): Promise<{ file: string; diagnostics: DiagnosticInfo[] }[]> {
  try {
    const response = await fetch(`${API_BASE}/code/diagnostics/workspace`);
    if (!response.ok) throw new Error('Failed to get workspace diagnostics');
    return await response.json();
  } catch (error) {
    console.error('Error getting workspace diagnostics:', error);
    return [];
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockDefinitions(file: string, line: number): Definition[] {
  return [{
    file,
    line: Math.max(1, line - 10),
    column: 1,
    endLine: Math.max(1, line - 10),
    endColumn: 20,
    preview: 'function exampleFunction() {',
    kind: 'function',
  }];
}

function getMockReferences(): ReferenceGroup[] {
  return [
    {
      file: 'src/components/App.tsx',
      count: 3,
      references: [
        { id: 'ref-1', file: 'src/components/App.tsx', line: 15, column: 10, endColumn: 20, preview: 'const result = exampleFunction();', isDeclaration: false, isWrite: false },
        { id: 'ref-2', file: 'src/components/App.tsx', line: 28, column: 5, endColumn: 15, preview: 'exampleFunction();', isDeclaration: false, isWrite: false },
        { id: 'ref-3', file: 'src/components/App.tsx', line: 42, column: 12, endColumn: 22, preview: 'return exampleFunction();', isDeclaration: false, isWrite: false },
      ],
    },
    {
      file: 'src/utils/helper.ts',
      count: 2,
      references: [
        { id: 'ref-4', file: 'src/utils/helper.ts', line: 5, column: 1, endColumn: 11, preview: 'export function exampleFunction() {', isDeclaration: true, isWrite: true },
        { id: 'ref-5', file: 'src/utils/helper.ts', line: 20, column: 8, endColumn: 18, preview: 'const x = exampleFunction();', isDeclaration: false, isWrite: false },
      ],
    },
  ];
}

function getMockCallHierarchyItems(): CallHierarchyItem[] {
  return [{
    id: 'ch-1',
    name: 'handleClick',
    kind: 'function',
    file: 'src/components/Button.tsx',
    line: 15,
    column: 10,
    detail: '(event: MouseEvent) => void',
  }];
}

function getMockIncomingCalls(): CallHierarchyIncoming[] {
  return [
    {
      from: { id: 'ch-2', name: 'onClick', kind: 'method', file: 'src/App.tsx', line: 42, column: 5 },
      fromRanges: [{ line: 42, column: 15 }],
    },
    {
      from: { id: 'ch-3', name: 'handleSubmit', kind: 'function', file: 'src/Form.tsx', line: 28, column: 10 },
      fromRanges: [{ line: 30, column: 8 }],
    },
  ];
}

function getMockOutgoingCalls(): CallHierarchyOutgoing[] {
  return [
    {
      to: { id: 'ch-4', name: 'validateInput', kind: 'function', file: 'src/utils/validation.ts', line: 10, column: 5 },
      fromRanges: [{ line: 18, column: 10 }],
    },
    {
      to: { id: 'ch-5', name: 'submitData', kind: 'function', file: 'src/api/submit.ts', line: 5, column: 1 },
      fromRanges: [{ line: 22, column: 5 }],
    },
  ];
}

function getMockTypeHierarchyItems(): TypeHierarchyItem[] {
  return [{
    id: 'th-1',
    name: 'Component',
    kind: 'class',
    file: 'src/components/Base.tsx',
    line: 10,
    column: 5,
    detail: 'class Component<P, S>',
  }];
}

function getMockSupertypes(): TypeHierarchyItem[] {
  return [
    { id: 'th-2', name: 'React.Component', kind: 'class', file: 'node_modules/react/index.d.ts', line: 100, column: 1 },
  ];
}

function getMockSubtypes(): TypeHierarchyItem[] {
  return [
    { id: 'th-3', name: 'Button', kind: 'class', file: 'src/components/Button.tsx', line: 5, column: 1 },
    { id: 'th-4', name: 'Input', kind: 'class', file: 'src/components/Input.tsx', line: 5, column: 1 },
  ];
}

function getMockDocumentSymbols(): SymbolInfo[] {
  return [
    { name: 'App', kind: 'function', file: 'src/App.tsx', line: 5, column: 1, endLine: 50, endColumn: 1 },
    { name: 'handleClick', kind: 'function', file: 'src/App.tsx', line: 10, column: 3, containerName: 'App' },
    { name: 'state', kind: 'variable', file: 'src/App.tsx', line: 6, column: 3, containerName: 'App' },
    { name: 'props', kind: 'variable', file: 'src/App.tsx', line: 7, column: 3, containerName: 'App' },
  ];
}

function getMockWorkspaceSymbols(query: string): SymbolInfo[] {
  const symbols = [
    { name: 'App', kind: 'function' as SymbolKind, file: 'src/App.tsx', line: 5, column: 1 },
    { name: 'Button', kind: 'function' as SymbolKind, file: 'src/components/Button.tsx', line: 5, column: 1 },
    { name: 'handleClick', kind: 'function' as SymbolKind, file: 'src/App.tsx', line: 15, column: 3 },
    { name: 'useState', kind: 'function' as SymbolKind, file: 'src/hooks/useState.ts', line: 1, column: 1 },
  ];
  return symbols.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
}

function getMockCodeLenses(file: string): CodeLensItem[] {
  return [
    { id: 'lens-1', file, line: 5, title: '3 references', command: 'showReferences', tooltip: 'Show all references' },
    { id: 'lens-2', file, line: 15, title: 'Run Test', command: 'runTest', tooltip: 'Run this test' },
    { id: 'lens-3', file, line: 25, title: 'Debug', command: 'debug', tooltip: 'Start debugging' },
  ];
}

function getMockHover(): Hover {
  return {
    contents: '```typescript\nfunction handleClick(event: MouseEvent): void\n```\n\nHandles the click event on the button.',
    language: 'typescript',
    range: { startLine: 15, startColumn: 5, endLine: 15, endColumn: 16 },
  };
}

function getMockSignatureHelp(): SignatureHelp {
  return {
    signatures: [
      {
        label: 'handleClick(event: MouseEvent): void',
        documentation: 'Handles the click event',
        parameters: [
          { label: 'event: MouseEvent', documentation: 'The mouse event object' },
        ],
      },
    ],
    activeSignature: 0,
    activeParameter: 0,
  };
}

function getMockDiagnostics(): DiagnosticInfo[] {
  return [
    {
      file: 'src/App.tsx',
      line: 25,
      column: 10,
      endLine: 25,
      endColumn: 15,
      message: "Property 'name' does not exist on type '{}'",
      severity: 'error',
      source: 'typescript',
      code: 'TS2339',
    },
    {
      file: 'src/App.tsx',
      line: 30,
      column: 5,
      endLine: 30,
      endColumn: 12,
      message: "Variable 'unused' is declared but never used",
      severity: 'warning',
      source: 'typescript',
      code: 'TS6133',
    },
  ];
}

export default {
  // Definitions & References
  getDefinition,
  getTypeDefinition,
  getImplementation,
  findReferences,
  renameSymbol,
  // Call Hierarchy
  prepareCallHierarchy,
  getIncomingCalls,
  getOutgoingCalls,
  // Type Hierarchy
  prepareTypeHierarchy,
  getSupertypes,
  getSubtypes,
  // Symbols
  getDocumentSymbols,
  searchWorkspaceSymbols,
  // Code Lens & Hover
  getCodeLenses,
  resolveCodeLens,
  getHover,
  getSignatureHelp,
  // Diagnostics
  getDiagnostics,
  getWorkspaceDiagnostics,
};
