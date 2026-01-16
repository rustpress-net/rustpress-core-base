/**
 * SpotlightTour Component
 *
 * Enterprise-grade feature spotlight and guided tours:
 * - Step-by-step product tours
 * - Feature spotlights with overlays
 * - Tooltips with navigation
 * - Progress indicators
 * - Keyboard navigation
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lightbulb,
  ArrowRight,
  Check,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type SpotlightPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'center';

export interface TourStep {
  id: string;
  target?: string; // CSS selector or ref
  title: string;
  content: React.ReactNode;
  placement?: SpotlightPlacement;
  spotlightPadding?: number;
  disableOverlay?: boolean;
  disableInteraction?: boolean;
  onBeforeShow?: () => void | Promise<void>;
  onAfterShow?: () => void;
  onBeforeHide?: () => void | Promise<void>;
  onAfterHide?: () => void;
  showSkip?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SpotlightTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
  initialStep?: number;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowSkip?: boolean;
  allowClose?: boolean;
  scrollBehavior?: 'smooth' | 'auto' | 'none';
  overlayColor?: string;
  overlayOpacity?: number;
  className?: string;
}

export interface SpotlightProps {
  target: string | HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  placement?: SpotlightPlacement;
  padding?: number;
  showOverlay?: boolean;
  overlayOpacity?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export interface FeatureHighlightProps {
  target: string | HTMLElement | null;
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  placement?: SpotlightPlacement;
  badge?: string;
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

interface TourContextValue {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  close: () => void;
  skip: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext() {
  return useContext(TourContext);
}

// ============================================================================
// Helper Functions
// ============================================================================

function getElementFromTarget(target: string | HTMLElement | null): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target;
}

function calculateSpotlightPosition(
  targetRect: DOMRect,
  contentRect: DOMRect,
  placement: SpotlightPlacement,
  padding: number
): { top: number; left: number; actualPlacement: SpotlightPlacement } {
  const margin = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = 0;
  let left = 0;
  let actualPlacement = placement;

  // Calculate initial position
  switch (placement) {
    case 'top':
      top = targetRect.top - contentRect.height - margin - padding;
      left = targetRect.left + (targetRect.width - contentRect.width) / 2;
      break;
    case 'top-start':
      top = targetRect.top - contentRect.height - margin - padding;
      left = targetRect.left - padding;
      break;
    case 'top-end':
      top = targetRect.top - contentRect.height - margin - padding;
      left = targetRect.right - contentRect.width + padding;
      break;
    case 'bottom':
      top = targetRect.bottom + margin + padding;
      left = targetRect.left + (targetRect.width - contentRect.width) / 2;
      break;
    case 'bottom-start':
      top = targetRect.bottom + margin + padding;
      left = targetRect.left - padding;
      break;
    case 'bottom-end':
      top = targetRect.bottom + margin + padding;
      left = targetRect.right - contentRect.width + padding;
      break;
    case 'left':
      top = targetRect.top + (targetRect.height - contentRect.height) / 2;
      left = targetRect.left - contentRect.width - margin - padding;
      break;
    case 'left-start':
      top = targetRect.top - padding;
      left = targetRect.left - contentRect.width - margin - padding;
      break;
    case 'left-end':
      top = targetRect.bottom - contentRect.height + padding;
      left = targetRect.left - contentRect.width - margin - padding;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height - contentRect.height) / 2;
      left = targetRect.right + margin + padding;
      break;
    case 'right-start':
      top = targetRect.top - padding;
      left = targetRect.right + margin + padding;
      break;
    case 'right-end':
      top = targetRect.bottom - contentRect.height + padding;
      left = targetRect.right + margin + padding;
      break;
    case 'center':
      top = (viewportHeight - contentRect.height) / 2;
      left = (viewportWidth - contentRect.width) / 2;
      break;
  }

  // Collision detection
  if (left < margin) left = margin;
  if (left + contentRect.width > viewportWidth - margin) {
    left = viewportWidth - contentRect.width - margin;
  }
  if (top < margin) {
    if (placement.startsWith('top')) {
      actualPlacement = placement.replace('top', 'bottom') as SpotlightPlacement;
      top = targetRect.bottom + margin + padding;
    } else {
      top = margin;
    }
  }
  if (top + contentRect.height > viewportHeight - margin) {
    if (placement.startsWith('bottom')) {
      actualPlacement = placement.replace('bottom', 'top') as SpotlightPlacement;
      top = targetRect.top - contentRect.height - margin - padding;
    } else {
      top = viewportHeight - contentRect.height - margin;
    }
  }

  return { top, left, actualPlacement };
}

// ============================================================================
// Spotlight Overlay Component
// ============================================================================

interface SpotlightOverlayProps {
  targetRect: DOMRect | null;
  padding: number;
  color: string;
  opacity: number;
  onClick?: () => void;
}

function SpotlightOverlay({
  targetRect,
  padding,
  color,
  opacity,
  onClick,
}: SpotlightOverlayProps) {
  if (!targetRect) {
    return (
      <div
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: color, opacity }}
        onClick={onClick}
      />
    );
  }

  const spotlightStyle = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  return (
    <div className="fixed inset-0 z-[9998]" onClick={onClick}>
      <svg className="w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlightStyle.left}
              y={spotlightStyle.top}
              width={spotlightStyle.width}
              height={spotlightStyle.height}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={color}
          fillOpacity={opacity}
          mask="url(#spotlight-mask)"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// Tour Tooltip Component
// ============================================================================

interface TourTooltipProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  showProgress: boolean;
  showStepNumbers: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
  allowSkip: boolean;
  allowClose: boolean;
  isFirst: boolean;
  isLast: boolean;
  targetRect: DOMRect | null;
  padding: number;
}

function TourTooltip({
  step,
  currentStep,
  totalSteps,
  showProgress,
  showStepNumbers,
  onNext,
  onPrev,
  onSkip,
  onClose,
  allowSkip,
  allowClose,
  isFirst,
  isLast,
  targetRect,
  padding,
}: TourTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState(step.placement || 'bottom');

  useEffect(() => {
    if (!tooltipRef.current) return;

    const contentRect = tooltipRef.current.getBoundingClientRect();
    const target = targetRect || {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
      width: 0,
      height: 0,
      bottom: window.innerHeight / 2,
      right: window.innerWidth / 2,
    } as DOMRect;

    const pos = calculateSpotlightPosition(
      target,
      contentRect,
      step.placement || 'bottom',
      padding
    );

    setPosition({ top: pos.top, left: pos.left });
    setPlacement(pos.actualPlacement);
  }, [step, targetRect, padding]);

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'fixed z-[9999] w-80 p-4',
        'bg-white dark:bg-neutral-900 rounded-xl shadow-2xl',
        'border border-neutral-200 dark:border-neutral-700'
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {showStepNumbers && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              {currentStep + 1}
            </span>
          )}
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {step.title}
          </h3>
        </div>
        {allowClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {step.content}
      </div>

      {/* Progress */}
      {showProgress && (
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= currentStep
                  ? 'bg-primary-600'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              )}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {allowSkip && !isLast && step.showSkip !== false && (
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                'text-neutral-700 dark:text-neutral-300',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              {step.prevLabel || 'Back'}
            </button>
          )}

          {step.action ? (
            <button
              type="button"
              onClick={() => {
                step.action!.onClick();
                if (!isLast) onNext();
              }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              {step.action.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isLast ? (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              {step.nextLabel || 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Spotlight Tour Component
// ============================================================================

export function SpotlightTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  onStepChange,
  initialStep = 0,
  showProgress = true,
  showStepNumbers = true,
  allowSkip = true,
  allowClose = true,
  scrollBehavior = 'smooth',
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  overlayOpacity = 1,
  className,
}: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];

  // Update target rect
  useEffect(() => {
    if (!isOpen || !step?.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const element = getElementFromTarget(step.target!);
      if (element) {
        setTargetRect(element.getBoundingClientRect());

        // Scroll element into view
        if (scrollBehavior !== 'none') {
          element.scrollIntoView({
            behavior: scrollBehavior,
            block: 'center',
            inline: 'center',
          });
        }
      }
    };

    updateRect();

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen, step, scrollBehavior]);

  // Lifecycle callbacks
  useEffect(() => {
    if (!isOpen) return;

    const runCallbacks = async () => {
      await step?.onBeforeShow?.();
      step?.onAfterShow?.();
    };

    runCallbacks();
  }, [isOpen, currentStep, step]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        onStepChange?.(stepIndex);
      }
    },
    [steps.length, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      onComplete?.();
      onClose();
    }
  }, [currentStep, steps.length, goToStep, onComplete, onClose]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const skip = useCallback(() => {
    onClose();
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          if (allowClose) {
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, allowClose, onClose]);

  const contextValue: TourContextValue = {
    currentStep,
    totalSteps: steps.length,
    goToStep,
    nextStep,
    prevStep,
    close: onClose,
    skip,
  };

  if (!isOpen || !step) return null;

  const padding = step.spotlightPadding ?? 8;

  return createPortal(
    <TourContext.Provider value={contextValue}>
      <div className={className}>
        {/* Overlay */}
        {!step.disableOverlay && (
          <SpotlightOverlay
            targetRect={targetRect}
            padding={padding}
            color={overlayColor}
            opacity={overlayOpacity}
          />
        )}

        {/* Tooltip */}
        <AnimatePresence mode="wait">
          <TourTooltip
            key={step.id}
            step={step}
            currentStep={currentStep}
            totalSteps={steps.length}
            showProgress={showProgress}
            showStepNumbers={showStepNumbers}
            onNext={nextStep}
            onPrev={prevStep}
            onSkip={skip}
            onClose={onClose}
            allowSkip={allowSkip}
            allowClose={allowClose}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
            targetRect={targetRect}
            padding={padding}
          />
        </AnimatePresence>
      </div>
    </TourContext.Provider>,
    document.body
  );
}

// ============================================================================
// Spotlight Component (Single)
// ============================================================================

export function Spotlight({
  target,
  isOpen,
  onClose,
  title,
  content,
  placement = 'bottom',
  padding = 8,
  showOverlay = true,
  overlayOpacity = 0.5,
  action,
  className,
}: SpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Update target rect
  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const element = getElementFromTarget(target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen, target]);

  // Calculate tooltip position
  useEffect(() => {
    if (!tooltipRef.current || !targetRect) return;

    const contentRect = tooltipRef.current.getBoundingClientRect();
    const pos = calculateSpotlightPosition(targetRect, contentRect, placement, padding);
    setPosition({ top: pos.top, left: pos.left });
  }, [targetRect, placement, padding]);

  if (!isOpen) return null;

  return createPortal(
    <div className={className}>
      {showOverlay && (
        <SpotlightOverlay
          targetRect={targetRect}
          padding={padding}
          color="rgba(0, 0, 0, 0.5)"
          opacity={overlayOpacity}
          onClick={onClose}
        />
      )}

      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          'fixed z-[9999] w-72 p-4',
          'bg-white dark:bg-neutral-900 rounded-xl shadow-2xl',
          'border border-neutral-200 dark:border-neutral-700'
        )}
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {content}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Dismiss
          </button>
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {action.label}
            </button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ============================================================================
// Feature Highlight Component
// ============================================================================

export function FeatureHighlight({
  target,
  isOpen,
  onDismiss,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  placement = 'bottom',
  badge,
  className,
}: FeatureHighlightProps) {
  return (
    <Spotlight
      target={target}
      isOpen={isOpen}
      onClose={onDismiss}
      placement={placement}
      title={title}
      content={
        <div className="flex gap-3">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {badge && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full mb-1">
                {badge}
              </span>
            )}
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
        </div>
      }
      action={
        onAction
          ? {
              label: actionLabel || 'Learn more',
              onClick: onAction,
            }
          : undefined
      }
      className={className}
    />
  );
}

// ============================================================================
// Announcement Banner Component
// ============================================================================

export interface AnnouncementBannerProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'info' | 'success' | 'warning' | 'feature';
  className?: string;
}

export function AnnouncementBanner({
  isOpen,
  onDismiss,
  title,
  description,
  icon,
  action,
  variant = 'feature',
  className,
}: AnnouncementBannerProps) {
  if (!isOpen) return null;

  const variantStyles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    feature: 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800',
  };

  const iconStyles = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    feature: 'text-primary-600 dark:text-primary-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-xl border',
        variantStyles[variant],
        className
      )}
    >
      {icon && (
        <div className={cn('flex-shrink-0', iconStyles[variant])}>
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-neutral-900 dark:text-white">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            'bg-primary-600 text-white hover:bg-primary-700'
          )}
        >
          {action.label}
        </button>
      )}

      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

export default SpotlightTour;
