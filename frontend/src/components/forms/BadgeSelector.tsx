'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface BadgeSelectorProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
  labels: Record<T, string>;
  /** Optional emoji/icon per option */
  icons?: Partial<Record<T, string>>;
  /** Color variant per option */
  colors?: Partial<Record<T, string>>;
  columns?: 2 | 3 | 4;
}

export function BadgeSelector<T extends string>({
  label,
  value,
  onChange,
  options,
  labels,
  icons,
  colors,
  columns = 3,
}: BadgeSelectorProps<T>) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className={cn('grid gap-2', gridCols[columns])}>
        {options.map((opt) => {
          const isSelected = value === opt;
          const customColor = colors?.[opt];
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                'relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200 ease-out',
                'border cursor-pointer select-none',
                isSelected
                  ? 'border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/10 scale-[1.02]'
                  : 'border-border/50 bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-foreground',
                'backdrop-blur-sm'
              )}
              style={isSelected && customColor ? { borderColor: customColor, color: customColor } : undefined}
            >
              {icons?.[opt] && <span className="text-base">{icons[opt]}</span>}
              <span>{labels[opt]}</span>
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
