"use client";

import { Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface ProgressStep {
  step: number;
  message: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  percentage: number;
  currentSlide?: number;
  totalSlides?: number;
  error?: string;
  retryCount?: number;
}

export function ProgressIndicator({
  steps,
  currentStep,
  percentage,
  currentSlide,
  totalSlides,
  error,
  retryCount = 0,
}: ProgressIndicatorProps) {
  const getStepStyles = (step: ProgressStep) => {
    switch (step.status) {
      case 'pending':
        return {
          circle: 'bg-gray-200 border-gray-300',
          text: 'text-gray-500',
          icon: null,
        };
      case 'processing':
        return {
          circle: 'bg-blue-500 border-blue-600 animate-pulse',
          text: 'text-blue-600 font-medium',
          icon: <Loader2 className="w-5 h-5 text-white animate-spin" />,
        };
      case 'completed':
        return {
          circle: 'bg-green-500 border-green-600',
          text: 'text-green-600',
          icon: <Check className="w-5 h-5 text-white" />,
        };
      case 'failed':
        return {
          circle: 'bg-red-500 border-red-600 animate-[shake_0.5s_ease-in-out]',
          text: 'text-red-600',
          icon: <X className="w-5 h-5 text-white" />,
        };
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const styles = getStepStyles(step);
        const isLast = index === steps.length - 1;

        return (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-4"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0 transition-all duration-300 ${styles.circle}`}
            >
              {styles.icon || (
                <span className="text-sm font-medium text-white">{step.step}</span>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p
                className={`text-sm transition-all duration-300 ${styles.text}`}
              >
                {step.message}
              </p>

              {step.step === 4 && step.status === 'processing' && currentSlide && totalSlides && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    Processing slide {currentSlide} of {totalSlides}
                  </p>
                  <ProgressBar value={percentage} animated={true} />
                </div>
              )}

              {step.step === 4 && step.status === 'processing' && percentage > 0 && (
                <p className="text-sm text-gray-500 mt-1">{percentage}%</p>
              )}
            </div>

            {!isLast && (
              <div
                className={`mt-4 w-0.5 min-h-[3rem] -ml-2 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'} transition-all duration-300`}
              />
            )}
          </motion.div>
        );
      })}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 rounded-lg bg-red-50 p-4 text-red-600"
        >
          <p className="font-medium">Error: {error}</p>
          {retryCount > 1 && (
            <p className="mt-2 text-sm text-red-500">
              If the problem persists, please contact support.
            </p>
          )}
        </motion.div>
      )}

      {steps.every(s => s.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Check className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-2 text-lg font-medium text-green-600">
            Presentation generated successfully!
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to editor...
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  animated?: boolean;
}

function ProgressBar({ value, animated = false }: ProgressBarProps) {
  const segments = 20;
  const filledSegments = Math.floor((value / 100) * segments);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: segments }).map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-sm transition-all duration-300 ${
            index < filledSegments
              ? 'bg-blue-500'
              : 'bg-gray-200'
          } ${animated && index < filledSegments ? 'animate-pulse' : ''}`}
        />
      ))}
    </div>
  );
}
