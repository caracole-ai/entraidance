'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface ToggleOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface ToggleSwitchProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
}

export function ToggleSwitch<T extends string>({
  label,
  value,
  onChange,
  options,
}: ToggleSwitchProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value);

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative inline-flex rounded-xl border border-border/50 bg-muted/30 p-1 backdrop-blur-sm">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-primary/10 border border-primary/20 shadow-sm transition-all duration-300 ease-out"
          style={{
            width: `calc(${100 / options.length}% - 4px)`,
            left: `calc(${(selectedIndex * 100) / options.length}% + 2px)`,
          }}
        />
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative z-10 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium',
                'transition-colors duration-200 cursor-pointer select-none',
                isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
