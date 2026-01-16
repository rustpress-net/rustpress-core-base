/**
 * Stepper Component
 *
 * Enterprise-grade step progress indicators:
 * - Horizontal and vertical orientations
 * - Multiple variants (default, outline, dots)
 * - Interactive and non-interactive modes
 * - Step validation and error states
 * - Animated transitions
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  AlertCircle,
  Circle,
  ChevronRight,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type StepStatus = 'pending' | 'current' | 'completed' | 'error' | 'loading';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperVariant = 'default' | 'outline' | 'dots' | 'simple' | 'numbered';
export type StepperSize = 'sm' | 'md' | 'lg';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  optional?: boolean;
  disabled?: boolean;
  error?: string;
  content?: React.ReactNode;
}

export interface StepperContextValue {
  currentStep: number;
  steps: Step[];
  orientation: StepperOrientation;
  variant: StepperVariant;
  size: StepperSize;
  interactive: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStepError: (stepIndex: number, error: string | null) => void;
}

export interface StepperProps {
  steps: Step[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  orientation?: StepperOrientation;
  variant?: StepperVariant;
  size?: StepperSize;
  interactive?: boolean;
  allowSkip?: boolean;
  showConnector?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface StepItemProps {
  step: Step;
  index: number;
  status: StepStatus;
  isLast: boolean;
  onClick?: () => void;
}

export interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface StepActionsProps {
  onNext?: () => void;
  onPrev?: () => void;
  onComplete?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  showPrev?: boolean;
  showNext?: boolean;
  showComplete?: boolean;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  isLastStep?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeConfig: Record<StepperSize, {
  icon: string;
  iconInner: string;
  title: string;
  description: string;
  connector: string;
  gap: string;
}> = {
  sm: {
    icon: 'w-6 h-6',
    iconInner: 'w-3 h-3',
    title: 'text-xs',
    description: 'text-xs',
    connector: 'h-0.5',
    gap: 'gap-2',
  },
  md: {
    icon: 'w-8 h-8',
    iconInner: 'w-4 h-4',
    title: 'text-sm',
    description: 'text-xs',
    connector: 'h-0.5',
    gap: 'gap-3',
  },
  lg: {
    icon: 'w-10 h-10',
    iconInner: 'w-5 h-5',
    title: 'text-base',
    description: 'text-sm',
    connector: 'h-1',
    gap: 'gap-4',
  },
};

// ============================================================================
// Context
// ============================================================================

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper compound components must be used within a Stepper');
  }
  return context;
}

// ============================================================================
// Step Icon Component
// ============================================================================

function StepIcon({
  step,
  index,
  status,
  variant,
  size,
}: {
  step: Step;
  index: number;
  status: StepStatus;
  variant: StepperVariant;
  size: StepperSize;
}) {
  const config = sizeConfig[size];

  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-primary-600 text-white border-primary-600';
      case 'current':
        return variant === 'outline'
          ? 'bg-white dark:bg-neutral-900 text-primary-600 border-primary-600 border-2'
          : 'bg-primary-600 text-white border-primary-600';
      case 'error':
        return 'bg-red-600 text-white border-red-600';
      case 'loading':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 border-primary-300 dark:border-primary-700';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-300 dark:border-neutral-600';
    }
  };

  const renderIcon = () => {
    if (status === 'loading') {
      return <Loader2 className={cn(config.iconInner, 'animate-spin')} />;
    }
    if (status === 'completed') {
      return <Check className={config.iconInner} />;
    }
    if (status === 'error') {
      return <X className={config.iconInner} />;
    }

    // Custom icon
    if (step.icon) {
      if (typeof step.icon === 'function') {
        const Icon = step.icon as LucideIcon;
        return <Icon className={config.iconInner} />;
      }
      return step.icon;
    }

    // Variant-specific icons
    if (variant === 'dots') {
      return <Circle className={cn(config.iconInner, status === 'current' && 'fill-current')} />;
    }

    if (variant === 'numbered' || variant === 'default') {
      return <span className="font-semibold">{index + 1}</span>;
    }

    return null;
  };

  if (variant === 'simple') {
    return (
      <div
        className={cn(
          'w-3 h-3 rounded-full transition-colors',
          status === 'completed' && 'bg-primary-600',
          status === 'current' && 'bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30',
          status === 'error' && 'bg-red-600',
          status === 'pending' && 'bg-neutral-300 dark:bg-neutral-600'
        )}
      />
    );
  }

  return (
    <motion.div
      className={cn(
        'flex items-center justify-center rounded-full border transition-colors',
        config.icon,
        getStatusStyles()
      )}
      initial={false}
      animate={{
        scale: status === 'current' ? 1.1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {renderIcon()}
    </motion.div>
  );
}

// ============================================================================
// Step Item Component
// ============================================================================

function StepItem({
  step,
  index,
  status,
  isLast,
  onClick,
}: StepItemProps) {
  const { orientation, variant, size, interactive, showConnector } = useStepperContext();
  const config = sizeConfig[size];

  const isClickable = interactive && !step.disabled && onClick;

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-col items-center' : 'flex-row',
        !isLast && orientation === 'horizontal' && 'flex-1'
      )}
    >
      <div
        className={cn(
          'flex items-center',
          orientation === 'vertical' && config.gap
        )}
      >
        {/* Step Icon */}
        <button
          type="button"
          onClick={isClickable ? onClick : undefined}
          disabled={step.disabled}
          className={cn(
            'relative z-10 flex-shrink-0',
            isClickable && 'cursor-pointer',
            !isClickable && 'cursor-default',
            step.disabled && 'opacity-50'
          )}
        >
          <StepIcon
            step={step}
            index={index}
            status={status}
            variant={variant}
            size={size}
          />
        </button>

        {/* Vertical content */}
        {orientation === 'vertical' && (
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'font-medium text-neutral-900 dark:text-white',
                config.title,
                status === 'pending' && 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {step.title}
              {step.optional && (
                <span className="ml-1 text-neutral-400 dark:text-neutral-500 font-normal">
                  (Optional)
                </span>
              )}
            </div>
            {step.description && (
              <div className={cn('text-neutral-500 dark:text-neutral-400 mt-0.5', config.description)}>
                {step.description}
              </div>
            )}
            {step.error && status === 'error' && (
              <div className={cn('text-red-500 mt-0.5 flex items-center gap-1', config.description)}>
                <AlertCircle className="w-3 h-3" />
                {step.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal content (below icon) */}
      {orientation === 'horizontal' && variant !== 'simple' && (
        <div className="mt-2 text-center">
          <div
            className={cn(
              'font-medium text-neutral-900 dark:text-white',
              config.title,
              status === 'pending' && 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {step.title}
          </div>
          {step.description && (
            <div className={cn('text-neutral-500 dark:text-neutral-400 mt-0.5', config.description)}>
              {step.description}
            </div>
          )}
        </div>
      )}

      {/* Connector */}
      {!isLast && showConnector !== false && (
        <div
          className={cn(
            'transition-colors',
            orientation === 'horizontal'
              ? cn('flex-1 mx-2', config.connector, 'min-w-[24px]')
              : cn('w-0.5 ml-4 my-2 min-h-[24px]'),
            status === 'completed'
              ? 'bg-primary-600'
              : 'bg-neutral-200 dark:bg-neutral-700'
          )}
        />
      )}
    </div>
  );
}

// ============================================================================
// Stepper Component
// ============================================================================

export function Stepper({
  steps: initialSteps,
  currentStep: controlledStep,
  onStepChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  interactive = false,
  allowSkip = false,
  showConnector = true,
  className,
  children,
}: StepperProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<number, string | null>>({});

  const currentStep = controlledStep !== undefined ? controlledStep : internalStep;

  const steps = useMemo(() =>
    initialSteps.map((step, index) => ({
      ...step,
      error: stepErrors[index] || step.error,
    })),
    [initialSteps, stepErrors]
  );

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) return;
      if (!allowSkip && step > currentStep + 1) return;

      if (controlledStep === undefined) {
        setInternalStep(step);
      }
      onStepChange?.(step);
    },
    [steps.length, allowSkip, currentStep, controlledStep, onStepChange]
  );

  const nextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const setStepError = useCallback((stepIndex: number, error: string | null) => {
    setStepErrors((prev) => ({ ...prev, [stepIndex]: error }));
  }, []);

  const getStepStatus = (index: number): StepStatus => {
    if (steps[index].error) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const contextValue: StepperContextValue = {
    currentStep,
    steps,
    orientation,
    variant,
    size,
    interactive,
    goToStep,
    nextStep,
    prevStep,
    setStepError,
    showConnector,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div className={cn('flex flex-col', className)}>
        {/* Steps indicator */}
        <div
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col'
          )}
          role="navigation"
          aria-label="Progress"
        >
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              status={getStepStatus(index)}
              isLast={index === steps.length - 1}
              onClick={interactive ? () => goToStep(index) : undefined}
            />
          ))}
        </div>

        {/* Step content */}
        {children}
      </div>
    </StepperContext.Provider>
  );
}

