/**
 * Footer Manager Page - Appearance Section
 */

import React from 'react';
import { FooterManager as FooterManagerComponent } from '../../components/themes/FooterManager';

const FooterManagerPage: React.FC = () => {
  const handleSave = (config: any) => {
    console.log('Saving footer config:', config);
    // TODO: Integrate with theme store
  };

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
      <FooterManagerComponent onSave={handleSave} />
    </div>
  );
};

export default FooterManagerPage;
