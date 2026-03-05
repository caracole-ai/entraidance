'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthRequiredModal({ open, onOpenChange }: AuthRequiredModalProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 overflow-hidden p-0">
        {/* Gradient header */}
        <div
          className="px-8 pt-10 pb-8 text-center"
          style={{
            background: 'linear-gradient(160deg, oklch(0.55 0.18 280 / 0.06), oklch(0.6 0.12 350 / 0.08), oklch(0.55 0.14 170 / 0.04))',
          }}
        >
          {/* Decorative SVG */}
          <div className="mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'oklch(0.55 0.18 280 / 0.08)',
              border: '1.5px solid oklch(0.55 0.18 280 / 0.15)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="18" r="8" stroke="oklch(0.55 0.18 280)" strokeWidth="1.5" fill="none"/>
              <path d="M10 40c0-7.73 6.27-14 14-14s14 6.27 14 14" stroke="oklch(0.55 0.18 280)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M32 12l3 3 6-6" stroke="oklch(0.55 0.14 170)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl text-center">
              <span className="font-display">Rejoignez </span>
              <span className="font-elegant gradient-text-primary text-[1.2em]">le mouvement</span>
            </DialogTitle>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Connectez-vous pour contribuer, publier des missions et rejoindre la communauté solidaire.
            </p>
          </DialogHeader>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 pt-2 space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full gradient-primary text-white border-0 font-semibold shimmer h-12 text-base"
          >
            <Link href="/register" onClick={handleClose}>Créer un compte</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full h-12 text-base"
          >
            <Link href="/login" onClick={handleClose}>J&apos;ai déjà un compte</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground pt-1">
            Gratuit, sans engagement, pour toujours ✨
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
