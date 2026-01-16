/**
 * Services Index
 * Central export point for all service modules
 */

// Core Services
export * from './analyticsApi';
export * from './themeService';
export * from './fileSystemService';
export * from './gitService';
export * from './assetService';
export * from './appsService';

// IDE Services
export * from './debugService';
export * from './aiAssistantService';
export * from './tasksService';
export * from './codeIntelligenceService';
export * from './searchService';

// Default exports
export { default as analyticsApi } from './analyticsApi';
export { default as themeService } from './themeService';
export { default as fileSystemService } from './fileSystemService';
export { default as gitService } from './gitService';
export { default as assetService } from './assetService';
export { default as debugService } from './debugService';
export { default as aiAssistantService } from './aiAssistantService';
export { default as tasksService } from './tasksService';
export { default as codeIntelligenceService } from './codeIntelligenceService';
export { default as searchService } from './searchService';
export { default as appsService } from './appsService';
