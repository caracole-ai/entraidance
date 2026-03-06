'use client';

import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { getCategoryAccent, timeAgo } from '@/components/shared/constants';
import type { MissionCategory } from '@/lib/types';

export interface DetailHeroBadge {
  label: string;
  color?: string; // gradient class like 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
  accent?: string; // hex color for category-style badge
  variant?: 'gradient' | 'accent' | 'outline' | 'secondary';
}

interface DetailHeroProps {
  title: string;
  subtitle?: string;
  badges: DetailHeroBadge[];
  category?: MissionCategory;
  categoryLabel?: string;
  creatorName?: string;
  createdAt: string;
  creatorGradient?: string; // default: 'from-purple-400 to-indigo-500'
}

export function DetailHero({
  title,
  subtitle,
  badges,
  category,
  categoryLabel,
  creatorName,
  createdAt,
  creatorGradient = 'from-purple-400 to-indigo-500',
}: DetailHeroProps) {
  const categoryAccent = getCategoryAccent(category);
  const creatorInitial = creatorName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="glass-hero rounded-[2rem] p-4 md:p-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left Column - Main Content (col-span-8) */}
        <div className="col-span-12 md:col-span-8 space-y-3">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            {badges.map((badge, idx) => {
              if (badge.variant === 'gradient' && badge.color) {
                return (
                  <div
                    key={idx}
                    className={`${badge.color} px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm`}
                  >
                    {badge.label}
                  </div>
                );
              }
              if (badge.variant === 'accent' && badge.accent) {
                return (
                  <span
                    key={idx}
                    className="inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${badge.accent}20`,
                      color: badge.accent,
                    }}
                  >
                    {badge.label}
                  </span>
                );
              }
              if (badge.variant === 'secondary') {
                return (
                  <Badge key={idx} variant="secondary" className="text-xs font-bold uppercase tracking-wider rounded-xl">
                    {badge.label}
                  </Badge>
                );
              }
              // default: outline
              return (
                <Badge key={idx} variant="outline" className="text-xs font-bold uppercase tracking-wider rounded-xl">
                  {badge.label}
                </Badge>
              );
            })}
            {categoryLabel && (
              <span
                className="inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider"
                style={{
                  backgroundColor: `${categoryAccent}20`,
                  color: categoryAccent,
                }}
              >
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-slate-600 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Column - Sidebar (col-span-4) */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-3">
          {/* Category Icon Card */}
          {category && (
            <div
              className="flex items-center justify-center p-4 rounded-xl"
              style={{ backgroundColor: `${categoryAccent}15` }}
            >
              <CategoryIcon category={category} size={48} style={{ color: categoryAccent }} />
            </div>
          )}

          {/* Creator Card */}
          {creatorName && (
            <div className="glass-card-liquid p-3 rounded-xl flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${creatorGradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {creatorInitial}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{creatorName}</div>
                <div className="text-slate-500 text-xs">{timeAgo(createdAt)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
