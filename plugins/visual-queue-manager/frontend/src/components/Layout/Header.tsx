import { useState, useRef, useEffect } from 'react';
import { useUIStore, useAlertStore, useWebSocketStore } from '@store/index';
import { SearchInput } from '@components/common/Input';

export default function Header() {
  const { toggleSidebar, toggleCommandPalette, preferences } = useUIStore();
  const { unreadCount } = useAlertStore();
  const { connected } = useWebSocketStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        toggleCommandPalette();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div className="hidden sm:block w-64 lg:w-96">
          <SearchInput
            placeholder="Search... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            onFocus={toggleCommandPalette}
            inputSize="sm"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
            connected
              ? 'bg-success-500/10 text-success-500'
              : 'bg-danger-500/10 text-danger-500'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>

        {/* Refresh interval indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {preferences.refresh_interval / 1000}s
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="dropdown w-80 right-0">
              <div className="px-4 py-3 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Notification items would be mapped here */}
                    <div className="px-4 py-2 text-sm text-slate-300">
                      {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-700">
                <a href="/alerts" className="text-sm text-primary-400 hover:text-primary-300">
                  View all alerts
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="hidden sm:block p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-800 rounded-lg"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="dropdown right-0">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400">admin@example.com</p>
              </div>
              <div className="py-1">
                <a href="/settings" className="dropdown-item">
                  Settings
                </a>
                <a href="#" className="dropdown-item">
                  Documentation
                </a>
              </div>
              <div className="dropdown-divider" />
              <div className="py-1">
                <button className="dropdown-item text-danger-500">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
