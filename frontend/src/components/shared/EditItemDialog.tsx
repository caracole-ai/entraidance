'use client';

import { useState, ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { t } from '@/i18n';
import { getCategoryAccent } from './constants';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import type { MissionCategory } from '@/lib/types';

export interface SelectField {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  allowNone?: boolean;
}

export interface InputField {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  required?: boolean;
}

export interface EditItemDialogProps {
  title: string;
  itemTitle: string;
  category?: string | null;
  selectFields: SelectField[];
  inputFields: InputField[];
  onSubmit: () => void;
  isPending: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: ReactNode;
}

export function EditItemDialog({
  title,
  itemTitle,
  category,
  selectFields,
  inputFields,
  onSubmit,
  isPending,
  onOpenChange,
  triggerButton,
}: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const categoryAccent = getCategoryAccent(category);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  const handleSubmit = () => {
    onSubmit();
  };

  // Separate required fields from optional
  const titleField = inputFields.find(f => f.id.includes('title'));
  const descField = inputFields.find(f => f.id.includes('description'));
  const optionalInputs = inputFields.filter(f => !f.id.includes('title') && !f.id.includes('description'));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button variant="outline" size="sm" className="glass-sidebar-liquid rounded-xl font-bold">
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-hero !rounded-[2rem] border-0">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            {/* Category icon preview */}
            {category && (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${categoryAccent}15` }}
              >
                <CategoryIcon category={category as MissionCategory} size={28} style={{ color: categoryAccent }} />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">{title}</DialogTitle>
              <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-1">{itemTitle}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main fields: Title & Description (full width, prominent) */}
          <div className="glass-card-liquid rounded-2xl p-4 space-y-4">
            {titleField && (
              <div className="space-y-2">
                <Label htmlFor={titleField.id} className="text-sm font-bold text-slate-700">
                  {titleField.label} {titleField.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={titleField.id}
                  value={titleField.value}
                  onChange={(e) => titleField.onChange(e.target.value)}
                  placeholder={titleField.placeholder}
                  className="glass-sidebar-liquid border-0 rounded-xl font-medium text-lg"
                />
              </div>
            )}
            {descField && (
              <div className="space-y-2">
                <Label htmlFor={descField.id} className="text-sm font-bold text-slate-700">
                  {descField.label} {descField.required && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id={descField.id}
                  value={descField.value}
                  onChange={(e) => descField.onChange(e.target.value)}
                  placeholder={descField.placeholder}
                  rows={descField.rows ?? 4}
                  className="glass-sidebar-liquid border-0 rounded-xl font-medium resize-none"
                />
              </div>
            )}
          </div>

          {/* Select fields in a responsive grid */}
          {selectFields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectFields.map((field) => (
                <div key={field.id} className="glass-card-liquid rounded-xl p-3 space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {field.label}
                  </Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="glass-sidebar-liquid border-0 rounded-xl font-semibold">
                      <SelectValue placeholder={field.placeholder ?? 'Sélectionner...'} />
                    </SelectTrigger>
                    <SelectContent className="glass-hero rounded-xl border-0">
                      {field.allowNone && (
                        <SelectItem value="__none__" className="font-medium">Aucun</SelectItem>
                      )}
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="font-medium">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Optional input fields in grid */}
          {optionalInputs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {optionalInputs.map((field) => (
                <div key={field.id} className="glass-card-liquid rounded-xl p-3 space-y-2">
                  <Label htmlFor={field.id} className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {field.label}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows ?? 2}
                      className="glass-sidebar-liquid border-0 rounded-xl font-medium resize-none"
                    />
                  ) : (
                    <Input
                      id={field.id}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="glass-sidebar-liquid border-0 rounded-xl font-medium"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="glass-sidebar-liquid border-0 rounded-xl font-bold"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
            style={category ? { background: `linear-gradient(to right, ${categoryAccent}, ${categoryAccent}dd)` } : undefined}
          >
            {isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
