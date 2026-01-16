/**
 * AppStore - Browse and install apps from the marketplace
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Search, Filter, Grid3X3, List, Download, Star,
  Crown, Shield, Check, X, ChevronDown, Sparkles,
  Briefcase, BarChart3, ShoppingCart, MessageSquare,
  Workflow, Wrench, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { AppCard } from '../../components/apps/AppCard';
import type { App, AppCategory } from '../../types/app';
import { APP_CATEGORIES } from '../../types/app';

type ViewMode = 'grid' | 'list';
type PriceFilter = 'all' | 'free' | 'paid';
type SortBy = 'popular' | 'recent' | 'rating' | 'name';

// Category icons mapping
const categoryIcons: Record<AppCategory, React.ElementType> = {
  productivity: Briefcase,
  analytics: BarChart3,
  ecommerce: ShoppingCart,
  communication: MessageSquare,
  automation: Workflow,
  security: Shield,
  utilities: Wrench,
};

// Featured Apps Carousel Component
interface FeaturedCarouselProps {
  apps: App[];
  isInstalled: (appId: string) => boolean;
  onInstall: (app: App) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ apps, isInstalled, onInstall }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || apps.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % apps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, apps.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + apps.length) % apps.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % apps.length);
    setIsAutoPlaying(false);
  };

  const currentApp = apps[currentIndex];
  if (!currentApp) return null;

  // Background gradients for different apps
  const gradients = [
    'from-purple-600/40 via-blue-600/40 to-pink-600/40',
    'from-emerald-600/40 via-teal-600/40 to-cyan-600/40',
    'from-orange-600/40 via-red-600/40 to-rose-600/40',
    'from-indigo-600/40 via-violet-600/40 to-purple-600/40',
    'from-amber-600/40 via-yellow-600/40 to-lime-600/40',
  ];

  return (
    <div
      ref={carouselRef}
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className={`relative bg-gradient-to-br ${gradients[currentIndex % gradients.length]} p-8`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

          <div className="relative z-10 flex items-center gap-8">
            {/* App Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0"
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>

            {/* App Info */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-2"
              >
                <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-500/20 text-yellow-300 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> FEATURED
                </span>
                {currentApp.verified && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-2xl font-bold text-white mb-2"
              >
                {currentApp.name}
              </motion.h2>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-200 mb-4 line-clamp-2"
              >
                {currentApp.description}
              </motion.p>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-4"
              >
                {/* Rating */}
                {currentApp.rating && (
                  <div className="flex items-center gap-1 text-yellow-300">
                    <Star className="w-4 h-4 fill-yellow-300" />
                    <span className="font-semibold">{currentApp.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Downloads */}
                {currentApp.downloadCount && (
                  <span className="text-gray-300 text-sm">
                    {currentApp.downloadCount.toLocaleString()} downloads
                  </span>
                )}

                {/* Price */}
                <span className="text-white font-semibold">
                  {currentApp.pricing.type === 'free'
                    ? 'Free'
                    : currentApp.pricing.type === 'membership'
                    ? `$${currentApp.pricing.price}/${currentApp.pricing.billingPeriod}`
                    : `$${currentApp.pricing.price}`}
                </span>
              </motion.div>
            </div>

            {/* Install Button */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex-shrink-0"
            >
              {isInstalled(currentApp.id) ? (
                <span className="px-6 py-3 bg-green-500/20 text-green-300 rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-5 h-5" />
                  Installed
                </span>
              ) : (
                <button
                  onClick={() => onInstall(currentApp)}
                  className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Install Now
                </button>
              )}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          {apps.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {apps.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {apps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-white'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const AppStorePage: React.FC = () => {
  const {
    availableApps,
    installedApps,
    installApp,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [activeTab, setActiveTab] = useState<'browse' | 'featured' | 'categories'>('browse');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');

  // Check if app is already installed
  const isInstalled = (appId: string) => installedApps.some((a) => a.id === appId);

  // Filter and sort apps
  const filteredApps = useMemo(() => {
    let apps = [...availableApps];

    // Filter by search
    if (searchQuery) {
      apps = apps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by price
    if (priceFilter !== 'all') {
      apps = apps.filter((app) =>
        priceFilter === 'free' ? app.pricing.type === 'free' : app.pricing.type !== 'free'
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      apps = apps.filter((app) => app.category === categoryFilter);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        apps.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      case 'rating':
        apps.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        apps.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        // Assume apps are already sorted by recent
        break;
    }

    return apps;
  }, [availableApps, searchQuery, priceFilter, categoryFilter, sortBy]);

  // Featured apps
  const featuredApps = useMemo(
    () => availableApps.filter((app) => app.featured),
    [availableApps]
  );

  // Apps by category
  const appsByCategory = useMemo(() => {
    const grouped: Record<AppCategory, App[]> = {
      productivity: [],
      analytics: [],
      ecommerce: [],
      communication: [],
      automation: [],
      security: [],
      utilities: [],
    };
    availableApps.forEach((app) => {
      grouped[app.category].push(app);
    });
    return grouped;
  }, [availableApps]);

  const handleInstall = (app: App) => {
    if (app.pricing.type === 'free') {
      installApp(app);
    } else {
      setSelectedApp(app);
      setShowInstallModal(true);
    }
  };

  const confirmInstall = () => {
    if (selectedApp) {
      installApp(selectedApp, licenseKey || undefined);
      setShowInstallModal(false);
      setSelectedApp(null);
      setLicenseKey('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Store className="w-8 h-8 text-purple-400" />
              App Store
            </h1>
            <p className="text-gray-400 mt-1">
              Discover and install apps to extend your RustPress
            </p>
          </div>
        </div>

        {/* Featured Apps Carousel */}
        {featuredApps.length > 0 && (
          <FeaturedCarousel
            apps={featuredApps}
            isInstalled={isInstalled}
            onInstall={handleInstall}
          />
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-0">
          {(['browse', 'featured', 'categories'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'browse' && 'Browse All'}
              {tab === 'featured' && (
                <span className="flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Featured
                </span>
              )}
              {tab === 'categories' && 'Categories'}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl p-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Price filter */}
              <div className="relative">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as AppCategory | 'all')}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(APP_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="appearance-none px-4 py-2 pr-8 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Added</option>
                  <option value="name">Name A-Z</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Apps Grid/List */}
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-800 border border-gray-700 rounded-xl">
                <Store className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No apps found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    variant={viewMode}
                    isInstalled={isInstalled(app.id)}
                    onInstall={() => handleInstall(app)}
                    showActions={!isInstalled(app.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Featured Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-pink-600/30 p-8">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Featured Apps</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Discover the Best Apps
                </h2>
                <p className="text-gray-300 max-w-xl">
                  Hand-picked applications that deliver exceptional value and are trusted by
                  thousands of RustPress users.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Featured Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  variant="grid"
                  isInstalled={isInstalled(app.id)}
                  onInstall={() => handleInstall(app)}
                  showActions={!isInstalled(app.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {Object.entries(APP_CATEGORIES).map(([key, category]) => {
              const apps = appsByCategory[key as AppCategory];
              if (apps.length === 0) return null;
              const CategoryIcon = categoryIcons[key as AppCategory];
              return (
                <div key={key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <CategoryIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{category.label}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{apps.length} apps</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apps.slice(0, 3).map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        variant="grid"
                        isInstalled={isInstalled(app.id)}
                        onInstall={() => handleInstall(app)}
                        showActions={!isInstalled(app.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Install Modal */}
        <AnimatePresence>
          {showInstallModal && selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowInstallModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Download className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Install {selectedApp.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedApp.pricing.type === 'membership'
                        ? `$${selectedApp.pricing.price}/${selectedApp.pricing.billingPeriod}`
                        : `$${selectedApp.pricing.price} one-time`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      License Key
                    </label>
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="Enter your license key..."
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Purchase a license from the app developer if you don't have one
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowInstallModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmInstall}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppStorePage;
