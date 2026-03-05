'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateContribution } from '@/hooks/useCreateContribution';
import { t } from '@/i18n';
import {
  ContributionType,
  CONTRIBUTION_TYPE_LABELS,
} from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/* Illustrative SVGs — soft, hand-drawn feel */
const CONTRIBUTION_SVG: Record<ContributionType, React.ReactNode> = {
  [ContributionType.PARTICIPE]: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.15"/>
      <path d="M16 24c0-2 1.5-6 8-6s8 4 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="20" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <circle cx="28" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M20 32s2 3 4 3 4-3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [ContributionType.PROPOSE]: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6c-7.18 0-13 5.82-13 13 0 4.83 2.63 9.05 6.53 11.31V38a2 2 0 002 2h8.94a2 2 0 002-2v-7.69C34.37 28.05 37 23.83 37 19c0-7.18-5.82-13-13-13z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M20 40h8M22 44h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 14v6m-3-3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  [ContributionType.FINANCE]: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.15"/>
      <path d="M24 10v28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 18c0-2.76-2.69-5-6-5s-6 2.24-6 5c0 4 12 2.5 12 7 0 2.76-2.69 5-6 5s-6-2.24-6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  [ContributionType.CONSEILLE]: (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10h24a4 4 0 014 4v14a4 4 0 01-4 4H18l-6 6v-6H8a4 4 0 01-4-4V14a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M14 20h16M14 25h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <circle cx="38" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
      <path d="M36 16l1.5 1.5L40 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
};

const CONTRIBUTION_BORDER_COLORS: Record<ContributionType, string> = {
  [ContributionType.PARTICIPE]: 'oklch(0.55 0.16 260)',
  [ContributionType.PROPOSE]: 'oklch(0.55 0.18 280)',
  [ContributionType.FINANCE]: 'oklch(0.55 0.14 170)',
  [ContributionType.CONSEILLE]: 'oklch(0.6 0.14 80)',
};

const PLACEHOLDERS: Record<ContributionType, string> = {
  [ContributionType.PARTICIPE]: 'Ex: Je suis disponible samedi matin pour aider !',
  [ContributionType.PROPOSE]: 'Ex: J\'ai une idée : pourquoi ne pas...',
  [ContributionType.FINANCE]: 'Ex: Je peux contribuer 20€ pour les fournitures.',
  [ContributionType.CONSEILLE]: 'Ex: À ta place, je commencerais par...',
};

interface ContributionButtonsProps {
  missionId: string;
}

export function ContributionButtons({ missionId }: ContributionButtonsProps) {
  const [expandedType, setExpandedType] = useState<ContributionType | null>(null);
  const [message, setMessage] = useState('');
  const [hoveredType, setHoveredType] = useState<ContributionType | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mutation = useCreateContribution();

  // Focus automatique sur le textarea quand l'accordéon s'ouvre
  useEffect(() => {
    if (expandedType && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [expandedType]);

  const handleToggle = (type: ContributionType) => {
    if (expandedType === type) {
      setExpandedType(null);
      setMessage('');
    } else {
      setExpandedType(type);
      setMessage('');
    }
  };

  const handleSubmit = () => {
    if (!expandedType) return;
    mutation.mutate(
      { type: expandedType, missionId, message: message || undefined },
      {
        onSuccess: () => {
          toast.success(t('contributions.added'));
          setExpandedType(null);
          setMessage('');
        },
        onError: (error) => {
          if (error.message !== 'AUTH_REQUIRED') {
            toast.error(error.message);
          }
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* 4 boutons sur une ligne */}
      <div className="grid grid-cols-4 gap-2">
        {Object.values(ContributionType).map((type) => {
          const borderColor = CONTRIBUTION_BORDER_COLORS[type];
          const isHovered = hoveredType === type;
          const isExpanded = expandedType === type;
          return (
            <button
              key={type}
              onClick={() => handleToggle(type)}
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType(null)}
              className="group relative flex flex-col items-center gap-2 rounded-2xl px-3 py-3 cursor-pointer select-none transition-all duration-300 ease-out"
              style={{
                background: isExpanded
                  ? `oklch(0.97 0.01 280 / 90%)`
                  : isHovered
                  ? `oklch(0.98 0.005 280 / 80%)`
                  : 'oklch(0.99 0.003 280 / 40%)',
                backdropFilter: 'blur(12px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
                border: `1.5px solid ${borderColor}`,
                borderColor: isExpanded || isHovered ? borderColor : `color-mix(in oklch, ${borderColor} 50%, transparent)`,
                boxShadow: isExpanded || isHovered
                  ? `0 4px 20px color-mix(in oklch, ${borderColor} 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.5)`
                  : 'inset 0 1px 0 rgba(255,255,255,0.3)',
                color: borderColor,
                transform: isExpanded ? 'scale(1.02)' : isHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                {CONTRIBUTION_SVG[type]}
              </div>
              <span
                className="text-xs font-medium transition-colors duration-200 text-center"
                style={{ color: isExpanded || isHovered ? borderColor : 'var(--foreground)' }}
              >
                {CONTRIBUTION_TYPE_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Accordéon pleine largeur */}
      <AnimatePresence>
        {expandedType && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="flex flex-col gap-2 p-3 rounded-xl backdrop-blur-sm border"
              style={{
                background: 'oklch(0.99 0.003 280 / 60%)',
                borderColor: CONTRIBUTION_BORDER_COLORS[expandedType],
              }}
            >
              <Textarea
                ref={textareaRef}
                placeholder={PLACEHOLDERS[expandedType]}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="text-sm resize-none bg-white/80 border-slate-200 focus:border-slate-300"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={mutation.isPending}
                  size="sm"
                  className="flex-1 text-white border-0 font-semibold"
                  style={{
                    background: CONTRIBUTION_BORDER_COLORS[expandedType],
                  }}
                >
                  {mutation.isPending ? t('common.sending') : 'Envoyer'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(expandedType)}
                  className="px-3"
                >
                  ✕
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
