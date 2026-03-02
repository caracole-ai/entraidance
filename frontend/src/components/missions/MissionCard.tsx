'use client';

import Link from 'next/link';
import { CategoryIcon, CATEGORY_COLORS } from '@/components/icons/CategoryIcon';
import {
  type IMission,
  CATEGORY_LABELS,
  URGENCY_LABELS,
  type Urgency,
  type MissionCategory,
} from '@/lib/types';
import { MapPin, Clock } from 'lucide-react';

const URGENCY_COLORS: Record<Urgency, string> = {
  faible: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  moyen: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  urgent: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
};

const CATEGORY_ACCENT: Record<MissionCategory, string> = {
  demenagement: '#8b5cf6',
  bricolage: '#f97316',
  numerique: '#3b82f6',
  administratif: '#06b6d4',
  garde_enfants: '#ec4899',
  transport: '#a855f7',
  ecoute: '#f43f5e',
  emploi: '#10b981',
  alimentation: '#f59e0b',
  animaux: '#84cc16',
  education: '#eab308',
  handicap: '#0ea5e9',
  autre: '#6b7280',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD}j`;
  return `Il y a ${Math.floor(diffD / 30)} mois`;
}

interface MissionCardProps {
  mission: IMission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const categoryAccent = CATEGORY_ACCENT[mission.category] ?? '#6b7280';

  return (
    <Link href={`/missions/${mission.id}`} className="block group">
      <div className="relative h-full glass-card-liquid rounded-[3rem] p-8 pt-16">
        {/* Urgency badge - top left */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`${URGENCY_COLORS[mission.urgency]} px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg`}>
            {URGENCY_LABELS[mission.urgency]}
          </div>
        </div>

        {/* Category icon - top right, slightly overflowing card */}
        <div className="absolute -top-4 -right-4 z-10">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${categoryAccent}25` }}
          >
            <CategoryIcon category={mission.category} size={28} style={{ color: categoryAccent }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-0 space-y-4">
          {/* Category label */}
          <div>
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.15em]"
              style={{ 
                backgroundColor: `${categoryAccent}20`,
                color: categoryAccent 
              }}
            >
              {CATEGORY_LABELS[mission.category]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black tracking-tight text-slate-900 line-clamp-2 leading-tight">
            {mission.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 font-medium">
            {mission.description}
          </p>

          {/* Location & Time */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{mission.location || 'Non spécifié'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{timeAgo(mission.createdAt)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {/* Footer: Author + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                {mission.creator?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {mission.creator?.displayName || 'Anonyme'}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-black text-[#9333ea] uppercase tracking-widest">
                Voir détails →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
