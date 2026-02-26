'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ValidatedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  minLength?: number;
  placeholder?: string;
  required?: boolean;
  touched?: boolean;
  type?: 'input' | 'textarea';
  rows?: number;
}

export const ValidatedInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  ValidatedInputProps
>(
  (
    {
      id,
      label,
      value,
      onChange,
      onBlur,
      minLength = 0,
      placeholder,
      required = false,
      touched = false,
      type = 'input',
      rows = 5,
    },
    ref
  ) => {
    const isValid = minLength > 0 ? value.trim().length >= minLength : value.trim().length > 0;
    const showError = touched && !isValid && minLength > 0;

    const inputClassName =
      showError
        ? 'border-destructive focus-visible:ring-destructive'
        : '';

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {type === 'textarea' ? (
          <Textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={id}
            placeholder={placeholder}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={inputClassName}
            required={required}
          />
        ) : (
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={inputClassName}
            required={required}
          />
        )}
        {minLength > 0 && (
          <div className="flex justify-between text-xs">
            <span
              className={
                showError
                  ? 'text-destructive'
                  : isValid
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }
            >
              {showError &&
                `${label} doit contenir au moins ${minLength} caractères`}
            </span>
            <span
              className={
                value.length >= minLength
                  ? 'text-green-600'
                  : value.length > 0
                  ? 'text-orange-500'
                  : 'text-muted-foreground'
              }
            >
              {value.length}/{minLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
