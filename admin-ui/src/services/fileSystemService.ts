/**
 * File System Service
 * Provides file browsing and editing capabilities for the RustPress project
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
  modified?: string;
}

export interface FileContent {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
  language: string;
  size: number;
  modified: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * List files and directories in a path
 */
export async function listDirectory(path: string = ''): Promise<FileNode[]> {
  try {
    const response = await fetch(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to list directory');
    return await response.json();
  } catch (error) {
    console.error('Error listing directory:', error);
    // Return mock data for development based on path
    return getMockFileTree(path);
  }
}

/**
 * Read file content
 */
export async function readFile(path: string): Promise<FileContent> {
  try {
    const response = await fetch(`${API_BASE}/files/read?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to read file');
    return await response.json();
  } catch (error) {
    console.error('Error reading file:', error);
    return getMockFileContent(path);
  }
}

/**
 * Write file content
 */
export async function writeFile(path: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/write`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    if (!response.ok) throw new Error('Failed to write file');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    // Store in localStorage as fallback
    localStorage.setItem(`rustpress_file_${path}`, content);
    return true;
  }
}

/**
 * Create a new file or directory
 */
export async function createFile(path: string, type: 'file' | 'folder'): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, type }),
    });
    if (!response.ok) throw new Error('Failed to create file');
    return true;
  } catch (error) {
    console.error('Error creating file:', error);
    return false;
  }
}

/**
 * Delete a file or directory
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Rename a file or directory
 */
export async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath, newPath }),
    });
    if (!response.ok) throw new Error('Failed to rename file');
    return true;
  } catch (error) {
    console.error('Error renaming file:', error);
    return false;
  }
}

/**
 * Check if a project folder has git initialized
 * Returns true if .git folder exists in the project path
 */
export interface GitStatus {
  hasGit: boolean;
  branch?: string;
  isDirty?: boolean;
  remoteUrl?: string;
}

export async function checkGitStatus(projectPath: string): Promise<GitStatus> {
  try {
    const response = await fetch(`${API_BASE}/git/status?path=${encodeURIComponent(projectPath)}`);
    if (!response.ok) throw new Error('Failed to check git status');
    return await response.json();
  } catch (error) {
    console.error('Error checking git status:', error);
    // Mock response for development - simulate some projects having git and some not
    return getMockGitStatus(projectPath);
  }
}

/**
 * Initialize a new git repository in the given path
 */
export async function initGitRepository(projectPath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/git/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath }),
    });
    if (!response.ok) throw new Error('Failed to initialize git repository');
    return true;
  } catch (error) {
    console.error('Error initializing git repository:', error);
    return false;
  }
}

/**
 * Mock git status for development
 */
function getMockGitStatus(projectPath: string): GitStatus {
  // Simulate some projects having git initialized
  // One project per folder type has git, others don't (to test the warning)
  const projectsWithGit = [
    'themes/starter',
    'plugins/seo-optimizer',
    'functions/api-utils',
    'apps/crm-dashboard',
  ];

  const hasGit = projectsWithGit.some(p => projectPath.startsWith(p));

  if (hasGit) {
    return {
      hasGit: true,
      branch: 'main',
      isDirty: Math.random() > 0.5,
      remoteUrl: 'https://github.com/user/project.git'
    };
  }

  return { hasGit: false };
}

// ============================================
// HELPERS
// ============================================

export function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'json': 'json',
    'md': 'markdown',
    'mdx': 'markdown',
    'svg': 'xml',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',

    // Rust
    'rs': 'rust',
    'toml': 'toml',

    // Config
    'env': 'plaintext',
    'gitignore': 'plaintext',
    'dockerignore': 'plaintext',
    'editorconfig': 'ini',

    // SQL
    'sql': 'sql',

    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'ps1': 'powershell',
    'bat': 'bat',
    'cmd': 'bat',
  };
  return languageMap[ext || ''] || 'plaintext';
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockFileTree(rootPath: string = ''): FileNode[] {
  // Return specific mock data based on the root path
  switch (rootPath) {
    case 'themes':
      return getMockThemesTree();
    case 'functions':
      return getMockFunctionsTree();
    case 'plugins':
      return getMockPluginsTree();
    case 'apps':
      return getMockAppsTree();
    case 'assets':
      return getMockAssetsTree();
    case 'crates':
      return getMockCratesTree();
    default:
      return getMockRootTree();
  }
}

