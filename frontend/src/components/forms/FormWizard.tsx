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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {/* Step indicator - clickable */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <button
              onClick={() => onStepChange(i)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                i === currentStep
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              aria-label={`Aller à l'étape ${i + 1}: ${step.label}`}
            >
              {getStepIcon(i)}
            </button>
            <span
              className={`hidden text-sm sm:inline cursor-pointer ${
                i === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => onStepChange(i)}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="h-px w-4 bg-border sm:w-8" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps[currentStep].content}
        </CardContent>
      </Card>

      {/* Single validation button - always visible */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={onSubmit}
          disabled={!isFormValid() || isSubmitting}
          size="lg"
          className="min-w-[200px]"
        >
          {isSubmitting ? 'Création...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
