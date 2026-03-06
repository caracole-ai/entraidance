'use client';

import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { CATEGORY_LABELS, type MissionCategory } from '@/lib/types';
import { timeAgo, getCategoryAccent } from './constants';

export interface ItemCardBadge {
  label: string;
  colorClass: string; // gradient class
}

export interface ItemCardProps {
  href: string;
  title: string;
  description: string;
  category?: MissionCategory | string | null;
  location?: string | null;
  createdAt: string;
  creatorName?: string | null;
  creatorGradient?: string; // e.g. 'from-purple-400 to-indigo-500'
  badge?: ItemCardBadge | null; // top-left badge (urgency for missions, type for offers)
  ctaColor?: string; // e.g. 'text-[#9333ea]' or 'text-emerald-600'
}

export function ItemCard({
  href,
  title,
  description,
  category,
  location,
  createdAt,
  creatorName,
  creatorGradient = 'from-purple-400 to-indigo-500',
  badge,
  ctaColor = 'text-[#9333ea]',
}: ItemCardProps) {
  const categoryAccent = getCategoryAccent(category);
  const creatorInitial = creatorName?.charAt(0).toUpperCase() || 'A';

  return (
    <Link href={href} className="block group h-full">
      <div className="relative h-full glass-card-liquid rounded-[3rem] p-8 pt-10 flex flex-col">
        {/* Top-left badge (urgency/type) */}
        {badge && (
          <div className="absolute -top-3 -left-3 z-10">
            <div className={`${badge.colorClass} px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg`}>
              {badge.label}
            </div>
          </div>
        )}

        {/* Category icon - top right */}
        {category && (
          <div className="absolute -top-4 -right-4 z-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${categoryAccent}25` }}
            >
              <CategoryIcon category={category as MissionCategory} size={28} style={{ color: categoryAccent }} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-0 flex flex-col flex-grow space-y-4">
          {/* Category label */}
          {category && (
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: `${categoryAccent}20`,
                  color: categoryAccent,
                }}
              >
                {CATEGORY_LABELS[category as MissionCategory] ?? category}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-black tracking-tight text-slate-900 line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 font-medium">
            {description}
          </p>

          {/* Location & Time */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{location || 'Non spécifié'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{timeAgo(createdAt)}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {/* Footer: Author + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${creatorGradient} flex items-center justify-center text-white font-bold text-xs`}>
                {creatorInitial}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {creatorName || 'Anonyme'}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className={`text-xs font-black ${ctaColor} uppercase tracking-widest`}>
                Voir détails →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
