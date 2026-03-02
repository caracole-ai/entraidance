'use client';

import Link from 'next/link';
import { CategoryIcon, CATEGORY_COLORS } from '@/components/icons/CategoryIcon';
import {
  type IOffer,
  type OfferType,
  type MissionCategory,
  OFFER_TYPE_LABELS,
  CATEGORY_LABELS,
} from '@/lib/types';
import { MapPin, Clock } from 'lucide-react';

const OFFER_TYPE_COLORS: Record<OfferType, string> = {
  don: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white',
  competence: 'bg-gradient-to-r from-purple-400 to-violet-400 text-white',
  materiel: 'bg-gradient-to-r from-orange-400 to-amber-400 text-white',
  service: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  ecoute: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
};

const CATEGORY_BG_COLORS: Record<MissionCategory, string> = {
  sante: 'bg-gradient-to-br from-indigo-400/90 to-indigo-500/90',
  logement: 'bg-gradient-to-br from-green-400/90 to-green-500/90',
  alimentation: 'bg-gradient-to-br from-orange-400/90 to-orange-500/90',
  emploi: 'bg-gradient-to-br from-pink-400/90 to-pink-500/90',
  education: 'bg-gradient-to-br from-yellow-400/90 to-yellow-500/90',
  administratif: 'bg-gradient-to-br from-cyan-400/90 to-cyan-500/90',
  mobilite: 'bg-gradient-to-br from-purple-400/90 to-purple-500/90',
  lien_social: 'bg-gradient-to-br from-rose-400/90 to-rose-500/90',
};

const CATEGORY_ACCENT: Record<MissionCategory, string> = {
  sante: '#6366f1',
  logement: '#10b981',
  alimentation: '#f97316',
  emploi: '#ec4899',
  education: '#eab308',
  administratif: '#06b6d4',
  mobilite: '#a855f7',
  lien_social: '#f43f5e',
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

interface OfferCardProps {
  offer: IOffer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const categoryBgColor = offer.category 
    ? (CATEGORY_BG_COLORS[offer.category as MissionCategory] ?? 'bg-gradient-to-br from-gray-400/90 to-gray-500/90')
    : 'bg-gradient-to-br from-gray-400/90 to-gray-500/90';
  const categoryAccent = offer.category
    ? (CATEGORY_ACCENT[offer.category as MissionCategory] ?? '#6b7280')
    : '#6b7280';

  return (
    <Link href={`/offers/${offer.id}`} className="block group">
      <div className="relative h-full glass-card-liquid rounded-[3rem] p-8 pt-16">
        {/* Offer type badge - top left */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`${OFFER_TYPE_COLORS[offer.offerType]} px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg`}>
            {OFFER_TYPE_LABELS[offer.offerType]}
          </div>
        </div>

        {/* Category icon - top right, slightly overflowing card */}
        {offer.category && (
          <div className="absolute -top-4 -right-4 z-10">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${categoryAccent}25` }}
            >
              <CategoryIcon category={offer.category as MissionCategory} size={28} style={{ color: categoryAccent }} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-0 space-y-4">
          {/* Category label */}
          {offer.category && (
            <div>
              <span 
                className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.15em]"
                style={{ 
                  backgroundColor: `${categoryAccent}20`,
                  color: categoryAccent 
                }}
              >
                {CATEGORY_LABELS[offer.category as MissionCategory]}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-black tracking-tight text-slate-900 line-clamp-2 leading-tight">
            {offer.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 font-medium">
            {offer.description}
          </p>

          {/* Location & Time */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              <span>{offer.location || 'Non spécifié'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{timeAgo(offer.createdAt)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

          {/* Footer: Author + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                {offer.creator?.displayName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {offer.creator?.displayName || 'Anonyme'}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                Voir détails →
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
