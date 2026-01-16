/**
 * Header Manager Page - Appearance Section
 */

import React from 'react';
import { HeaderManager as HeaderManagerComponent } from '../../components/themes/HeaderManager';

const HeaderManagerPage: React.FC = () => {
  const handleSave = (config: any) => {
    console.log('Saving header config:', config);
    // TODO: Integrate with theme store
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <HeaderManagerComponent onSave={handleSave} />
    </div>
  );
};

export default HeaderManagerPage;
