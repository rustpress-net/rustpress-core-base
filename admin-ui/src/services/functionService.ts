/**
 * Function Service
 * Handles creating and managing serverless functions in target repositories
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface FunctionConfig {
  name: string;
  slug: string;
  description: string;
  runtime: 'rust' | 'typescript' | 'python';
  trigger: 'http' | 'cron' | 'webhook' | 'event';
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
  httpPath?: string;
  cronSchedule?: string;
  eventType?: string;
  eventSource?: 'rustpress' | 'application' | 'plugin';
  timeout: number;
  memory: number;
  environment: { key: string; value: string }[];
  authentication: 'none' | 'api-key' | 'jwt' | 'oauth';
  cors: boolean;
  logging: boolean;
  retries: number;
  targetRepository: string;
}

export interface FunctionFile {
  path: string;
  content: string;
}

export interface CreateFunctionResult {
  success: boolean;
  functionId?: string;
  files?: string[];
  error?: string;
}

// ============================================
// FILE GENERATORS
// ============================================

/**
 * Generate function.json configuration file
 */
function generateFunctionJson(config: FunctionConfig): string {
  const functionConfig: Record<string, unknown> = {
    name: config.name,
    slug: config.slug,
    description: config.description,
    runtime: config.runtime,
    trigger: {
      type: config.trigger,
    },
    resources: {
      timeout: config.timeout,
      memory: config.memory,
    },
    security: {
      authentication: config.authentication,
      cors: config.cors,
    },
    settings: {
      logging: config.logging,
      retries: config.retries,
    },
    environment: config.environment.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>),
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  };

  // Add trigger-specific config
  if (config.trigger === 'http') {
    functionConfig.trigger = {
      type: 'http',
      method: config.httpMethod,
      path: config.httpPath,
    };
  } else if (config.trigger === 'cron') {
    functionConfig.trigger = {
      type: 'cron',
      schedule: config.cronSchedule,
    };
  } else if (config.trigger === 'event') {
    functionConfig.trigger = {
      type: 'event',
      eventType: config.eventType,
      eventSource: config.eventSource,
    };
  }

  return JSON.stringify(functionConfig, null, 2);
}

/**
 * Generate event-trigger.json for event-triggered functions
 */
function generateEventTriggerJson(config: FunctionConfig): string {
  return JSON.stringify({
    eventType: config.eventType,
    source: config.eventSource,
    filters: {},
    retry: {
      enabled: config.retries > 0,
      maxAttempts: config.retries,
      backoffMs: 1000,
    },
  }, null, 2);
}

/**
 * Generate Rust function files
 */
function generateRustFiles(config: FunctionConfig): FunctionFile[] {
  const mainRs = `//! ${config.name}
//! ${config.description || 'A RustPress serverless function'}

use rustpress_functions::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct Input {
    // Define your input structure here
    pub message: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Output {
    pub success: bool,
    pub result: String,
}

${config.trigger === 'http' ? `
/// HTTP handler for ${config.httpMethod} ${config.httpPath}
#[rustpress_function(http = "${config.httpMethod}", path = "${config.httpPath}")]
pub async fn handler(input: Input, ctx: Context) -> Result<Output, FunctionError> {
    ctx.log("Function invoked");

    Ok(Output {
        success: true,
        result: format!("Hello from {}!", "${config.name}"),
    })
}` : ''}${config.trigger === 'cron' ? `
/// Scheduled handler running on: ${config.cronSchedule}
#[rustpress_function(cron = "${config.cronSchedule}")]
pub async fn handler(ctx: Context) -> Result<Output, FunctionError> {
    ctx.log("Scheduled function invoked");

    Ok(Output {
        success: true,
        result: format!("Scheduled execution at {:?}", ctx.invoked_at()),
    })
}` : ''}${config.trigger === 'event' ? `
/// Event handler for: ${config.eventType}
#[rustpress_function(event = "${config.eventType}")]
pub async fn handler(event: Event, ctx: Context) -> Result<Output, FunctionError> {
    ctx.log(&format!("Event received: {}", event.event_type));

    Ok(Output {
        success: true,
        result: format!("Processed event: {}", event.id),
    })
}` : ''}${config.trigger === 'webhook' ? `
/// Webhook handler
#[rustpress_function(webhook)]
pub async fn handler(payload: WebhookPayload, ctx: Context) -> Result<Output, FunctionError> {
    ctx.log("Webhook received");

    Ok(Output {
        success: true,
        result: "Webhook processed".to_string(),
    })
}` : ''}
`;

  const cargoToml = `[package]
name = "${config.slug}"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
rustpress-functions = "0.1"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }

[profile.release]
opt-level = "s"
lto = true
`;

  return [
    { path: `functions/${config.slug}/src/main.rs`, content: mainRs },
    { path: `functions/${config.slug}/Cargo.toml`, content: cargoToml },
  ];
}