function getMockThemesTree(): FileNode[] {
  return [
    {
      id: 'themes/rustpress-developer',
      name: 'rustpress-developer',
      path: 'themes/rustpress-developer',
      type: 'folder',
      children: [
        {
          id: 'themes/rustpress-developer/theme.json',
          name: 'theme.json',
          path: 'themes/rustpress-developer/theme.json',
          type: 'file',
        },
        {
          id: 'themes/rustpress-developer/templates',
          name: 'templates',
          path: 'themes/rustpress-developer/templates',
          type: 'folder',
          children: [
            {
              id: 'themes/rustpress-developer/templates/base.html',
              name: 'base.html',
              path: 'themes/rustpress-developer/templates/base.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/templates/home.html',
              name: 'home.html',
              path: 'themes/rustpress-developer/templates/home.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/templates/post.html',
              name: 'post.html',
              path: 'themes/rustpress-developer/templates/post.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/templates/page.html',
              name: 'page.html',
              path: 'themes/rustpress-developer/templates/page.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/templates/archive.html',
              name: 'archive.html',
              path: 'themes/rustpress-developer/templates/archive.html',
              type: 'file',
            },
          ],
        },
        {
          id: 'themes/rustpress-developer/partials',
          name: 'partials',
          path: 'themes/rustpress-developer/partials',
          type: 'folder',
          children: [
            {
              id: 'themes/rustpress-developer/partials/header.html',
              name: 'header.html',
              path: 'themes/rustpress-developer/partials/header.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/partials/footer.html',
              name: 'footer.html',
              path: 'themes/rustpress-developer/partials/footer.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/partials/sidebar.html',
              name: 'sidebar.html',
              path: 'themes/rustpress-developer/partials/sidebar.html',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/partials/nav.html',
              name: 'nav.html',
              path: 'themes/rustpress-developer/partials/nav.html',
              type: 'file',
            },
          ],
        },
        {
          id: 'themes/rustpress-developer/assets',
          name: 'assets',
          path: 'themes/rustpress-developer/assets',
          type: 'folder',
          children: [
            {
              id: 'themes/rustpress-developer/assets/css',
              name: 'css',
              path: 'themes/rustpress-developer/assets/css',
              type: 'folder',
              children: [
                {
                  id: 'themes/rustpress-developer/assets/css/style.css',
                  name: 'style.css',
                  path: 'themes/rustpress-developer/assets/css/style.css',
                  type: 'file',
                },
                {
                  id: 'themes/rustpress-developer/assets/css/variables.css',
                  name: 'variables.css',
                  path: 'themes/rustpress-developer/assets/css/variables.css',
                  type: 'file',
                },
              ],
            },
            {
              id: 'themes/rustpress-developer/assets/js',
              name: 'js',
              path: 'themes/rustpress-developer/assets/js',
              type: 'folder',
              children: [
                {
                  id: 'themes/rustpress-developer/assets/js/main.js',
                  name: 'main.js',
                  path: 'themes/rustpress-developer/assets/js/main.js',
                  type: 'file',
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function getMockFunctionsTree(): FileNode[] {
  return [
    {
      id: 'functions/hello-world.js',
      name: 'hello-world.js',
      path: 'functions/hello-world.js',
      type: 'file',
    },
    {
      id: 'functions/contact-form.js',
      name: 'contact-form.js',
      path: 'functions/contact-form.js',
      type: 'file',
    },
    {
      id: 'functions/newsletter-signup.js',
      name: 'newsletter-signup.js',
      path: 'functions/newsletter-signup.js',
      type: 'file',
    },
    {
      id: 'functions/analytics-tracker.js',
      name: 'analytics-tracker.js',
      path: 'functions/analytics-tracker.js',
      type: 'file',
    },
    {
      id: 'functions/api',
      name: 'api',
      path: 'functions/api',
      type: 'folder',
      children: [
        {
          id: 'functions/api/posts.js',
          name: 'posts.js',
          path: 'functions/api/posts.js',
          type: 'file',
        },
        {
          id: 'functions/api/users.js',
          name: 'users.js',
          path: 'functions/api/users.js',
          type: 'file',
        },
        {
          id: 'functions/api/comments.js',
          name: 'comments.js',
          path: 'functions/api/comments.js',
          type: 'file',
        },
      ],
    },
    {
      id: 'functions/scheduled',
      name: 'scheduled',
      path: 'functions/scheduled',
      type: 'folder',
      children: [
        {
          id: 'functions/scheduled/cleanup.js',
          name: 'cleanup.js',
          path: 'functions/scheduled/cleanup.js',
          type: 'file',
        },
        {
          id: 'functions/scheduled/sitemap-generator.js',
          name: 'sitemap-generator.js',
          path: 'functions/scheduled/sitemap-generator.js',
          type: 'file',
        },
      ],
    },
  ];
}

function getMockPluginsTree(): FileNode[] {
  return [
    {
      id: 'plugins/seo-optimizer',
      name: 'seo-optimizer',
      path: 'plugins/seo-optimizer',
      type: 'folder',
      children: [
        {
          id: 'plugins/seo-optimizer/plugin.json',
          name: 'plugin.json',
          path: 'plugins/seo-optimizer/plugin.json',
          type: 'file',
        },
        {
          id: 'plugins/seo-optimizer/index.js',
          name: 'index.js',
          path: 'plugins/seo-optimizer/index.js',
          type: 'file',
        },
      ],
    },
    {
      id: 'plugins/social-share',
      name: 'social-share',
      path: 'plugins/social-share',
      type: 'folder',
      children: [
        {
          id: 'plugins/social-share/plugin.json',
          name: 'plugin.json',
          path: 'plugins/social-share/plugin.json',
          type: 'file',
        },
        {
          id: 'plugins/social-share/index.js',
          name: 'index.js',
          path: 'plugins/social-share/index.js',
          type: 'file',
        },
      ],
    },
  ];
}

function getMockAppsTree(): FileNode[] {
  return [
    {
      id: 'apps/crm-dashboard',
      name: 'crm-dashboard',
      path: 'apps/crm-dashboard',
      type: 'folder',
      children: [
        {
          id: 'apps/crm-dashboard/app.json',
          name: 'app.json',
          path: 'apps/crm-dashboard/app.json',
          type: 'file',
        },
        {
          id: 'apps/crm-dashboard/src',
          name: 'src',
          path: 'apps/crm-dashboard/src',
          type: 'folder',
          children: [
            {
              id: 'apps/crm-dashboard/src/App.tsx',
              name: 'App.tsx',
              path: 'apps/crm-dashboard/src/App.tsx',
              type: 'file',
            },
            {
              id: 'apps/crm-dashboard/src/components',
              name: 'components',
              path: 'apps/crm-dashboard/src/components',
              type: 'folder',
              children: [
                {
                  id: 'apps/crm-dashboard/src/components/Dashboard.tsx',
                  name: 'Dashboard.tsx',
                  path: 'apps/crm-dashboard/src/components/Dashboard.tsx',
                  type: 'file',
                },
                {
                  id: 'apps/crm-dashboard/src/components/ContactList.tsx',
                  name: 'ContactList.tsx',
                  path: 'apps/crm-dashboard/src/components/ContactList.tsx',
                  type: 'file',
                },
              ],
            },
            {
              id: 'apps/crm-dashboard/src/api',
              name: 'api',
              path: 'apps/crm-dashboard/src/api',
              type: 'folder',
              children: [
                {
                  id: 'apps/crm-dashboard/src/api/contacts.rs',
                  name: 'contacts.rs',
                  path: 'apps/crm-dashboard/src/api/contacts.rs',
                  type: 'file',
                },
              ],
            },
          ],
        },
        {
          id: 'apps/crm-dashboard/package.json',
          name: 'package.json',
          path: 'apps/crm-dashboard/package.json',
          type: 'file',
        },
      ],
    },
    {
      id: 'apps/analytics-pro',
      name: 'analytics-pro',
      path: 'apps/analytics-pro',
      type: 'folder',
      children: [
        {
          id: 'apps/analytics-pro/app.json',
          name: 'app.json',
          path: 'apps/analytics-pro/app.json',
          type: 'file',
        },
        {
          id: 'apps/analytics-pro/src',
          name: 'src',
          path: 'apps/analytics-pro/src',
          type: 'folder',
          children: [
            {
              id: 'apps/analytics-pro/src/App.tsx',
              name: 'App.tsx',
              path: 'apps/analytics-pro/src/App.tsx',
              type: 'file',
            },
            {
              id: 'apps/analytics-pro/src/charts',
              name: 'charts',
              path: 'apps/analytics-pro/src/charts',
              type: 'folder',
              children: [
                {
                  id: 'apps/analytics-pro/src/charts/LineChart.tsx',
                  name: 'LineChart.tsx',
                  path: 'apps/analytics-pro/src/charts/LineChart.tsx',
                  type: 'file',
                },
                {
                  id: 'apps/analytics-pro/src/charts/BarChart.tsx',
                  name: 'BarChart.tsx',
                  path: 'apps/analytics-pro/src/charts/BarChart.tsx',
                  type: 'file',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'apps/invoice-manager',
      name: 'invoice-manager',
      path: 'apps/invoice-manager',
      type: 'folder',
      children: [
        {
          id: 'apps/invoice-manager/app.json',
          name: 'app.json',
          path: 'apps/invoice-manager/app.json',
          type: 'file',
        },
        {
          id: 'apps/invoice-manager/src',
          name: 'src',
          path: 'apps/invoice-manager/src',
          type: 'folder',
          children: [
            {
              id: 'apps/invoice-manager/src/App.tsx',
              name: 'App.tsx',
              path: 'apps/invoice-manager/src/App.tsx',
              type: 'file',
            },
          ],
        },
      ],
    },
  ];
}

function getMockAssetsTree(): FileNode[] {
  return [
    {
      id: 'assets/images',
      name: 'images',
      path: 'assets/images',
      type: 'folder',
      children: [
        {
          id: 'assets/images/logo.svg',
          name: 'logo.svg',
          path: 'assets/images/logo.svg',
          type: 'file',
        },
        {
          id: 'assets/images/favicon.ico',
          name: 'favicon.ico',
          path: 'assets/images/favicon.ico',
          type: 'file',
        },
        {
          id: 'assets/images/hero-bg.jpg',
          name: 'hero-bg.jpg',
          path: 'assets/images/hero-bg.jpg',
          type: 'file',
        },
        {
          id: 'assets/images/icons',
          name: 'icons',
          path: 'assets/images/icons',
          type: 'folder',
          children: [
            {
              id: 'assets/images/icons/search.svg',
              name: 'search.svg',
              path: 'assets/images/icons/search.svg',
              type: 'file',
            },
            {
              id: 'assets/images/icons/menu.svg',
              name: 'menu.svg',
              path: 'assets/images/icons/menu.svg',
              type: 'file',
            },
            {
              id: 'assets/images/icons/close.svg',
              name: 'close.svg',
              path: 'assets/images/icons/close.svg',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      id: 'assets/fonts',
      name: 'fonts',
      path: 'assets/fonts',
      type: 'folder',
      children: [
        {
          id: 'assets/fonts/inter-regular.woff2',
          name: 'inter-regular.woff2',
          path: 'assets/fonts/inter-regular.woff2',
          type: 'file',
        },
        {
          id: 'assets/fonts/inter-bold.woff2',
          name: 'inter-bold.woff2',
          path: 'assets/fonts/inter-bold.woff2',
          type: 'file',
        },
        {
          id: 'assets/fonts/jetbrains-mono.woff2',
          name: 'jetbrains-mono.woff2',
          path: 'assets/fonts/jetbrains-mono.woff2',
          type: 'file',
        },
      ],
    },
    {
      id: 'assets/uploads',
      name: 'uploads',
      path: 'assets/uploads',
      type: 'folder',
      children: [
        {
          id: 'assets/uploads/2024',
          name: '2024',
          path: 'assets/uploads/2024',
          type: 'folder',
          children: [
            {
              id: 'assets/uploads/2024/post-image-1.jpg',
              name: 'post-image-1.jpg',
              path: 'assets/uploads/2024/post-image-1.jpg',
              type: 'file',
            },
            {
              id: 'assets/uploads/2024/post-image-2.png',
              name: 'post-image-2.png',
              path: 'assets/uploads/2024/post-image-2.png',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      id: 'assets/static',
      name: 'static',
      path: 'assets/static',
      type: 'folder',
      children: [
        {
          id: 'assets/static/robots.txt',
          name: 'robots.txt',
          path: 'assets/static/robots.txt',
          type: 'file',
        },
        {
          id: 'assets/static/sitemap.xml',
          name: 'sitemap.xml',
          path: 'assets/static/sitemap.xml',
          type: 'file',
        },
      ],
    },
  ];
}

function getMockCratesTree(): FileNode[] {
  return [
    {
      id: 'crates/rustpress-api',
      name: 'rustpress-api',
      path: 'crates/rustpress-api',
      type: 'folder',
      children: [
        {
          id: 'crates/rustpress-api/Cargo.toml',
          name: 'Cargo.toml',
          path: 'crates/rustpress-api/Cargo.toml',
          type: 'file',
        },
        {
          id: 'crates/rustpress-api/src',
          name: 'src',
          path: 'crates/rustpress-api/src',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-api/src/lib.rs',
              name: 'lib.rs',
              path: 'crates/rustpress-api/src/lib.rs',
              type: 'file',
            },
            {
              id: 'crates/rustpress-api/src/routes.rs',
              name: 'routes.rs',
              path: 'crates/rustpress-api/src/routes.rs',
              type: 'file',
            },
            {
              id: 'crates/rustpress-api/src/handlers.rs',
              name: 'handlers.rs',
              path: 'crates/rustpress-api/src/handlers.rs',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      id: 'crates/rustpress-core',
      name: 'rustpress-core',
      path: 'crates/rustpress-core',
      type: 'folder',
      children: [
        {
          id: 'crates/rustpress-core/Cargo.toml',
          name: 'Cargo.toml',
          path: 'crates/rustpress-core/Cargo.toml',
          type: 'file',
        },
        {
          id: 'crates/rustpress-core/src',
          name: 'src',
          path: 'crates/rustpress-core/src',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-core/src/lib.rs',
              name: 'lib.rs',
              path: 'crates/rustpress-core/src/lib.rs',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      id: 'crates/rustpress-content',
      name: 'rustpress-content',
      path: 'crates/rustpress-content',
      type: 'folder',
      children: [
        {
          id: 'crates/rustpress-content/Cargo.toml',
          name: 'Cargo.toml',
          path: 'crates/rustpress-content/Cargo.toml',
          type: 'file',
        },
      ],
    },
    {
      id: 'crates/rustpress-auth',
      name: 'rustpress-auth',
      path: 'crates/rustpress-auth',
      type: 'folder',
      children: [
        {
          id: 'crates/rustpress-auth/Cargo.toml',
          name: 'Cargo.toml',
          path: 'crates/rustpress-auth/Cargo.toml',
          type: 'file',
        },
      ],
    },
  ];
}

function getMockRootTree(): FileNode[] {
  return [
    {
      id: 'Cargo.toml',
      name: 'Cargo.toml',
      path: 'Cargo.toml',
      type: 'file',
    },
    {
      id: 'Cargo.lock',
      name: 'Cargo.lock',
      path: 'Cargo.lock',
      type: 'file',
    },
    {
      id: '.env',
      name: '.env',
      path: '.env',
      type: 'file',
    },
    {
      id: 'docker-compose.yml',
      name: 'docker-compose.yml',
      path: 'docker-compose.yml',
      type: 'file',
    },
    {
      id: 'init_db.sql',
      name: 'init_db.sql',
      path: 'init_db.sql',
      type: 'file',
    },
    {
      id: 'config',
      name: 'config',
      path: 'config',
      type: 'folder',
      children: [
        {
          id: 'config/rustpress.toml',
          name: 'rustpress.toml',
          path: 'config/rustpress.toml',
          type: 'file',
        },
      ],
    },
    {
      id: 'crates',
      name: 'crates',
      path: 'crates',
      type: 'folder',
      children: [
        {
          id: 'crates/rustpress-api',
          name: 'rustpress-api',
          path: 'crates/rustpress-api',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-api/Cargo.toml',
              name: 'Cargo.toml',
              path: 'crates/rustpress-api/Cargo.toml',
              type: 'file',
            },
            {
              id: 'crates/rustpress-api/src',
              name: 'src',
              path: 'crates/rustpress-api/src',
              type: 'folder',
              children: [
                {
                  id: 'crates/rustpress-api/src/lib.rs',
                  name: 'lib.rs',
                  path: 'crates/rustpress-api/src/lib.rs',
                  type: 'file',
                },
              ],
            },
          ],
        },
        {
          id: 'crates/rustpress-core',
          name: 'rustpress-core',
          path: 'crates/rustpress-core',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-core/Cargo.toml',
              name: 'Cargo.toml',
              path: 'crates/rustpress-core/Cargo.toml',
              type: 'file',
            },
            {
              id: 'crates/rustpress-core/src',
              name: 'src',
              path: 'crates/rustpress-core/src',
              type: 'folder',
              children: [
                {
                  id: 'crates/rustpress-core/src/lib.rs',
                  name: 'lib.rs',
                  path: 'crates/rustpress-core/src/lib.rs',
                  type: 'file',
                },
              ],
            },
          ],
        },
        {
          id: 'crates/rustpress-content',
          name: 'rustpress-content',
          path: 'crates/rustpress-content',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-content/Cargo.toml',
              name: 'Cargo.toml',
              path: 'crates/rustpress-content/Cargo.toml',
              type: 'file',
            },
          ],
        },
        {
          id: 'crates/rustpress-auth',
          name: 'rustpress-auth',
          path: 'crates/rustpress-auth',
          type: 'folder',
          children: [
            {
              id: 'crates/rustpress-auth/Cargo.toml',
              name: 'Cargo.toml',
              path: 'crates/rustpress-auth/Cargo.toml',
              type: 'file',
            },
          ],
        },
      ],
    },
    {
      id: 'themes',
      name: 'themes',
      path: 'themes',
      type: 'folder',
      children: [
        {
          id: 'themes/rustpress-developer',
          name: 'rustpress-developer',
          path: 'themes/rustpress-developer',
          type: 'folder',
          children: [
            {
              id: 'themes/rustpress-developer/theme.json',
              name: 'theme.json',
              path: 'themes/rustpress-developer/theme.json',
              type: 'file',
            },
            {
              id: 'themes/rustpress-developer/templates',
              name: 'templates',
              path: 'themes/rustpress-developer/templates',
              type: 'folder',
              children: [
                {
                  id: 'themes/rustpress-developer/templates/home.html',
                  name: 'home.html',
                  path: 'themes/rustpress-developer/templates/home.html',
                  type: 'file',
                },
                {
                  id: 'themes/rustpress-developer/templates/post.html',
                  name: 'post.html',
                  path: 'themes/rustpress-developer/templates/post.html',
                  type: 'file',
                },
              ],
            },
            {
              id: 'themes/rustpress-developer/assets',
              name: 'assets',
              path: 'themes/rustpress-developer/assets',
              type: 'folder',
              children: [
                {
                  id: 'themes/rustpress-developer/assets/css',
                  name: 'css',
                  path: 'themes/rustpress-developer/assets/css',
                  type: 'folder',
                  children: [
                    {
                      id: 'themes/rustpress-developer/assets/css/style.css',
                      name: 'style.css',
                      path: 'themes/rustpress-developer/assets/css/style.css',
                      type: 'file',
                    },
                  ],
                },
                {
                  id: 'themes/rustpress-developer/assets/js',
                  name: 'js',
                  path: 'themes/rustpress-developer/assets/js',
                  type: 'folder',
                  children: [
                    {
                      id: 'themes/rustpress-developer/assets/js/main.js',
                      name: 'main.js',
                      path: 'themes/rustpress-developer/assets/js/main.js',
                      type: 'file',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'plugins',
      name: 'plugins',
      path: 'plugins',
      type: 'folder',
      children: [],
    },
    {
      id: 'migrations',
      name: 'migrations',
      path: 'migrations',
      type: 'folder',
      children: [],
    },
    {
      id: 'admin-ui',
      name: 'admin-ui',
      path: 'admin-ui',
      type: 'folder',
      children: [
        {
          id: 'admin-ui/package.json',
          name: 'package.json',
          path: 'admin-ui/package.json',
          type: 'file',
        },
        {
          id: 'admin-ui/vite.config.ts',
          name: 'vite.config.ts',
          path: 'admin-ui/vite.config.ts',
          type: 'file',
        },
        {
          id: 'admin-ui/src',
          name: 'src',
          path: 'admin-ui/src',
          type: 'folder',
          children: [
            {
              id: 'admin-ui/src/App.tsx',
              name: 'App.tsx',
              path: 'admin-ui/src/App.tsx',
              type: 'file',
            },
            {
              id: 'admin-ui/src/main.tsx',
              name: 'main.tsx',
              path: 'admin-ui/src/main.tsx',
              type: 'file',
            },
          ],
        },
      ],
    },
  ];
}

function getMockFileContent(path: string): FileContent {
  // Check localStorage first
  const stored = localStorage.getItem(`rustpress_file_${path}`);
  if (stored) {
    return {
      path,
      content: stored,
      encoding: 'utf-8',
      language: getLanguageFromPath(path),
      size: stored.length,
      modified: new Date().toISOString(),
    };
  }

  // Return placeholder content based on file type
  const ext = path.split('.').pop()?.toLowerCase();
  let content = '';

  switch (ext) {
    case 'rs':
      content = `// ${path}\n// Rust source file\n\nfn main() {\n    println!("Hello, RustPress!");\n}\n`;
      break;
    case 'toml':
      content = `# ${path}\n# TOML configuration file\n\n[package]\nname = "example"\nversion = "0.1.0"\n`;
      break;
    case 'json':
      content = `{\n  "name": "${path}",\n  "version": "1.0.0"\n}\n`;
      break;
    case 'html':
      content = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${path}</title>\n</head>\n<body>\n  <!-- Content -->\n</body>\n</html>\n`;
      break;
    case 'css':
      content = `/* ${path} */\n\nbody {\n  margin: 0;\n  padding: 0;\n}\n`;
      break;
    case 'js':
    case 'ts':
      content = `// ${path}\n\nconsole.log('Hello from ${path}');\n`;
      break;
    case 'tsx':
    case 'jsx':
      content = `// ${path}\n\nimport React from 'react';\n\nexport default function Component() {\n  return <div>Hello</div>;\n}\n`;
      break;
    case 'sql':
      content = `-- ${path}\n-- SQL file\n\nSELECT * FROM posts;\n`;
      break;
    case 'yml':
    case 'yaml':
      content = `# ${path}\n# YAML configuration\n\nversion: '3'\nservices: {}\n`;
      break;
    default:
      content = `# ${path}\n`;
  }

  return {
    path,
    content,
    encoding: 'utf-8',
    language: getLanguageFromPath(path),
    size: content.length,
    modified: new Date().toISOString(),
  };
}

// ============================================
// GIT OPERATIONS
// ============================================

export interface GitCommit {
  hash: string;
  shortHash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  hunks: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    content: string;
  }>;
}

export interface GitBlame {
  lines: Array<{
    lineNumber: number;
    commit: string;
    author: string;
    date: string;
    content: string;
  }>;
}

export async function gitCommit(projectPath: string, message: string, files?: string[]): Promise<GitCommit | null> {
  try {
    const response = await fetch(`${API_BASE}/git/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath, message, files }),
    });
    if (!response.ok) throw new Error('Failed to commit');
    return await response.json();
  } catch (error) {
    console.error('Error committing:', error);
    return null;
  }
}

export async function gitPush(projectPath: string, remote: string = 'origin', branch?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/git/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath, remote, branch }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error pushing:', error);
    return false;
  }
}

export async function gitPull(projectPath: string, remote: string = 'origin', branch?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/git/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath, remote, branch }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error pulling:', error);
    return false;
  }
}

export async function gitLog(projectPath: string, limit: number = 50): Promise<GitCommit[]> {
  try {
    const response = await fetch(`${API_BASE}/git/log?path=${encodeURIComponent(projectPath)}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get git log');
    return await response.json();
  } catch (error) {
    console.error('Error getting git log:', error);
    return [];
  }
}

export async function gitDiff(projectPath: string, file?: string): Promise<GitDiff[]> {
  try {
    const url = file
      ? `${API_BASE}/git/diff?path=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(file)}`
      : `${API_BASE}/git/diff?path=${encodeURIComponent(projectPath)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get git diff');
    return await response.json();
  } catch (error) {
    console.error('Error getting git diff:', error);
    return [];
  }
}

export async function gitBlame(filePath: string): Promise<GitBlame | null> {
  try {
    const response = await fetch(`${API_BASE}/git/blame?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error('Failed to get git blame');
    return await response.json();
  } catch (error) {
    console.error('Error getting git blame:', error);
    return null;
  }
}

export async function gitBranches(projectPath: string): Promise<{ current: string; branches: string[] }> {
  try {
    const response = await fetch(`${API_BASE}/git/branches?path=${encodeURIComponent(projectPath)}`);
    if (!response.ok) throw new Error('Failed to get branches');
    return await response.json();
  } catch (error) {
    console.error('Error getting branches:', error);
    return { current: 'main', branches: ['main', 'develop'] };
  }
}

export async function gitCheckout(projectPath: string, branch: string, create: boolean = false): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/git/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath, branch, create }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking out branch:', error);
    return false;
  }
}

export async function gitStash(projectPath: string, action: 'save' | 'pop' | 'list' | 'drop', message?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/git/stash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: projectPath, action, message }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error with git stash:', error);
    return false;
  }
}

// ============================================
// SEARCH OPERATIONS
// ============================================

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  content: string;
  matchedText: string;
}

export interface SearchOptions {
  query: string;
  path?: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
  include?: string;
  exclude?: string;
  maxResults?: number;
}

export async function searchInFiles(options: SearchOptions): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    // Return mock results for development
    return [];
  }
}

export async function replaceInFiles(
  searchOptions: SearchOptions,
  replaceText: string,
  preview: boolean = true
): Promise<{ files: string[]; changes: number }> {
  try {
    const response = await fetch(`${API_BASE}/search/replace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...searchOptions, replaceText, preview }),
    });
    if (!response.ok) throw new Error('Replace failed');
    return await response.json();
  } catch (error) {
    console.error('Error replacing:', error);
    return { files: [], changes: 0 };
  }
}

// ============================================
// TERMINAL / SHELL OPERATIONS
// ============================================

export interface TerminalSession {
  id: string;
  cwd: string;
  shell: string;
}

export async function createTerminal(cwd?: string): Promise<TerminalSession | null> {
  try {
    const response = await fetch(`${API_BASE}/terminal/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cwd }),
    });
    if (!response.ok) throw new Error('Failed to create terminal');
    return await response.json();
  } catch (error) {
    console.error('Error creating terminal:', error);
    return null;
  }
}

export async function executeCommand(sessionId: string, command: string): Promise<{ output: string; exitCode: number }> {
  try {
    const response = await fetch(`${API_BASE}/terminal/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, command }),
    });
    if (!response.ok) throw new Error('Failed to execute command');
    return await response.json();
  } catch (error) {
    console.error('Error executing command:', error);
    return { output: 'Command execution failed', exitCode: 1 };
  }
}

export async function killTerminal(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/terminal/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error killing terminal:', error);
    return false;
  }
}

// ============================================
// BUILD / TASK OPERATIONS
// ============================================

export interface TaskConfig {
  id: string;
  name: string;
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  problemMatcher?: string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  status: 'running' | 'completed' | 'failed';
  output: string;
  startTime: string;
  endTime?: string;
  exitCode?: number;
}

export async function runTask(task: TaskConfig): Promise<TaskExecution | null> {
  try {
    const response = await fetch(`${API_BASE}/tasks/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to run task');
    return await response.json();
  } catch (error) {
    console.error('Error running task:', error);
    return null;
  }
}

export async function stopTask(executionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ executionId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error stopping task:', error);
    return false;
  }
}

export async function getTaskOutput(executionId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/tasks/output?id=${executionId}`);
    if (!response.ok) throw new Error('Failed to get task output');
    const data = await response.json();
    return data.output;
  } catch (error) {
    console.error('Error getting task output:', error);
    return '';
  }
}

// ============================================
// DEBUG OPERATIONS
// ============================================

export interface DebugSession {
  id: string;
  type: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  hitCount?: number;
  enabled: boolean;
}

export interface StackFrame {
  id: number;
  name: string;
  file: string;
  line: number;
  column: number;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
}

export async function startDebugSession(config: { type: string; program: string; args?: string[] }): Promise<DebugSession | null> {
  try {
    const response = await fetch(`${API_BASE}/debug/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to start debug session');
    return await response.json();
  } catch (error) {
    console.error('Error starting debug session:', error);
    return null;
  }
}

export async function stopDebugSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error stopping debug session:', error);
    return false;
  }
}

export async function setBreakpoint(breakpoint: Omit<Breakpoint, 'id'>): Promise<Breakpoint | null> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(breakpoint),
    });
    if (!response.ok) throw new Error('Failed to set breakpoint');
    return await response.json();
  } catch (error) {
    console.error('Error setting breakpoint:', error);
    return null;
  }
}

export async function removeBreakpoint(breakpointId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoint/${breakpointId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error removing breakpoint:', error);
    return false;
  }
}

export async function debugStep(sessionId: string, action: 'continue' | 'stepOver' | 'stepInto' | 'stepOut'): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error during debug ${action}:`, error);
    return false;
  }
}

export async function getStackTrace(sessionId: string): Promise<StackFrame[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/stacktrace?sessionId=${sessionId}`);
    if (!response.ok) throw new Error('Failed to get stack trace');
    return await response.json();
  } catch (error) {
    console.error('Error getting stack trace:', error);
    return [];
  }
}

export async function getVariables(sessionId: string, frameId: number): Promise<Variable[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/variables?sessionId=${sessionId}&frameId=${frameId}`);
    if (!response.ok) throw new Error('Failed to get variables');
    return await response.json();
  } catch (error) {
    console.error('Error getting variables:', error);
    return [];
  }
}

// ============================================
// CODE FORMATTING / LINTING
// ============================================

export interface FormatOptions {
  tabSize?: number;
  insertSpaces?: boolean;
  trimTrailingWhitespace?: boolean;
  insertFinalNewline?: boolean;
}

export interface LintResult {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  source: string;
  code?: string;
}

export async function formatDocument(filePath: string, options?: FormatOptions): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/format`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, options }),
    });
    if (!response.ok) throw new Error('Failed to format document');
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error formatting document:', error);
    return null;
  }
}

export async function lintDocument(filePath: string): Promise<LintResult[]> {
  try {
    const response = await fetch(`${API_BASE}/lint?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error('Failed to lint document');
    return await response.json();
  } catch (error) {
    console.error('Error linting document:', error);
    return [];
  }
}

export async function lintProject(projectPath: string): Promise<LintResult[]> {
  try {
    const response = await fetch(`${API_BASE}/lint/project?path=${encodeURIComponent(projectPath)}`);
    if (!response.ok) throw new Error('Failed to lint project');
    return await response.json();
  } catch (error) {
    console.error('Error linting project:', error);
    return [];
  }
}

// ============================================
// CODE INTELLIGENCE / INTELLISENSE
// ============================================

export interface CompletionItem {
  label: string;
  kind: 'function' | 'variable' | 'class' | 'interface' | 'property' | 'method' | 'keyword' | 'snippet';
  detail?: string;
  documentation?: string;
  insertText: string;
  sortText?: string;
}

export interface Definition {
  file: string;
  line: number;
  column: number;
  name: string;
}

export interface Hover {
  content: string;
  range?: { startLine: number; startColumn: number; endLine: number; endColumn: number };
}

export interface Symbol {
  name: string;
  kind: string;
  file: string;
  line: number;
  column: number;
  containerName?: string;
}

export async function getCompletions(filePath: string, line: number, column: number, content: string): Promise<CompletionItem[]> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, line, column, content }),
    });
    if (!response.ok) throw new Error('Failed to get completions');
    return await response.json();
  } catch (error) {
    console.error('Error getting completions:', error);
    return [];
  }
}

export async function getDefinition(filePath: string, line: number, column: number): Promise<Definition | null> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/definition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get definition');
    return await response.json();
  } catch (error) {
    console.error('Error getting definition:', error);
    return null;
  }
}

export async function getReferences(filePath: string, line: number, column: number): Promise<Definition[]> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/references`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get references');
    return await response.json();
  } catch (error) {
    console.error('Error getting references:', error);
    return [];
  }
}

export async function getHover(filePath: string, line: number, column: number): Promise<Hover | null> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/hover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, line, column }),
    });
    if (!response.ok) throw new Error('Failed to get hover info');
    return await response.json();
  } catch (error) {
    console.error('Error getting hover info:', error);
    return null;
  }
}

