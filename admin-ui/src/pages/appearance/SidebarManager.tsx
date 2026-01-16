/**
 * Sidebar Manager Page - Appearance Section
 */

import React from 'react';
import { SidebarManager as SidebarManagerComponent } from '../../components/themes/SidebarManager';

const SidebarManagerPage: React.FC = () => {
  return (
    <div className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarManagerComponent />
    </div>
  );
};

export default SidebarManagerPage;
