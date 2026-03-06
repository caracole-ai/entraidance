'use client';

import { t } from '@/i18n';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ContributionButtons } from '@/components/missions/ContributionButtons';
import { CloseMissionDialog } from '@/components/missions/CloseMissionDialog';
import { EditMissionDialog } from '@/components/missions/EditMissionDialog';
import { useMission } from '@/hooks/useMission';
import { useContributions } from '@/hooks/useContributions';
import { useAuth } from '@/hooks/useAuth';
import { missionsApi } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CATEGORY_LABELS,
  URGENCY_LABELS,
  HELP_TYPE_LABELS,
  CONTRIBUTION_TYPE_LABELS,
  MissionStatus,
  type Urgency,
  type MissionCategory,
} from '@/lib/types';
import { FadeIn, StaggerItem } from '@/components/ui/motion';
import { DetailHero } from '@/components/detail/DetailHero';

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
  autre: '#6b7280',
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

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

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: mission, isLoading } = useMission(id);
  const { data: contributions } = useContributions(id);

  const deleteMission = useMutation({
    mutationFn: () => missionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success(t('besoins.deleted'));
      router.push('/missions');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erreur';
      if (message !== 'AUTH_REQUIRED') {
        toast.error(message);
      }
    },
  });

  const handleDelete = () => {
    if (window.confirm(t('besoins.confirmDelete'))) {
      deleteMission.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-stitch flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Chargement...</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-stitch flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Mission introuvable.</div>
      </div>
    );
  }

  const isCreator = user?.id === mission.creatorId;
  const isOpen = mission.status === MissionStatus.OUVERTE || mission.status === MissionStatus.EN_COURS;
  const daysLeft = daysUntil(mission.expiresAt);
  const categoryAccent = CATEGORY_ACCENT[mission.category] ?? '#6b7280';

  // Build badges array for DetailHero
  const heroBadges = [
    {
      label: URGENCY_LABELS[mission.urgency],
      color: URGENCY_COLORS[mission.urgency],
      variant: 'gradient' as const,
    },
    {
      label: HELP_TYPE_LABELS[mission.helpType],
      variant: 'outline' as const,
    },
    ...((!isOpen) ? [{
      label: mission.status === MissionStatus.RESOLUE ? t('besoins.status.resolue') : t('besoins.status.expiree'),
      variant: 'secondary' as const,
    }] : []),
  ];

  const subtitle = mission.contributionsCount > 0
    ? `${mission.contributionsCount} personne${mission.contributionsCount > 1 ? 's' : ''} solidaire${mission.contributionsCount > 1 ? 's' : ''} ✨`
    : 'En attente de solidarité…';

  return (
    <div className="min-h-screen bg-gradient-stitch pb-20">
      <div className="container mx-auto max-w-4xl px-6 pt-8 space-y-4">
        {/* Hero - using shared component */}
        <FadeIn>
          <DetailHero
            title={mission.title}
            subtitle={subtitle}
            badges={heroBadges}
            category={mission.category}
            categoryLabel={CATEGORY_LABELS[mission.category]}
            creatorName={mission.creator?.displayName}
            createdAt={mission.createdAt}
            creatorGradient="from-purple-400 to-indigo-500"
          />
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.1}>
          <div className="glass-card-liquid p-4 rounded-[1.5rem]">
            <h2 className="text-base font-black tracking-tight text-slate-900 mb-2">Description</h2>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
              {mission.description}
            </p>
          </div>
        </FadeIn>

        {/* Info row */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600 px-2">
            {mission.location && (
              <div className="flex items-center gap-2">
                <MapPin size={18} style={{ color: categoryAccent }} />
                {mission.location}
              </div>
            )}
            {mission.tags && mission.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={18} style={{ color: categoryAccent }} />
                {mission.tags.join(', ')}
              </div>
            )}
            {isOpen && (
              <div className="flex items-center gap-2">
                <Clock size={18} style={{ color: categoryAccent }} />
                Expire dans {daysLeft} jour{daysLeft !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </FadeIn>

        <Separator className="bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        {/* Contribution section */}
        {isOpen && (
          <FadeIn delay={0.25}>
            <div className="glass-card-liquid p-4 rounded-[1.5rem]">
              <h2 className="text-base font-black tracking-tight text-slate-900 mb-3">Contribuer</h2>
              <ContributionButtons missionId={mission.id} />
            </div>
          </FadeIn>
        )}

        {/* Creator actions */}
        {isCreator && (
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              {isOpen && <CloseMissionDialog missionId={mission.id} />}
              <EditMissionDialog mission={mission} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMission.isPending}
                className="glass-sidebar-liquid border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMission.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </FadeIn>
        )}

        <Separator className="bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        {/* Contributions — iMessage-style conversation */}
        <FadeIn delay={0.35}>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">
              Fil de solidarité
              {contributions && contributions.length > 0 && (
                <span className="ml-2 text-lg font-normal text-slate-500">
                  ({contributions.length})
                </span>
              )}
            </h2>
            {contributions && contributions.length > 0 ? (
              <div className="relative glass-hero rounded-[2rem] p-6 md:p-8">
                {/* Chat-style conversation */}
                <div className="space-y-5">
                  {contributions.map((contribution, idx) => {
                    const initial = contribution.user?.displayName?.charAt(0).toUpperCase() ?? 'U';
                    const isEven = idx % 2 === 0;
                    // Couleurs aplats alignées sur les boutons de contribution
                    const bubbleColors: Record<string, string> = {
                      participe: 'bg-[#6366f1] text-white', // bleu violet
                      propose: 'bg-[#9333ea] text-white', // violet pourpre
                      finance: 'bg-[#14b8a6] text-white', // teal
                      conseille: 'bg-[#eab308] text-white', // jaune
                    };
                    const bubbleColor = bubbleColors[contribution.type] ?? bubbleColors.participe;
                    const badgeColors: Record<string, string> = {
                      participe: 'bg-white/20 text-white/90',
                      propose: 'bg-white/20 text-white/90',
                      finance: 'bg-white/20 text-white/90',
                      conseille: 'bg-white/20 text-white/90',
                    };
                    const badgeColor = badgeColors[contribution.type] ?? badgeColors.participe;

                    return (
                      <StaggerItem key={contribution.id}>
                        <div className={`flex items-end gap-2.5 ${isEven ? '' : 'flex-row-reverse'}`}>
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0 shadow-sm">
                            {initial}
                          </div>
                          {/* Bubble */}
                          <div className={`max-w-[75%] ${isEven ? '' : 'items-end'}`}>
                            <p className={`text-xs font-semibold mb-1 ${isEven ? 'text-left' : 'text-right'} text-slate-500`}>
                              {contribution.user?.displayName}
                            </p>
                            <div className={`${bubbleColor} px-4 py-3 shadow-lg ${isEven ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-br-md'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                                  {CONTRIBUTION_TYPE_LABELS[contribution.type]}
                                </span>
                              </div>
                              {contribution.message && (
                                <p className="font-medium leading-relaxed text-[0.9375rem]">
                                  {contribution.message}
                                </p>
                              )}
                            </div>
                            <p className={`text-[10px] mt-1 text-slate-400 font-medium ${isEven ? 'text-left' : 'text-right'}`}>
                              {timeAgo(contribution.createdAt)}
                            </p>
                          </div>
                        </div>
                      </StaggerItem>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 glass-hero rounded-[2rem] p-8">
                <p className="text-slate-600 font-medium">
                  Pas encore de contributions. Soyez le premier à tendre la main ✨
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