export async function getDocumentSymbols(filePath: string): Promise<Symbol[]> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/symbols?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) throw new Error('Failed to get document symbols');
    return await response.json();
  } catch (error) {
    console.error('Error getting document symbols:', error);
    return [];
  }
}

export async function getWorkspaceSymbols(query: string, projectPath?: string): Promise<Symbol[]> {
  try {
    const url = projectPath
      ? `${API_BASE}/intellisense/workspace-symbols?query=${encodeURIComponent(query)}&path=${encodeURIComponent(projectPath)}`
      : `${API_BASE}/intellisense/workspace-symbols?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get workspace symbols');
    return await response.json();
  } catch (error) {
    console.error('Error getting workspace symbols:', error);
    return [];
  }
}

export async function renameSymbol(filePath: string, line: number, column: number, newName: string): Promise<{ file: string; edits: Array<{ line: number; column: number; length: number; newText: string }> }[]> {
  try {
    const response = await fetch(`${API_BASE}/intellisense/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, line, column, newName }),
    });
    if (!response.ok) throw new Error('Failed to rename symbol');
    return await response.json();
  } catch (error) {
    console.error('Error renaming symbol:', error);
    return [];
  }
}

// ============================================
// FILE UPLOAD / DOWNLOAD
// ============================================

export async function uploadFile(path: string, file: File): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.ok;
  } catch (error) {
    console.error('Error uploading file:', error);
    return false;
  }
}

