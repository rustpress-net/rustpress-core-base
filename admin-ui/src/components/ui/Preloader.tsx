/**
 * Preloader - Animated loading component for RustPress
 * Can be used for route transitions, lazy loading, and data fetching
 */

import React from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show brand text */
  showBrand?: boolean;
  /** Show loading bar */
  showProgress?: boolean;
  /** Custom loading message */
  message?: string;
  /** Full screen overlay */
  fullScreen?: boolean;
  /** Transparent background */
  transparent?: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({
  size = 'md',
  showBrand = false,
  showProgress = false,
  message,
  fullScreen = false,
  transparent = false,
}) => {
  const sizeConfig = {
    sm: { wrapper: 'w-12 h-12', icon: 'text-lg', ring: 'border-2', inner: 'inset-2 border' },
    md: { wrapper: 'w-20 h-20', icon: 'text-2xl', ring: 'border-2', inner: 'inset-2 border-2' },
    lg: { wrapper: 'w-28 h-28', icon: 'text-4xl', ring: 'border-3', inner: 'inset-3 border-2' },
    xl: { wrapper: 'w-32 h-32', icon: 'text-5xl', ring: 'border-4', inner: 'inset-4 border-3' },
  };

  const config = sizeConfig[size];

  const content = (
    <div className="flex flex-col items-center gap-6">
      {/* Logo Animation */}
      <div className={`relative ${config.wrapper}`}>
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-4 bg-gradient-radial from-orange-500/20 to-transparent rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Outer ring */}
        <motion.div
          className={`absolute inset-0 ${config.ring} border-transparent border-t-orange-500 border-r-yellow-500 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: [0.68, -0.55, 0.27, 1.55] }}
        />

        {/* Inner ring */}
        <motion.div
          className={`absolute ${config.inner} border-transparent border-b-orange-500 border-l-yellow-500 rounded-full`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: [0.68, -0.55, 0.27, 1.55] }}
        />

        {/* Rust crab icon */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${config.icon}`}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span role="img" aria-label="Rust crab">🦀</span>
        </motion.div>
      </div>

      {/* Brand text */}
      {showBrand && (
        <motion.div
          className="flex items-center gap-1 text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Rust
          </span>
          <span className="text-gray-200">Press</span>
        </motion.div>
      )}

      {/* Loading bar */}
      {showProgress && (
        <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-[length:200%_100%]"
            animate={{
              width: ['0%', '70%', '100%'],
              backgroundPosition: ['0% 50%', '100% 50%', '200% 50%'],
            }}
            transition={{
              width: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              backgroundPosition: { duration: 1, repeat: Infinity, ease: 'linear' },
            }}
          />
        </div>
      )}

      {/* Loading message */}
      {message && (
        <motion.div
          className="flex items-center gap-1 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span>{message}</span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 bg-orange-500 rounded-full"
                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        </motion.div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          transparent ? 'bg-gray-900/80 backdrop-blur-sm' : 'bg-gray-900'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

// Simple spinner variant
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-transparent border-t-orange-500 border-r-orange-500/50 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
};

// Dot loader variant
export const DotLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-orange-500 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Skeleton loader for content
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}> = ({ className = '', variant = 'rectangular' }) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <motion.div
      className={`bg-gray-800 ${variantClasses[variant]} ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export default Preloader;
