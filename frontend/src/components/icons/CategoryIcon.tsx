'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { MissionCategory } from '@/lib/types';

export const CATEGORY_COLORS: Record<MissionCategory, string> = {
  [MissionCategory.ADMINISTRATIF]: '#7c3aed',
  [MissionCategory.ALIMENTATION]: '#10b981',
  [MissionCategory.BRICOLAGE]: '#ea580c',
  [MissionCategory.DEMENAGEMENT]: '#d97706',
  [MissionCategory.EMPLOI]: '#16a34a',
  [MissionCategory.GARDE_ENFANTS]: '#ec4899',
  [MissionCategory.ECOUTE]: '#8b5cf6',
  [MissionCategory.TRANSPORT]: '#0ea5e9',
  [MissionCategory.EDUCATION]: '#4f46e5',
  [MissionCategory.NUMERIQUE]: '#3b82f6',
  [MissionCategory.ANIMAUX]: '#f97316',
  [MissionCategory.HANDICAP]: '#0ea5e9',
  [MissionCategory.AUTRE]: '#6b7280',
};

const wobble = {
  rest: { rotate: 0 },
  hover: {
    rotate: [0, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const ICONS: Record<MissionCategory, ReactNode> = {
  [MissionCategory.ADMINISTRATIF]: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  [MissionCategory.ALIMENTATION]: (
    <>
      <line x1="9" y1="2" x2="9" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 2v5a2 2 0 002 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M15 2v8a2 2 0 002 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  [MissionCategory.BRICOLAGE]: (
    <>
      <rect x="2" y="5" width="12" height="6" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="11" x2="20" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  [MissionCategory.DEMENAGEMENT]: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8l2.5-5h13l2.5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8v4h4V8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  [MissionCategory.EMPLOI]: (
    <>
      <rect x="2" y="8" width="20" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  [MissionCategory.GARDE_ENFANTS]: (
    <>
      <circle cx="8" cy="5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 22v-3a4 4 0 014-4h0a4 4 0 014 4v3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="7.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 22v-2a3 3 0 013-3h0a3 3 0 013 3v2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  [MissionCategory.ECOUTE]: (
    <>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  [MissionCategory.TRANSPORT]: (
    <>
      <path d="M5 10l2-4h10l2 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="2" y="10" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  [MissionCategory.EDUCATION]: (
    <>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 10v5c0 2.5 2.7 4 6 4s6-1.5 6-4v-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="7" x2="22" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  [MissionCategory.NUMERIQUE]: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="20" x2="23" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 9l-2 3 2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 9l2 3-2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  [MissionCategory.ANIMAUX]: (
    <>
      <circle cx="7" cy="6" r="1.8" fill="currentColor" />
      <circle cx="17" cy="6" r="1.8" fill="currentColor" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
      <circle cx="4.5" cy="11" r="1.5" fill="currentColor" />
      <circle cx="19.5" cy="11" r="1.5" fill="currentColor" />
      <path d="M6 16c0-3 2.7-5 6-5s6 2 6 5c0 2.5-2.7 5-6 5s-6-2.5-6-5z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  [MissionCategory.HANDICAP]: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="7" r="2" fill="currentColor" />
      <path d="M12 10v4h3l1.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 20a5 5 0 018-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </>
  ),
  [MissionCategory.AUTRE]: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9a3 3 0 016 0c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="currentColor" />
    </>
  ),
};

export interface CategoryIconProps {
  category: MissionCategory;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CategoryIcon({ category, size = 24, className, style }: CategoryIconProps) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS[MissionCategory.AUTRE];

  return (
    <motion.div
      className={className}
      style={{ color, display: 'inline-flex', ...style }}
      initial="rest"
      whileHover="hover"
      variants={wobble}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {ICONS[category] ?? ICONS[MissionCategory.AUTRE]}
      </svg>
    </motion.div>
  );
}
