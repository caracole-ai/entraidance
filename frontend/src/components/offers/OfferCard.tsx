'use client';

import { ItemCard } from '@/components/shared/ItemCard';
import { OFFER_TYPE_COLORS } from '@/components/shared/constants';
import { type IOffer, OFFER_TYPE_LABELS, type MissionCategory } from '@/lib/types';

interface OfferCardProps {
  offer: IOffer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const badge = {
    label: OFFER_TYPE_LABELS[offer.offerType],
    colorClass: OFFER_TYPE_COLORS[offer.offerType],
  };

  return (
    <ItemCard
      href={`/offers/${offer.id}`}
      title={offer.title}
      description={offer.description}
      category={offer.category as MissionCategory}
      location={offer.location}
      createdAt={offer.createdAt}
      creatorName={offer.creator?.displayName}
      creatorGradient="from-emerald-400 to-teal-500"
      badge={badge}
      ctaColor="text-emerald-600"
    />
  );
}
