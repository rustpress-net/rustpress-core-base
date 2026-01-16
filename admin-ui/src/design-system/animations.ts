/**
 * RustPress Animation System
 * Enterprise-grade animation utilities and variants
 */

import { Variants, Transition } from 'framer-motion';
import { animation } from './tokens';

// ============================================
// BASE TRANSITIONS
// ============================================

export const transitions = {
  // Fast micro-interactions
  fast: {
    duration: 0.1,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Default smooth transition
  default: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Slower, more deliberate
  slow: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Spring physics
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Bouncy spring
  bounce: {
    type: 'spring',
    stiffness: 500,
    damping: 15,
  } as Transition,

  // Gentle spring
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  } as Transition,

  // Snappy for menus/dropdowns
  snappy: {
    duration: 0.15,
    ease: [0.2, 0, 0, 1],
  } as Transition,

  // Smooth for overlays
  smooth: {
    duration: 0.25,
    ease: [0.25, 0.1, 0.25, 1],
  } as Transition,
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.bounce,
  },
  exit: { opacity: 0, scale: 0.5 },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideInFromTop: Variants = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
};

export const slideInFromBottom: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

export const slideInFromLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
};

export const slideInFromRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
};

// ============================================
// CONTAINER ANIMATIONS (Stagger Children)
// ============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const staggerItemFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// ============================================
// MODAL & OVERLAY ANIMATIONS
// ============================================

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

export const slideOverContent: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    x: '100%',
    transition: transitions.snappy,
  },
};

export const drawerContent: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    x: '-100%',
    transition: transitions.snappy,
  },
};

// ============================================
// DROPDOWN & MENU ANIMATIONS
// ============================================

export const dropdownMenu: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -5,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: transitions.fast,
  },
};

export const contextMenu: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

export const menuItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

// ============================================
// TOOLTIP & POPOVER ANIMATIONS
// ============================================

export const tooltip: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.075 },
  },
};

export const popover: Variants = {
  initial: { opacity: 0, y: 5, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.snappy,
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.98,
    transition: transitions.fast,
  },
};

// ============================================
// NOTIFICATION & TOAST ANIMATIONS
// ============================================

export const toastSlideIn: Variants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: transitions.snappy,
  },
};

export const notificationPop: Variants = {
  initial: { opacity: 0, scale: 0.8, y: -20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.bounce,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: transitions.fast,
  },
};

// ============================================
// TABLE & LIST ANIMATIONS
// ============================================

export const tableRow: Variants = {
  initial: { opacity: 0, backgroundColor: 'transparent' },
  animate: { opacity: 1, backgroundColor: 'transparent' },
  exit: { opacity: 0, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
};

export const listItem: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.15, delay: 0.05 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.15, delay: 0.05 },
      opacity: { duration: 0.1 },
    },
  },
};

// ============================================
// ACCORDION & COLLAPSE ANIMATIONS
// ============================================

export const accordionContent: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.25 },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.2, delay: 0.05 },
      opacity: { duration: 0.15 },
    },
  },
};

export const rotateChevron: Variants = {
  initial: { rotate: 0 },
  animate: { rotate: 180 },
};

// ============================================
// TAB ANIMATIONS
// ============================================

export const tabContent: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const tabIndicator: Variants = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
};

// ============================================
// SKELETON & LOADING ANIMATIONS
// ============================================

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// BUTTON & INTERACTIVE ANIMATIONS
// ============================================

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.15 },
};

export const iconSpin: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

export const checkmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageSlide: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast,
  },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const pageScale: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: transitions.fast,
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a stagger container with custom timing
 */
export function createStaggerContainer(
  staggerChildren: number = 0.05,
  delayChildren: number = 0.1
): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerChildren / 2,
        staggerDirection: -1,
      },
    },
  };
}

/**
 * Create a fade animation with custom offset
 */
export function createFadeIn(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  offset: number = 10
): Variants {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? offset : -offset;

  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: value },
  };
}

/**
 * Get animation variants based on reduced motion preference
 */
export function getReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
}

export default {
  transitions,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleUp,
  popIn,
  slideInFromTop,
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
  staggerContainer,
  staggerContainerSlow,
  staggerItem,
  staggerItemFade,
  staggerItemScale,
  modalOverlay,
  modalContent,
  slideOverContent,
  drawerContent,
  dropdownMenu,
  contextMenu,
  menuItem,
  tooltip,
  popover,
  toastSlideIn,
  notificationPop,
  tableRow,
  listItem,
  accordionContent,
  rotateChevron,
  tabContent,
  tabIndicator,
  shimmer,
  pulse,
  spin,
  buttonTap,
  buttonHover,
  iconSpin,
  checkmark,
  pageSlide,
  pageFade,
  pageScale,
  createStaggerContainer,
  createFadeIn,
  getReducedMotionVariants,
};