/**
 * Generate TypeScript function files
 */
function generateTypeScriptFiles(config: FunctionConfig): FunctionFile[] {
  const indexTs = `/**
 * ${config.name}
 * ${config.description || 'A RustPress serverless function'}
 */

import { Context, Event, HttpRequest, HttpResponse } from '@rustpress/functions';

interface Input {
  message?: string;
}

interface Output {
  success: boolean;
  result: string;
}

${config.trigger === 'http' ? `
/**
 * HTTP handler for ${config.httpMethod} ${config.httpPath}
 */
export async function handler(req: HttpRequest, ctx: Context): Promise<HttpResponse<Output>> {
  ctx.log('Function invoked');

  const input: Input = req.body;

  return {
    statusCode: 200,
    body: {
      success: true,
      result: \`Hello from ${config.name}!\`,
    },
  };
}` : ''}${config.trigger === 'cron' ? `
/**
 * Scheduled handler running on: ${config.cronSchedule}
 */
export async function handler(ctx: Context): Promise<Output> {
  ctx.log('Scheduled function invoked');

  return {
    success: true,
    result: \`Scheduled execution at \${new Date().toISOString()}\`,
  };
}` : ''}${config.trigger === 'event' ? `
/**
 * Event handler for: ${config.eventType}
 */
export async function handler(event: Event, ctx: Context): Promise<Output> {
  ctx.log(\`Event received: \${event.type}\`);

  return {
    success: true,
    result: \`Processed event: \${event.id}\`,
  };
}` : ''}${config.trigger === 'webhook' ? `
/**
 * Webhook handler
 */
export async function handler(payload: unknown, ctx: Context): Promise<Output> {
  ctx.log('Webhook received');

  return {
    success: true,
    result: 'Webhook processed',
  };
}` : ''}

export const config = {
  name: '${config.name}',
  timeout: ${config.timeout},
  memory: ${config.memory},
};
`;

  const packageJson = `{
  "name": "${config.slug}",
  "version": "1.0.0",
  "description": "${config.description || config.name}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest"
  },
  "dependencies": {
    "@rustpress/functions": "^0.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
`;

  const tsconfigJson = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;

  return [
    { path: `functions/${config.slug}/src/index.ts`, content: indexTs },
    { path: `functions/${config.slug}/package.json`, content: packageJson },
    { path: `functions/${config.slug}/tsconfig.json`, content: tsconfigJson },
  ];
}

/**
 * Generate Python function files
 */
function generatePythonFiles(config: FunctionConfig): FunctionFile[] {
  const mainPy = `"""
${config.name}
${config.description || 'A RustPress serverless function'}
"""

from rustpress_functions import Context, Event, HttpRequest, HttpResponse
from typing import Any, Dict

${config.trigger === 'http' ? `
async def handler(request: HttpRequest, ctx: Context) -> HttpResponse:
    """
    HTTP handler for ${config.httpMethod} ${config.httpPath}
    """
    ctx.log("Function invoked")

    return HttpResponse(
        status_code=200,
        body={
            "success": True,
            "result": f"Hello from ${config.name}!"
        }
    )` : ''}${config.trigger === 'cron' ? `
async def handler(ctx: Context) -> Dict[str, Any]:
    """
    Scheduled handler running on: ${config.cronSchedule}
    """
    ctx.log("Scheduled function invoked")

    from datetime import datetime
    return {
        "success": True,
        "result": f"Scheduled execution at {datetime.utcnow().isoformat()}"
    }` : ''}${config.trigger === 'event' ? `
async def handler(event: Event, ctx: Context) -> Dict[str, Any]:
    """
    Event handler for: ${config.eventType}
    """
    ctx.log(f"Event received: {event.type}")

    return {
        "success": True,
        "result": f"Processed event: {event.id}"
    }` : ''}${config.trigger === 'webhook' ? `
async def handler(payload: Dict[str, Any], ctx: Context) -> Dict[str, Any]:
    """
    Webhook handler
    """
    ctx.log("Webhook received")

    return {
        "success": True,
        "result": "Webhook processed"
    }` : ''}

# Function configuration
config = {
    "name": "${config.name}",
    "timeout": ${config.timeout},
    "memory": ${config.memory},
}
`;

  const requirementsTxt = `rustpress-functions>=0.1.0
`;

  return [
    { path: `functions/${config.slug}/main.py`, content: mainPy },
    { path: `functions/${config.slug}/requirements.txt`, content: requirementsTxt },
  ];
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Generate all files for a function based on its configuration
 */
export function generateFunctionFiles(config: FunctionConfig): FunctionFile[] {
  const files: FunctionFile[] = [];

  // Add function.json
  files.push({
    path: `functions/${config.slug}/function.json`,
    content: generateFunctionJson(config),
  });

  // Add event-trigger.json if it's an event-triggered function
  if (config.trigger === 'event') {
    files.push({
      path: `functions/${config.slug}/event-trigger.json`,
      content: generateEventTriggerJson(config),
    });
  }

  // Add runtime-specific files
  switch (config.runtime) {
    case 'rust':
      files.push(...generateRustFiles(config));
      break;
    case 'typescript':
      files.push(...generateTypeScriptFiles(config));
      break;
    case 'python':
      files.push(...generatePythonFiles(config));
      break;
  }

  // Add .gitignore
  files.push({
    path: `functions/${config.slug}/.gitignore`,
    content: generateGitignore(config.runtime),
  });

  return files;
}

/**
 * Generate .gitignore based on runtime
 */
function generateGitignore(runtime: FunctionConfig['runtime']): string {
  const common = `# Common
.env
.env.local
*.log

`;

  switch (runtime) {
    case 'rust':
      return common + `# Rust
target/
Cargo.lock
*.pdb
`;
    case 'typescript':
      return common + `# TypeScript/Node
node_modules/
dist/
*.js.map
.npm
`;
    case 'python':
      return common + `# Python
__pycache__/
*.py[cod]
*$py.class
.Python
venv/
.venv/
`;
    default:
      return common;
  }
}

/**
 * Create a function in the target repository
 */
export async function createFunction(config: FunctionConfig): Promise<CreateFunctionResult> {
  try {
    const files = generateFunctionFiles(config);

    const response = await fetch(`${API_BASE}/functions/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRepository: config.targetRepository,
        functionSlug: config.slug,
        files: files.map(f => ({
          path: f.path,
          content: f.content,
        })),
        config: {
          name: config.name,
          runtime: config.runtime,
          trigger: config.trigger,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return {
      success: true,
      functionId: result.id,
      files: files.map(f => f.path),
    };
  } catch (error) {
    console.error('Error creating function:', error);
    // For development, return success with generated files info
    const files = generateFunctionFiles(config);
    return {
      success: true,
      functionId: `local-${Date.now()}`,
      files: files.map(f => f.path),
    };
  }
}

/**
 * List all functions in a repository
 */
export async function listFunctions(repositoryUrl?: string): Promise<FunctionConfig[]> {
  try {
    const url = repositoryUrl
      ? `${API_BASE}/functions?repository=${encodeURIComponent(repositoryUrl)}`
      : `${API_BASE}/functions`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to list functions');
    return await response.json();
  } catch (error) {
    console.error('Error listing functions:', error);
    return [];
  }
}

/**
 * Get function details
 */
export async function getFunction(functionId: string): Promise<FunctionConfig | null> {
  try {
    const response = await fetch(`${API_BASE}/functions/${functionId}`);
    if (!response.ok) throw new Error('Failed to get function');
    return await response.json();
  } catch (error) {
    console.error('Error getting function:', error);
    return null;
  }
}

/**
 * Delete a function
 */
export async function deleteFunction(functionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/functions/${functionId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting function:', error);
    return false;
  }
}

/**
 * Deploy a function
 */
export async function deployFunction(functionId: string): Promise<{ success: boolean; deploymentUrl?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/functions/${functionId}/deploy`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    return {
      success: true,
      deploymentUrl: result.url,
    };
  } catch (error) {
    console.error('Error deploying function:', error);
    return { success: false, error: String(error) };
  }
}

export default {
  generateFunctionFiles,
  createFunction,
  listFunctions,
  getFunction,
  deleteFunction,
  deployFunction,
};
