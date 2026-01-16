/**
 * Google Analytics API Service
 *
 * Provides API methods for fetching analytics data from the RustAnalytics plugin.
 */

import { api as apiClient } from '../api/client';

// Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  dateRange?: string;
  compare?: boolean;
  limit?: number;
  offset?: number;
}

// Overview Types
export interface OverviewMetrics {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  pagesPerSession: number;
  avgSessionDuration: number;
  bounceRate: number;
  goalCompletions: number;
  goalValue: number;
  transactions: number;
  revenue: number;
  comparison?: MetricsComparison;
}

export interface MetricsComparison {
  sessions: number;
  users: number;
  newUsers: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface TrafficDataPoint {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number;
  conversions: number;
  revenue: number;
}

export interface TopPage {
  pagePath: string;
  pageTitle: string;
  pageviews: number;
  uniquePageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  entrances: number;
}

export interface GeoData {
  country: string;
  countryCode: string;
  sessions: number;
  users: number;
  bounceRate: number;
  pagesPerSession: number;
}

export interface ChannelData {
  channel: string;
  sessions: number;
  users: number;
  newUsers: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface Referrer {
  source: string;
  sessions: number;
  users: number;
  bounceRate: number;
  pagesPerSession: number;
}

// Realtime Types
export interface RealtimeOverview {
  activeUsers: number;
  activeUsersPerMinute: number[];
  topActivePages: ActivePage[];
  topTrafficSources: RealtimeSource[];
  topCountries: RealtimeCountry[];
  deviceBreakdown: DeviceBreakdown;
  screenResolutions: ScreenResolution[];
  userTypes: UserType[];
}

export interface ActivePage {
  pagePath: string;
  pageTitle: string;
  activeUsers: number;
}

export interface RealtimeSource {
  source: string;
  medium: string;
  activeUsers: number;
}

export interface RealtimeCountry {
  country: string;
  countryCode: string;
  activeUsers: number;
}

export interface DeviceBreakdown {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface ScreenResolution {
  resolution: string;
  users: number;
}

export interface UserType {
  userType: string;
  users: number;
}

// Audience Types
export interface AudienceOverview {
  users: number;
  newUsers: number;
  returningUsers: number;
  sessionsPerUser: number;
  avgSessionDuration: number;
  bounceRate: number;
  demographics: Demographics;
  interests: Interest[];
  geoData: GeoData[];
  technology: Technology;
  mobile: MobileOverview;
  behavior: BehaviorMetrics;
}

export interface Demographics {
  age: AgeGroup[];
  gender: GenderGroup[];
}

export interface AgeGroup {
  ageRange: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface GenderGroup {
  gender: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface Interest {
  category: string;
  users: number;
  sessions: number;
}

export interface Technology {
  browsers: BrowserData[];
  operatingSystems: OSData[];
  screenResolutions: ScreenResolution[];
}

export interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface OSData {
  os: string;
  users: number;
  sessions: number;
}

export interface MobileOverview {
  devices: DeviceData[];
  brands: BrandData[];
  screenSizes: ScreenSizeData[];
  operatingSystems: MobileOS[];
}

export interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface BrandData {
  brand: string;
  users: number;
  sessions: number;
}

export interface ScreenSizeData {
  size: string;
  users: number;
}

export interface MobileOS {
  os: string;
  version: string;
  users: number;
}

export interface BehaviorMetrics {
  newVsReturning: UserSegment[];
  frequency: FrequencyData[];
  engagement: EngagementData;
}

export interface UserSegment {
  segment: string;
  users: number;
  sessions: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number;
}

export interface FrequencyData {
  sessionsCount: string;
  users: number;
}

export interface EngagementData {
  sessionDurationBuckets: DurationBucket[];
  pageDepthBuckets: PageDepthBucket[];
}

export interface DurationBucket {
  duration: string;
  sessions: number;
}

export interface PageDepthBucket {
  pageDepth: string;
  sessions: number;
}

// Acquisition Types
export interface AcquisitionOverview {
  channels: ChannelData[];
  sourceMedium: TrafficSource[];
  referrals: Referrer[];
  campaigns: CampaignData[];
  social: SocialData[];
  searchConsole: SearchConsoleData;
}

export interface CampaignData {
  campaign: string;
  source: string;
  medium: string;
  sessions: number;
  users: number;
  newUsers: number;
  bounceRate: number;
  pagesPerSession: number;
  conversions: number;
  revenue: number;
}

export interface SocialData {
  network: string;
  sessions: number;
  users: number;
  pageviews: number;
  avgSessionDuration: number;
}

export interface SearchConsoleData {
  queries: SearchQuery[];
  pages: SearchPage[];
  countries: SearchCountry[];
  devices: SearchDevice[];
}

export interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchCountry {
  country: string;
  clicks: number;
  impressions: number;
}

export interface SearchDevice {
  device: string;
  clicks: number;
  impressions: number;
}

// Behavior Types
export interface BehaviorOverview {
  pageviews: number;
  uniquePageviews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  siteContent: SiteContent;
  siteSpeed: SiteSpeed;
  siteSearch: SiteSearch;
  events: EventsOverview;
}

export interface SiteContent {
  allPages: TopPage[];
  landingPages: LandingPage[];
  exitPages: ExitPage[];
  contentDrilldown: ContentCategory[];
}

export interface LandingPage {
  pagePath: string;
  sessions: number;
  percentNewSessions: number;
  newUsers: number;
  bounceRate: number;
  pagesPerSession: number;
  avgSessionDuration: number;
  conversions: number;
}

export interface ExitPage {
  pagePath: string;
  exits: number;
  pageviews: number;
  exitRate: number;
}

export interface ContentCategory {
  category: string;
  pageviews: number;
  uniquePageviews: number;
  avgTimeOnPage: number;
}

export interface SiteSpeed {
  avgPageLoadTime: number;
  avgServerResponseTime: number;
  avgDomInteractiveTime: number;
  avgDomContentLoadedTime: number;
  avgRedirectionTime: number;
  pageTimings: PageTiming[];
  suggestions: SpeedSuggestion[];
}

export interface PageTiming {
  pagePath: string;
  pageviews: number;
  avgPageLoadTime: number;
  avgServerResponseTime: number;
}

export interface SpeedSuggestion {
  page: string;
  score: number;
  suggestions: string[];
}

export interface SiteSearch {
  searchUniques: number;
  searchSessions: number;
  searchResultViews: number;
  searchExits: number;
  searchRefinements: number;
  searchDuration: number;
  searchDepth: number;
  searchTerms: SearchTerm[];
  searchPages: SearchPageData[];
}

export interface SearchTerm {
  term: string;
  searches: number;
  searchUniques: number;
  searchResultViews: number;
  searchExitRate: number;
}

export interface SearchPageData {
  page: string;
  searches: number;
  searchUniques: number;
}

export interface EventsOverview {
  totalEvents: number;
  uniqueEvents: number;
  eventValue: number;
  eventCategories: EventCategory[];
  topEvents: EventData[];
}

export interface EventCategory {
  category: string;
  totalEvents: number;
  uniqueEvents: number;
  eventValue: number;
}

export interface EventData {
  category: string;
  action: string;
  label: string;
  totalEvents: number;
  uniqueEvents: number;
  eventValue: number;
}

// Conversions Types
export interface ConversionsOverview {
  goals: GoalOverview;
  ecommerce: EcommerceOverview;
  multiChannel: MultiChannelData;
  attribution: AttributionData;
}

export interface GoalOverview {
  totalCompletions: number;
  totalValue: number;
  conversionRate: number;
  goals: GoalData[];
  goalFlow: GoalFlow[];
}

export interface GoalData {
  goalId: string;
  goalName: string;
  completions: number;
  value: number;
  conversionRate: number;
  abandonmentRate: number;
}

export interface GoalFlow {
  step: string;
  sessions: number;
  dropoff: number;
}

export interface MultiChannelData {
  assistedConversions: number;
  assistedConversionValue: number;
  lastClickConversions: number;
  lastClickValue: number;
  pathLength: PathLengthData[];
  topConversionPaths: ConversionPath[];
}

export interface PathLengthData {
  length: number;
  conversions: number;
  value: number;
}

export interface ConversionPath {
  path: string[];
  conversions: number;
  value: number;
}

export interface AttributionData {
  models: AttributionModel[];
  comparison: AttributionComparison[];
}

export interface AttributionModel {
  model: string;
  conversions: number;
  value: number;
}

export interface AttributionComparison {
  channel: string;
  lastClick: number;
  firstClick: number;
  linear: number;
  timeDec: number;
  positionBased: number;
}

// E-commerce Types
export interface EcommerceOverview {
  revenue: number;
  transactions: number;
  avgOrderValue: number;
  ecommerceConversionRate: number;
  revenuePerSession: number;
  itemQuantity: number;
  uniquePurchases: number;
  products: ProductData[];
  categories: CategoryData[];
  brands: BrandSalesData[];
  shoppingBehavior: ShoppingBehavior;
  checkoutBehavior: CheckoutBehavior;
}

export interface ProductData {
  productId: string;
  productName: string;
  productCategory: string;
  productBrand: string;
  revenue: number;
  quantity: number;
  avgPrice: number;
  avgQuantity: number;
  cartToDetailRate: number;
  buyToDetailRate: number;
}

export interface CategoryData {
  category: string;
  revenue: number;
  transactions: number;
  quantity: number;
  avgPrice: number;
}

export interface BrandSalesData {
  brand: string;
  revenue: number;
  transactions: number;
  quantity: number;
}

export interface ShoppingBehavior {
  sessions: number;
  sessionsWithProductView: number;
  sessionsWithAddToCart: number;
  sessionsWithCheckout: number;
  sessionsWithTransaction: number;
  productViewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToTransactionRate: number;
}

export interface CheckoutBehavior {
  sessions: number;
  checkoutSteps: CheckoutStep[];
}

export interface CheckoutStep {
  step: number;
  name: string;
  sessions: number;
  dropoffRate: number;
}

// Settings Types
export interface AnalyticsSettings {
  gaPropertyId: string;
  gaMeasurementId: string;
  serviceAccountJson?: string;
  enableTracking: boolean;
  trackLoggedInUsers: boolean;
  trackAdminUsers: boolean;
  anonymizeIp: boolean;
  respectDnt: boolean;
  cookieConsentRequired: boolean;
  enhancedLinkAttribution: boolean;
  enhancedEcommerce: boolean;
  defaultDateRange: string;
  showRealtimeWidget: boolean;
  showTrafficWidget: boolean;
  showToppagesWidget: boolean;
  showAcquisitionWidget: boolean;
  reportEmailEnabled: boolean;
  reportEmailRecipients: string[];
  reportFrequency: string;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  propertyName?: string;
  accountName?: string;
  error?: string;
  quotaRemaining?: number;
}

export interface PropertyOption {
  propertyId: string;
  displayName: string;
  accountName: string;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  dateRange: DateRange;
  dimensions: string[];
  metrics: string[];
  filters?: ReportFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  schedule?: ReportSchedule;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

export interface ReportSchedule {
  frequency: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  timezone: string;
  recipients: string[];
}

export interface ReportResult {
  reportId: string;
  data: Record<string, unknown>[];
  totals?: Record<string, number>;
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  rowCount: number;
  executionTime: number;
  samplingLevel?: string;
  dataFreshness?: string;
}

// Sync Types
export interface SyncStatus {
  isSyncing: boolean;
  lastSync?: string;
  lastSyncStatus?: SyncResult;
  nextScheduledSync?: string;
  totalSyncs: number;
  failedSyncs: number;
}

export interface SyncResult {
  type: 'success' | 'partial' | 'failed';
  recordsSynced?: number;
  errors?: string[];
  durationMs: number;
}

// Cache Types
export interface CacheStats {
  memoryEntries: number;
  memorySizeBytes: number;
  expiredEntries: number;
  maxEntries: number;
  cacheDurationMinutes: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    cached: boolean;
    requestId: string;
    timestamp: string;
  };
}

// API Functions
const BASE_URL = '/api/plugins/rustanalytics';

// Overview endpoints
export async function getOverview(query?: AnalyticsQuery): Promise<OverviewMetrics> {
  const response = await apiClient.get<ApiResponse<OverviewMetrics>>(`${BASE_URL}/overview`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getRealtime(): Promise<RealtimeOverview> {
  const response = await apiClient.get<ApiResponse<RealtimeOverview>>(`${BASE_URL}/realtime`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getRealtimeActiveUsers(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ activeUsers: number }>>(`${BASE_URL}/realtime/active-users`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!.activeUsers;
}

export async function getTrafficData(query?: AnalyticsQuery): Promise<TrafficDataPoint[]> {
  const response = await apiClient.get<ApiResponse<TrafficDataPoint[]>>(`${BASE_URL}/traffic`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getTrafficSources(query?: AnalyticsQuery): Promise<TrafficSource[]> {
  const response = await apiClient.get<ApiResponse<TrafficSource[]>>(`${BASE_URL}/sources`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getTopPages(query?: AnalyticsQuery): Promise<TopPage[]> {
  const response = await apiClient.get<ApiResponse<TopPage[]>>(`${BASE_URL}/pages`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getGeoData(query?: AnalyticsQuery): Promise<GeoData[]> {
  const response = await apiClient.get<ApiResponse<GeoData[]>>(`${BASE_URL}/geo`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Audience endpoints
export async function getAudienceOverview(query?: AnalyticsQuery): Promise<AudienceOverview> {
  const response = await apiClient.get<ApiResponse<AudienceOverview>>(`${BASE_URL}/audience`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getDemographics(query?: AnalyticsQuery): Promise<Demographics> {
  const response = await apiClient.get<ApiResponse<Demographics>>(`${BASE_URL}/audience/demographics`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getTechnology(query?: AnalyticsQuery): Promise<Technology> {
  const response = await apiClient.get<ApiResponse<Technology>>(`${BASE_URL}/audience/technology`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getMobile(query?: AnalyticsQuery): Promise<MobileOverview> {
  const response = await apiClient.get<ApiResponse<MobileOverview>>(`${BASE_URL}/audience/mobile`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getAudienceBehavior(query?: AnalyticsQuery): Promise<BehaviorMetrics> {
  const response = await apiClient.get<ApiResponse<BehaviorMetrics>>(`${BASE_URL}/audience/behavior`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Acquisition endpoints
export async function getAcquisitionOverview(query?: AnalyticsQuery): Promise<AcquisitionOverview> {
  const response = await apiClient.get<ApiResponse<AcquisitionOverview>>(`${BASE_URL}/acquisition`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getChannels(query?: AnalyticsQuery): Promise<ChannelData[]> {
  const response = await apiClient.get<ApiResponse<ChannelData[]>>(`${BASE_URL}/acquisition/channels`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSourceMedium(query?: AnalyticsQuery): Promise<TrafficSource[]> {
  const response = await apiClient.get<ApiResponse<TrafficSource[]>>(`${BASE_URL}/acquisition/source-medium`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getReferrals(query?: AnalyticsQuery): Promise<Referrer[]> {
  const response = await apiClient.get<ApiResponse<Referrer[]>>(`${BASE_URL}/acquisition/referrals`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getCampaigns(query?: AnalyticsQuery): Promise<CampaignData[]> {
  const response = await apiClient.get<ApiResponse<CampaignData[]>>(`${BASE_URL}/acquisition/campaigns`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSocial(query?: AnalyticsQuery): Promise<SocialData[]> {
  const response = await apiClient.get<ApiResponse<SocialData[]>>(`${BASE_URL}/acquisition/social`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSearchConsole(query?: AnalyticsQuery): Promise<SearchConsoleData> {
  const response = await apiClient.get<ApiResponse<SearchConsoleData>>(`${BASE_URL}/acquisition/search-console`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Behavior endpoints
export async function getBehaviorOverview(query?: AnalyticsQuery): Promise<BehaviorOverview> {
  const response = await apiClient.get<ApiResponse<BehaviorOverview>>(`${BASE_URL}/behavior`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSiteContent(query?: AnalyticsQuery): Promise<SiteContent> {
  const response = await apiClient.get<ApiResponse<SiteContent>>(`${BASE_URL}/behavior/content`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getLandingPages(query?: AnalyticsQuery): Promise<LandingPage[]> {
  const response = await apiClient.get<ApiResponse<LandingPage[]>>(`${BASE_URL}/behavior/landing-pages`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getExitPages(query?: AnalyticsQuery): Promise<ExitPage[]> {
  const response = await apiClient.get<ApiResponse<ExitPage[]>>(`${BASE_URL}/behavior/exit-pages`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSiteSpeed(query?: AnalyticsQuery): Promise<SiteSpeed> {
  const response = await apiClient.get<ApiResponse<SiteSpeed>>(`${BASE_URL}/behavior/speed`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSiteSearch(query?: AnalyticsQuery): Promise<SiteSearch> {
  const response = await apiClient.get<ApiResponse<SiteSearch>>(`${BASE_URL}/behavior/search`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getEvents(query?: AnalyticsQuery): Promise<EventsOverview> {
  const response = await apiClient.get<ApiResponse<EventsOverview>>(`${BASE_URL}/behavior/events`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Conversions endpoints
export async function getGoals(query?: AnalyticsQuery): Promise<GoalOverview> {
  const response = await apiClient.get<ApiResponse<GoalOverview>>(`${BASE_URL}/conversions/goals`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getFunnel(goalId: string, query?: AnalyticsQuery): Promise<GoalFlow[]> {
  const response = await apiClient.get<ApiResponse<GoalFlow[]>>(`${BASE_URL}/conversions/funnel/${goalId}`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getMultiChannel(query?: AnalyticsQuery): Promise<MultiChannelData> {
  const response = await apiClient.get<ApiResponse<MultiChannelData>>(`${BASE_URL}/conversions/multi-channel`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getAttribution(query?: AnalyticsQuery): Promise<AttributionData> {
  const response = await apiClient.get<ApiResponse<AttributionData>>(`${BASE_URL}/conversions/attribution`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// E-commerce endpoints
export async function getEcommerceOverview(query?: AnalyticsQuery): Promise<EcommerceOverview> {
  const response = await apiClient.get<ApiResponse<EcommerceOverview>>(`${BASE_URL}/ecommerce`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getProducts(query?: AnalyticsQuery): Promise<ProductData[]> {
  const response = await apiClient.get<ApiResponse<ProductData[]>>(`${BASE_URL}/ecommerce/products`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSales(query?: AnalyticsQuery): Promise<CategoryData[]> {
  const response = await apiClient.get<ApiResponse<CategoryData[]>>(`${BASE_URL}/ecommerce/sales`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getTransactions(query?: AnalyticsQuery): Promise<Record<string, unknown>[]> {
  const response = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(`${BASE_URL}/ecommerce/transactions`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getShoppingBehavior(query?: AnalyticsQuery): Promise<ShoppingBehavior> {
  const response = await apiClient.get<ApiResponse<ShoppingBehavior>>(`${BASE_URL}/ecommerce/shopping-behavior`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getCheckoutBehavior(query?: AnalyticsQuery): Promise<CheckoutBehavior> {
  const response = await apiClient.get<ApiResponse<CheckoutBehavior>>(`${BASE_URL}/ecommerce/checkout-behavior`, { params: query });
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Reports endpoints
export async function listReports(): Promise<Report[]> {
  const response = await apiClient.get<ApiResponse<Report[]>>(`${BASE_URL}/reports`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getReport(reportId: string): Promise<Report> {
  const response = await apiClient.get<ApiResponse<Report>>(`${BASE_URL}/reports/${reportId}`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
  const response = await apiClient.post<ApiResponse<Report>>(`${BASE_URL}/reports`, report);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function updateReport(reportId: string, report: Partial<Report>): Promise<Report> {
  const response = await apiClient.put<ApiResponse<Report>>(`${BASE_URL}/reports/${reportId}`, report);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function deleteReport(reportId: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`${BASE_URL}/reports/${reportId}`);
  if (!response.data.success) throw new Error(response.data.error);
}

export async function runReport(reportId: string): Promise<ReportResult> {
  const response = await apiClient.post<ApiResponse<ReportResult>>(`${BASE_URL}/reports/${reportId}/run`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function exportReport(reportId: string, format: 'csv' | 'json' | 'pdf' | 'excel'): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/reports/${reportId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}

// Settings endpoints
export async function getSettings(): Promise<AnalyticsSettings> {
  const response = await apiClient.get<ApiResponse<AnalyticsSettings>>(`${BASE_URL}/settings`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function updateSettings(settings: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
  const response = await apiClient.put<ApiResponse<AnalyticsSettings>>(`${BASE_URL}/settings`, settings);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function testConnection(): Promise<ConnectionTestResult> {
  const response = await apiClient.post<ApiResponse<ConnectionTestResult>>(`${BASE_URL}/settings/test-connection`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getAvailableProperties(): Promise<PropertyOption[]> {
  const response = await apiClient.get<ApiResponse<PropertyOption[]>>(`${BASE_URL}/settings/properties`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

// Data management endpoints
export async function syncData(): Promise<SyncResult> {
  const response = await apiClient.post<ApiResponse<SyncResult>>(`${BASE_URL}/sync`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const response = await apiClient.get<ApiResponse<SyncStatus>>(`${BASE_URL}/sync/status`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function clearCache(): Promise<void> {
  const response = await apiClient.post<ApiResponse<void>>(`${BASE_URL}/cache/clear`);
  if (!response.data.success) throw new Error(response.data.error);
}

export async function getCacheStats(): Promise<CacheStats> {
  const response = await apiClient.get<ApiResponse<CacheStats>>(`${BASE_URL}/cache/stats`);
  if (!response.data.success) throw new Error(response.data.error);
  return response.data.data!;
}

export async function exportData(query?: AnalyticsQuery & { format?: string }): Promise<Blob> {
  const response = await apiClient.get(`${BASE_URL}/export`, {
    params: query,
    responseType: 'blob',
  });
  return response.data;
}
