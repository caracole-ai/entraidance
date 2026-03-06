'use client';

import { ItemCard } from '@/components/shared/ItemCard';
import { URGENCY_COLORS } from '@/components/shared/constants';
import { type IMission, URGENCY_LABELS } from '@/lib/types';

interface MissionCardProps {
  mission: IMission;
}

export function MissionCard({ mission }: MissionCardProps) {
  // Only show urgency badge when urgent
  const badge = mission.urgency === 'urgent'
    ? { label: URGENCY_LABELS[mission.urgency], colorClass: URGENCY_COLORS[mission.urgency] }
    : null;

  return (
    <ItemCard
      href={`/missions/${mission.id}`}
      title={mission.title}
      description={mission.description}
      category={mission.category}
      location={mission.location}
      createdAt={mission.createdAt}
      creatorName={mission.creator?.displayName}
      creatorGradient="from-purple-400 to-indigo-500"
      badge={badge}
      ctaColor="text-[#9333ea]"
    />
  );
}
