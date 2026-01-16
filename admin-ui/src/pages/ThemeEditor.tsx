/**
 * Theme Editor Page
 * VS Code-like IDE for editing RustPress project source files
 * Simplified wrapper around the IDE component
 */

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { IDE } from '../components/ide';

export default function ThemeEditor() {
  return (
    <>
      <div className="h-screen w-screen overflow-hidden">
        <IDE
          projectName="RustPress"
          projectVersion="1.0.0"
          initialFolder="themes"
        />
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </>
  );
}
