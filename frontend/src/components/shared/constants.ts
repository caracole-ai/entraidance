import type { MissionCategory, Urgency, OfferType } from '@/lib/types';

export const CATEGORY_ACCENT: Record<MissionCategory, string> = {
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

export const URGENCY_COLORS: Record<Urgency, string> = {
  faible: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  moyen: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  urgent: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
};

export const OFFER_TYPE_COLORS: Record<OfferType, string> = {
  don: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white',
  competence: 'bg-gradient-to-r from-purple-400 to-violet-400 text-white',
  materiel: 'bg-gradient-to-r from-orange-400 to-amber-400 text-white',
  service: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  ecoute: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
};

export function timeAgo(dateStr: string): string {
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

export function getCategoryAccent(category?: MissionCategory | string | null): string {
  if (!category) return '#6b7280';
  return CATEGORY_ACCENT[category as MissionCategory] ?? '#6b7280';
}
