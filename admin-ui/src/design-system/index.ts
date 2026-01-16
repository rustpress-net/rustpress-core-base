/**
 * RustPress Design System
 * Enterprise-grade UI component library with beautiful animations
 *
 * @example
 * import { Button, Card, useTheme } from '@/design-system';
 *
 * function MyComponent() {
 *   const { isDark, toggleTheme } = useTheme();
 *   return (
 *     <Card variant="elevated">
 *       <Button onClick={toggleTheme}>
 *         {isDark ? 'Light Mode' : 'Dark Mode'}
 *       </Button>
 *     </Card>
 *   );
 * }
 */

// Design Tokens
export {
  tokens,
  colors,
  typography,
  spacing,
  radii,
  shadows,
  animation,
  breakpoints,
  zIndex,
  lightTheme,
  darkTheme,
} from './tokens';
export type { Theme, ThemeMode } from './tokens';

// Theme Provider
export {
  ThemeProvider,
  useTheme,
  useBreakpoint,
  useReducedMotion,
} from './ThemeProvider';

// Animations
export {
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
} from './animations';

// Utilities
export {
  cn,
  createVariants,
  generateId,
  formatBytes,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  truncate,
  capitalize,
  slugify,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  get,
  groupBy,
  sortBy,
  unique,
  percentage,
  colorUtils,
  keyboardUtils,
} from './utils';

// All Components
export * from './components';
