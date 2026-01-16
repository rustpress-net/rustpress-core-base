/**
 * RustPress Form Wizard/Stepper Component
 * Multi-step form wizard with progress stepper and validation
 */

import React, { useState, useCallback, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
  onEnter?: () => void | Promise<void>;
  onLeave?: () => void | Promise<void>;
}

export interface FormWizardProps {
  steps: WizardStep[];
  children: React.ReactNode;
  initialStep?: number;
  onComplete?: () => void | Promise<void>;
  onStepChange?: (step: number, direction: 'next' | 'prev') => void;
  variant?: 'horizontal' | 'vertical';
  stepperPosition?: 'top' | 'left' | 'right';
  showStepNumbers?: boolean;
  allowSkipOptional?: boolean;
  allowClickNavigation?: boolean;
  completedStepsClickable?: boolean;
  className?: string;
}

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepValid: (index: number) => boolean;
  isStepCompleted: (index: number) => boolean;
  goToStep: (index: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  setStepValid: (index: number, valid: boolean) => void;
  isLoading: boolean;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard');
  }
  return context;
}

// ============================================================================
// Stepper Component
// ============================================================================

interface StepperProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
  validSteps: Map<number, boolean>;
  variant: 'horizontal' | 'vertical';
  showNumbers: boolean;
  allowClick: boolean;
  completedClickable: boolean;
  onStepClick: (index: number) => void;
}