// ============================================================================
// Step Content Component
// ============================================================================

export function StepContent({ children, className }: StepContentProps) {
  const { currentStep, steps } = useStepperContext();

  return (
    <div className={cn('mt-6', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {steps[currentStep]?.content || children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Step Actions Component
// ============================================================================

export function StepActions({
  onNext,
  onPrev,
  onComplete,
  nextLabel = 'Continue',
  prevLabel = 'Back',
  completeLabel = 'Complete',
  showPrev = true,
  showNext = true,
  showComplete = true,
  nextDisabled = false,
  prevDisabled = false,
  isLastStep: controlledIsLastStep,
  className,
}: StepActionsProps) {
  const { currentStep, steps, nextStep, prevStep } = useStepperContext();

  const isFirstStep = currentStep === 0;
  const isLastStep = controlledIsLastStep ?? currentStep === steps.length - 1;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      prevStep();
    }
  };

  return (
    <div className={cn('flex items-center justify-between mt-6', className)}>
      <div>
        {showPrev && !isFirstStep && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={prevDisabled}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              prevDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {prevLabel}
          </button>
        )}
      </div>

      <div>
        {isLastStep ? (
          showComplete && (
            <button
              type="button"
              onClick={onComplete}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
              )}
            >
              {completeLabel}
            </button>
          )
        ) : (
          showNext && (
            <button
              type="button"
              onClick={handleNext}
              disabled={nextDisabled}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'bg-primary-600 text-white hover:bg-primary-700',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                nextDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {nextLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Progress Stepper (Simplified)
// ============================================================================

export interface ProgressStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: 'default' | 'numbered' | 'dots';
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'default',
  className,
}: ProgressStepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = onStepClick && (isCompleted || index === currentStep + 1);

        return (
          <React.Fragment key={index}>
            <button
              type="button"
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-2 transition-colors',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-colors',
                  variant === 'dots' ? 'w-3 h-3' : 'w-8 h-8',
                  isCompleted && 'bg-primary-600 text-white',
                  isCurrent && 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30',
                  !isCompleted && !isCurrent && 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                )}
              >
                {variant !== 'dots' && (
                  isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )
                )}
              </div>

              {variant !== 'dots' && (
                <span
                  className={cn(
                    'text-sm font-medium hidden sm:inline',
                    isCurrent && 'text-neutral-900 dark:text-white',
                    !isCurrent && 'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  {step}
                </span>
              )}
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 min-w-[20px]',
                  isCompleted ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Breadcrumb Stepper
// ============================================================================

export interface BreadcrumbStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function BreadcrumbStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: BreadcrumbStepperProps) {
  return (
    <nav className={cn('flex items-center', className)} aria-label="Breadcrumb">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && isCompleted;

          return (
            <li key={index} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isClickable && 'cursor-pointer',
                  isCurrent && 'text-primary-600 dark:text-primary-400',
                  isCompleted && 'text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400',
                  !isCompleted && !isCurrent && 'text-neutral-400 dark:text-neutral-500'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {step}
              </button>

              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-2 text-neutral-400" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ============================================================================
// Mini Progress Indicator
// ============================================================================

export interface MiniProgressProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function MiniProgress({
  current,
  total,
  showLabel = true,
  className,
}: MiniProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-neutral-500 dark:text-neutral-400 flex-shrink-0">
          {current} / {total}
        </span>
      )}
    </div>
  );
}

export default Stepper;
