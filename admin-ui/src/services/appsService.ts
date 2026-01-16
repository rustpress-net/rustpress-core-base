/**
 * Apps Service
 * Handles API interactions for the RustPress Apps system
 * Provides CRUD operations for apps, installations, and user access
 */

import type {
  App,
  InstalledApp,
  AppConfig,
  UserAppAccess,
  AppStoreFilters,
  AppUsageStats,
} from '../types/app';

// Base API URL - should be configured from environment
const API_BASE = '/api/v1/apps';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return handleResponse<T>(response);
  } catch (error) {
    // For demo purposes, return mock data when API is unavailable
    console.warn(`API request failed for ${endpoint}, using fallback`);
    throw error;
  }
}

// ============================================
// STORE API - Browse available apps
// ============================================

export async function getAvailableApps(filters?: AppStoreFilters): Promise<App[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.priceType) params.set('priceType', filters.priceType);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.search) params.set('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<App[]>(`/store${query}`);
}

export async function getAppDetails(appId: string): Promise<App> {
  return apiRequest<App>(`/store/${appId}`);
}

export async function getFeaturedApps(): Promise<App[]> {
  return apiRequest<App[]>('/store/featured');
}

export async function getAppsByCategory(category: string): Promise<App[]> {
  return apiRequest<App[]>(`/store/category/${category}`);
}

// ============================================
// INSTALLED APPS API
// ============================================

export async function getInstalledApps(): Promise<InstalledApp[]> {
  return apiRequest<InstalledApp[]>('/installed');
}

export async function installApp(
  appId: string,
  licenseKey?: string
): Promise<InstalledApp> {
  return apiRequest<InstalledApp>('/install', {
    method: 'POST',
    body: JSON.stringify({ appId, licenseKey }),
  });
}

export async function uninstallApp(appId: string): Promise<void> {
  return apiRequest<void>(`/installed/${appId}`, {
    method: 'DELETE',
  });
}

export async function activateApp(appId: string): Promise<InstalledApp> {
  return apiRequest<InstalledApp>(`/installed/${appId}/activate`, {
    method: 'POST',
  });
}

export async function deactivateApp(appId: string): Promise<InstalledApp> {
  return apiRequest<InstalledApp>(`/installed/${appId}/deactivate`, {
    method: 'POST',
  });
}

export async function checkForUpdates(): Promise<
  Array<{ appId: string; currentVersion: string; newVersion: string }>
> {
  return apiRequest('/installed/check-updates');
}

export async function updateApp(appId: string): Promise<InstalledApp> {
  return apiRequest<InstalledApp>(`/installed/${appId}/update`, {
    method: 'POST',
  });
}

// ============================================
// APP CONFIG API
// ============================================

export async function getAppConfig(appId: string): Promise<AppConfig> {
  return apiRequest<AppConfig>(`/${appId}/config`);
}

export async function updateAppConfig(
  appId: string,
  config: Partial<AppConfig>
): Promise<AppConfig> {
  return apiRequest<AppConfig>(`/${appId}/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function resetAppConfig(appId: string): Promise<AppConfig> {
  return apiRequest<AppConfig>(`/${appId}/config/reset`, {
    method: 'POST',
  });
}

// ============================================
// USER ACCESS API
// ============================================

export async function getUserAppAccess(userId: string): Promise<UserAppAccess> {
  return apiRequest<UserAppAccess>(`/access/${userId}`);
}

export async function setUserAppAccess(
  userId: string,
  appIds: string[],
  defaultAppId?: string
): Promise<UserAppAccess> {
  return apiRequest<UserAppAccess>(`/access/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ appIds, defaultAppId }),
  });
}

export async function removeUserAppAccess(userId: string): Promise<void> {
  return apiRequest<void>(`/access/${userId}`, {
    method: 'DELETE',
  });
}

export async function getAllUserAccess(): Promise<Record<string, UserAppAccess>> {
  return apiRequest<Record<string, UserAppAccess>>('/access');
}

export async function bulkSetUserAccess(
  userIds: string[],
  appIds: string[]
): Promise<void> {
  return apiRequest<void>('/access/bulk', {
    method: 'POST',
    body: JSON.stringify({ userIds, appIds }),
  });
}

// ============================================
// APP LAUNCH API
// ============================================

export async function launchApp(appId: string): Promise<{ entryPoint: string }> {
  return apiRequest<{ entryPoint: string }>(`/${appId}/launch`, {
    method: 'POST',
  });
}

export async function getAppEntryPoint(appId: string): Promise<string> {
  const result = await apiRequest<{ entryPoint: string }>(`/${appId}/entry-point`);
  return result.entryPoint;
}

// ============================================
// USAGE STATS API
// ============================================

export async function getAppStats(appId: string): Promise<AppUsageStats> {
  return apiRequest<AppUsageStats>(`/${appId}/stats`);
}

export async function getAllStats(): Promise<Record<string, AppUsageStats>> {
  return apiRequest<Record<string, AppUsageStats>>('/stats');
}

export async function recordAppUsage(
  appId: string,
  userId: string,
  action: string
): Promise<void> {
  return apiRequest<void>(`/${appId}/stats/record`, {
    method: 'POST',
    body: JSON.stringify({ userId, action, timestamp: new Date().toISOString() }),
  });
}

// ============================================
// LICENSE API
// ============================================

export async function validateLicense(
  appId: string,
  licenseKey: string
): Promise<{ isValid: boolean; message?: string }> {
  return apiRequest<{ isValid: boolean; message?: string }>(`/${appId}/license/validate`, {
    method: 'POST',
    body: JSON.stringify({ licenseKey }),
  });
}

export async function activateLicense(
  appId: string,
  licenseKey: string
): Promise<{ success: boolean; expiresAt?: string }> {
  return apiRequest<{ success: boolean; expiresAt?: string }>(`/${appId}/license/activate`, {
    method: 'POST',
    body: JSON.stringify({ licenseKey }),
  });
}

export async function deactivateLicense(appId: string): Promise<void> {
  return apiRequest<void>(`/${appId}/license/deactivate`, {
    method: 'POST',
  });
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const appsService = {
  // Store
  getAvailableApps,
  getAppDetails,
  getFeaturedApps,
  getAppsByCategory,

  // Installed
  getInstalledApps,
  installApp,
  uninstallApp,
  activateApp,
  deactivateApp,
  checkForUpdates,
  updateApp,

  // Config
  getAppConfig,
  updateAppConfig,
  resetAppConfig,

  // Access
  getUserAppAccess,
  setUserAppAccess,
  removeUserAppAccess,
  getAllUserAccess,
  bulkSetUserAccess,

  // Launch
  launchApp,
  getAppEntryPoint,

  // Stats
  getAppStats,
  getAllStats,
  recordAppUsage,

  // License
  validateLicense,
  activateLicense,
  deactivateLicense,
};

export default appsService;