function Stepper({
  steps,
  currentStep,
  completedSteps,
  validSteps,
  variant,
  showNumbers,
  allowClick,
  completedClickable,
  onStepClick,
}: StepperProps) {
  const isHorizontal = variant === 'horizontal';

  return (
    <div
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-start' : 'flex-col items-start'
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        const isValid = validSteps.get(index) !== false;
        const canClick =
          allowClick &&
          (isCurrent || (completedClickable && isCompleted) || index < currentStep);

        return (
          <React.Fragment key={step.id}>
            {/* Step item */}
            <div
              className={cn(
                'flex gap-3',
                isHorizontal ? 'flex-col items-center' : 'flex-row items-start',
                canClick && 'cursor-pointer group'
              )}
              onClick={() => canClick && onStepClick(index)}
            >
              {/* Step indicator */}
              <div
                className={cn(
                  'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                  isCompleted
                    ? 'bg-success-500 border-success-500 text-white'
                    : isCurrent
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : !isValid
                    ? 'bg-error-50 border-error-500 text-error-500 dark:bg-error-900/20'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-600',
                  canClick && !isCurrent && 'group-hover:border-primary-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : !isValid ? (
                  <AlertCircle className="w-5 h-5" />
                ) : step.icon ? (
                  step.icon
                ) : showNumbers ? (
                  <span className="text-sm font-semibold">{index + 1}</span>
                ) : (
                  <Circle className="w-3 h-3 fill-current" />
                )}
              </div>

              {/* Step label */}
              <div
                className={cn(
                  isHorizontal ? 'text-center' : 'text-left',
                  'min-w-0'
                )}
              >
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isCurrent
                      ? 'text-primary-600 dark:text-primary-400'
                      : isCompleted
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  {step.title}
                  {step.optional && (
                    <span className="ml-1 text-xs text-neutral-400">(Optional)</span>
                  )}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      'text-xs text-neutral-500 dark:text-neutral-400 mt-0.5',
                      isHorizontal ? 'max-w-[120px]' : 'max-w-[200px]'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'transition-colors duration-200',
                  isHorizontal
                    ? 'flex-1 min-w-[40px] h-0.5 mt-5 mx-2'
                    : 'w-0.5 min-h-[40px] ml-5 my-2',
                  isCompleted
                    ? 'bg-success-500'
                    : isCurrent
                    ? 'bg-gradient-to-r from-primary-500 to-neutral-300 dark:to-neutral-600'
                    : 'bg-neutral-300 dark:bg-neutral-600'
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
// Navigation Buttons
// ============================================================================

interface WizardNavigationProps {
  onPrev: () => void;
  onNext: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  canSkip?: boolean;
  onSkip?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  skipLabel?: string;
}

function WizardNavigation({
  onPrev,
  onNext,
  isFirstStep,
  isLastStep,
  isLoading,
  canSkip,
  onSkip,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  completeLabel = 'Complete',
  skipLabel = 'Skip',
}: WizardNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700">
      <div>
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrev}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
              'text-neutral-700 dark:text-neutral-300',
              'bg-neutral-100 dark:bg-neutral-800',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            {prevLabel}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {canSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              'text-neutral-500 dark:text-neutral-400',
              'hover:text-neutral-700 dark:hover:text-neutral-200',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {skipLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
            'text-white',
            isLastStep
              ? 'bg-success-600 hover:bg-success-700'
              : 'bg-primary-600 hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isLastStep ? completeLabel : nextLabel}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Step Content Wrapper
// ============================================================================

interface WizardStepContentProps {
  stepIndex: number;
  children: React.ReactNode;
}

export function WizardStepContent({ stepIndex, children }: WizardStepContentProps) {
  const { currentStep } = useWizard();

  if (stepIndex !== currentStep) {
    return null;
  }

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// Main Form Wizard Component
// ============================================================================

export function FormWizard({
  steps,
  children,
  initialStep = 0,
  onComplete,
  onStepChange,
  variant = 'horizontal',
  stepperPosition = 'top',
  showStepNumbers = true,
  allowSkipOptional = true,
  allowClickNavigation = true,
  completedStepsClickable = true,
  className,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [validSteps, setValidSteps] = useState<Map<number, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const setStepValid = useCallback((index: number, valid: boolean) => {
    setValidSteps((prev) => {
      const next = new Map(prev);
      next.set(index, valid);
      return next;
    });
  }, []);

  const isStepValid = useCallback(
    (index: number) => validSteps.get(index) !== false,
    [validSteps]
  );

  const isStepCompleted = useCallback(
    (index: number) => completedSteps.has(index),
    [completedSteps]
  );

  const goToStep = useCallback(
    async (index: number) => {
      if (index < 0 || index >= steps.length) return;
      if (index === currentStep) return;

      const step = steps[currentStep];

      try {
        setIsLoading(true);

        // Run onLeave for current step
        if (step.onLeave) {
          await step.onLeave();
        }

        // Run onEnter for new step
        const newStep = steps[index];
        if (newStep.onEnter) {
          await newStep.onEnter();
        }

        setCurrentStep(index);
        onStepChange?.(index, index > currentStep ? 'next' : 'prev');
      } finally {
        setIsLoading(false);
      }
    },
    [currentStep, steps, onStepChange]
  );

  const nextStep = useCallback(async () => {
    const step = steps[currentStep];

    try {
      setIsLoading(true);

      // Validate current step
      if (step.validate) {
        const valid = await step.validate();
        setStepValid(currentStep, valid);
        if (!valid) {
          setIsLoading(false);
          return;
        }
      }

      // Mark current step as completed
      setCompletedSteps((prev) => new Set([...prev, currentStep]));

      if (isLastStep) {
        // Complete the wizard
        if (onComplete) {
          await onComplete();
        }
      } else {
        // Go to next step
        await goToStep(currentStep + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, steps, isLastStep, goToStep, onComplete, setStepValid]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [isFirstStep, currentStep, goToStep]);

  const skipStep = useCallback(() => {
    if (!isLastStep && steps[currentStep].optional) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps, isLastStep, goToStep]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStep || completedSteps.has(index)) {
        goToStep(index);
      }
    },
    [currentStep, completedSteps, goToStep]
  );

  const contextValue = useMemo<WizardContextType>(
    () => ({
      currentStep,
      totalSteps: steps.length,
      steps,
      isFirstStep,
      isLastStep,
      isStepValid,
      isStepCompleted,
      goToStep,
      nextStep,
      prevStep,
      setStepValid,
      isLoading,
    }),
    [
      currentStep,
      steps,
      isFirstStep,
      isLastStep,
      isStepValid,
      isStepCompleted,
      goToStep,
      nextStep,
      prevStep,
      setStepValid,
      isLoading,
    ]
  );

  const isVerticalLayout = stepperPosition === 'left' || stepperPosition === 'right';
  const stepperVariant = isVerticalLayout ? 'vertical' : 'horizontal';

  const stepperElement = (
    <Stepper
      steps={steps}
      currentStep={currentStep}
      completedSteps={completedSteps}
      validSteps={validSteps}
      variant={stepperVariant}
      showNumbers={showStepNumbers}
      allowClick={allowClickNavigation}
      completedClickable={completedStepsClickable}
      onStepClick={handleStepClick}
    />
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <div
        className={cn(
          'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
          isVerticalLayout ? 'flex' : 'flex flex-col',
          className
        )}
      >
        {/* Stepper - left position */}
        {stepperPosition === 'left' && (
          <div className="p-6 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            {stepperElement}
          </div>
        )}

        {/* Stepper - top position */}
        {stepperPosition === 'top' && (
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 overflow-x-auto">
            {stepperElement}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 p-6">
          {/* Step title */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].description && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>

          {/* Navigation */}
          <WizardNavigation
            onPrev={prevStep}
            onNext={nextStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isLoading={isLoading}
            canSkip={allowSkipOptional && steps[currentStep].optional}
            onSkip={skipStep}
          />
        </div>

        {/* Stepper - right position */}
        {stepperPosition === 'right' && (
          <div className="p-6 border-l border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            {stepperElement}
          </div>
        )}
      </div>
    </WizardContext.Provider>
  );
}

// ============================================================================
// Compact Stepper (standalone)
// ============================================================================

export interface CompactStepperProps {
  steps: { id: string; title: string }[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (index: number) => void;
  className?: string;
}

export function CompactStepper({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
}: CompactStepperProps) {
  const completedSet = new Set(completedSteps);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSet.has(index);
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick || (!isCompleted && index > currentStep)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                isCompleted
                  ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                  : isCurrent
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                onStepClick &&
                  (isCompleted || index <= currentStep) &&
                  'hover:ring-2 hover:ring-offset-2 hover:ring-primary-500 cursor-pointer',
                (!onStepClick || (!isCompleted && index > currentStep)) &&
                  'cursor-default opacity-60'
              )}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-xs rounded-full bg-current/20">
                  {index + 1}
                </span>
              )}
              {step.title}
            </button>

            {index < steps.length - 1 && (
              <ChevronRight
                className={cn(
                  'w-4 h-4',
                  index < currentStep
                    ? 'text-success-500'
                    : 'text-neutral-300 dark:text-neutral-600'
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
// Progress Bar Variant
// ============================================================================

export interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showPercentage?: boolean;
  showStepCount?: boolean;
  className?: string;
}

export function WizardProgressBar({
  currentStep,
  totalSteps,
  showPercentage = true,
  showStepCount = true,
  className,
}: WizardProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {(showPercentage || showStepCount) && (
        <div className="flex items-center justify-between text-sm">
          {showStepCount && (
            <span className="text-neutral-600 dark:text-neutral-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
          )}
          {showPercentage && (
            <span className="text-neutral-500 dark:text-neutral-500">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default FormWizard;