export async function downloadFile(path: string): Promise<Blob | null> {
  try {
    const response = await fetch(`${API_BASE}/files/download?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('Failed to download file');
    return await response.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

export async function copyFile(sourcePath: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourcePath, destination: destPath }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
}

export async function moveFile(sourcePath: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/files/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: sourcePath, destination: destPath }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
}

export default {
  listDirectory,
  readFile,
  writeFile,
  createFile,
  deleteFile,
  renameFile,
  getLanguageFromPath,
  // Git
  checkGitStatus,
  initGitRepository,
  gitCommit,
  gitPush,
  gitPull,
  gitLog,
  gitDiff,
  gitBlame,
  gitBranches,
  gitCheckout,
  gitStash,
  // Search
  searchInFiles,
  replaceInFiles,
  // Terminal
  createTerminal,
  executeCommand,
  killTerminal,
  // Tasks
  runTask,
  stopTask,
  getTaskOutput,
  // Debug
  startDebugSession,
  stopDebugSession,
  setBreakpoint,
  removeBreakpoint,
  debugStep,
  getStackTrace,
  getVariables,
  // Format/Lint
  formatDocument,
  lintDocument,
  lintProject,
  // IntelliSense
  getCompletions,
  getDefinition,
  getReferences,
  getHover,
  getDocumentSymbols,
  getWorkspaceSymbols,
  renameSymbol,
  // File operations
  uploadFile,
  downloadFile,
  copyFile,
  moveFile,
};
