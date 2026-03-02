'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';

export interface WizardStep {
  label: string;
  content: ReactNode;
  isValid: () => boolean;
  isEmpty?: () => boolean;
}

interface FormWizardProps {
  title: string;
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function FormWizard({
  title,
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Valider',
}: FormWizardProps) {
  const getStepStatus = (stepIndex: number): 'valid' | 'invalid' | 'empty' => {
    const step = steps[stepIndex];
    if (step.isEmpty?.() ?? false) return 'empty';
    return step.isValid() ? 'valid' : 'invalid';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    if (status === 'valid') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (status === 'invalid') {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const isFormValid = () => steps.every((step) => step.isValid());

  const STEP_VIBES = ['✍️', '🏷️', '👁️', '✨'];

  return (
    <div className="container mx-auto max-w-2xl px-4 mt-20 py-8">
      <h1 className="text-2xl font-bold mb-2">
        <span className="font-display">{title.split(' ').slice(0, -1).join(' ')} </span>
        <span className="font-elegant gradient-text-primary">{title.split(' ').pop()}</span>
      </h1>
      <p className="text-muted-foreground mb-8">Étape par étape, en douceur.</p>

      {/* Step indicator - sleek pills */}
      <div className="flex items-center gap-1.5 mb-8 p-1.5 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/30 w-fit">
        {steps.map((step, i) => {
          const isCurrent = i === currentStep;
          const status = getStepStatus(i);
          return (
            <button
              key={step.label}
              onClick={() => onStepChange(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? 'gradient-primary text-white shadow-md'
                  : status === 'valid'
                    ? 'text-primary/80 hover:bg-primary/5'
                    : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label={`Aller à l'étape ${i + 1}: ${step.label}`}
            >
              <span className="text-base">{STEP_VIBES[i] ?? getStepIcon(i)}</span>
              <span className="hidden sm:inline">{step.label}</span>
              {status === 'valid' && !isCurrent && (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
              )}
            </button>
          );
        })}
      </div>

      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <span>{STEP_VIBES[currentStep]}</span>
            {steps[currentStep].label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Gradient submit button */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={onSubmit}
          disabled={!isFormValid() || isSubmitting}
          size="lg"
          className="min-w-[200px] shimmer gradient-primary text-white border-0 shadow-lg hover:shadow-xl transition-shadow"
        >
          {isSubmitting ? 'Création...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
