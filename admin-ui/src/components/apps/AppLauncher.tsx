/**
 * AppLauncher - Handles post-login app launching logic
 * - If user has only one app assigned, auto-launches it
 * - If user has multiple apps, shows selector modal
 * - If no apps assigned, proceeds to dashboard
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { AppSelectorModal } from './AppSelectorModal';
import type { InstalledApp } from '../../types/app';

interface AppLauncherProps {
  userId: string;
  onAppLaunch?: (app: InstalledApp) => void;
  onNoDashboard?: () => void;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({
  userId,
  onAppLaunch,
  onNoDashboard,
}) => {
  const { getUserApps, launchApp, userAppAccess } = useAppStore();
  const [showSelector, setShowSelector] = useState(false);
  const [userApps, setUserApps] = useState<InstalledApp[]>([]);

  useEffect(() => {
    // Get apps available to this user
    const apps = getUserApps(userId);
    setUserApps(apps);

    // Get user's default app
    const access = userAppAccess[userId];
    const defaultAppId = access?.defaultAppId;

    if (apps.length === 0) {
      // No apps assigned, proceed to dashboard
      onNoDashboard?.();
    } else if (apps.length === 1) {
      // Only one app, auto-launch
      const app = apps[0];
      launchApp(app.id);
      onAppLaunch?.(app);
    } else if (defaultAppId && apps.some((a) => a.id === defaultAppId)) {
      // Has default app, launch it
      const app = apps.find((a) => a.id === defaultAppId)!;
      launchApp(app.id);
      onAppLaunch?.(app);
    } else {
      // Multiple apps, show selector
      setShowSelector(true);
    }
  }, [userId, getUserApps, launchApp, userAppAccess, onAppLaunch, onNoDashboard]);

  const handleAppSelect = (app: InstalledApp) => {
    launchApp(app.id);
    setShowSelector(false);
    onAppLaunch?.(app);
  };

  const handleSkip = () => {
    setShowSelector(false);
    onNoDashboard?.();
  };

  if (!showSelector) return null;

  return (
    <AppSelectorModal
      apps={userApps}
      onSelect={handleAppSelect}
      onSkip={handleSkip}
    />
  );
};

export default AppLauncher;
