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
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { CategoryIcon, CATEGORY_COLORS } from '@/components/icons/CategoryIcon';

const URGENCY_COLORS: Record<Urgency, string> = {
  faible: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  moyen: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  urgent: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
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
      toast.error(error instanceof Error ? error.message : 'Erreur');
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
  const categoryColor = CATEGORY_COLORS[mission.category];
  const categoryAccent = CATEGORY_ACCENT[mission.category] ?? '#6b7280';
  const creatorInitial = mission.creator?.displayName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-gradient-stitch pb-20">
      <div className="container mx-auto max-w-4xl px-6 space-y-8">
        {/* Hero card avec icône catégorie */}
        <FadeIn>
          <div className="relative glass-hero p-8 md:p-12 rounded-[2.5rem]">
            {/* Icône catégorie en cercle semi-transparent (top-right) */}
            <div className="absolute -top-4 -right-4 z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${categoryAccent}25` }}
              >
                <CategoryIcon category={mission.category} size={28} style={{ color: categoryAccent }} />
              </div>
            </div>

            {/* Badge urgence (top-left) */}
            <div className="absolute top-3 left-3 z-10">
              <div className={`${URGENCY_COLORS[mission.urgency]} px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg`}>
                {URGENCY_LABELS[mission.urgency]}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-0 pt-8">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: `${categoryAccent}20`,
                    color: categoryAccent,
                  }}
                >
                  {CATEGORY_LABELS[mission.category]}
                </span>
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider">
                  {HELP_TYPE_LABELS[mission.helpType]}
                </Badge>
                {!isOpen && (
                  <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                    {mission.status === MissionStatus.RESOLUE ? t('besoins.status.resolue') : t('besoins.status.expiree')}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                {mission.title}
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-600 font-medium mb-6">
                {mission.contributionsCount > 0
                  ? `${mission.contributionsCount} personne${mission.contributionsCount > 1 ? 's' : ''} solidaire${mission.contributionsCount > 1 ? 's' : ''} ✨`
                  : 'En attente de solidarité…'}
              </p>

              {/* Creator */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {creatorInitial}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{mission.creator?.displayName}</div>
                  <div className="text-slate-500 text-xs">{timeAgo(mission.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Description */}
        <FadeIn delay={0.1}>
          <div className="glass-card-liquid p-8 rounded-[2rem]">
            <h2 className="text-xl font-black tracking-tight text-slate-900 mb-4">Description</h2>
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
              {mission.description}
            </p>
          </div>
        </FadeIn>

        {/* Info row */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-600 px-2">
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
            <div className="glass-card-liquid p-8 rounded-[2rem]">
              <h2 className="text-xl font-black tracking-tight text-slate-900 mb-6">Contribuer</h2>
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

        {/* Contributions */}
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
              <StaggerContainer className="space-y-4">
                {contributions.map((contribution) => {
                  const initial = contribution.user?.displayName?.charAt(0).toUpperCase() ?? 'U';
                  return (
                    <StaggerItem key={contribution.id}>
                      <div className="glass-card-liquid p-6 rounded-[1.5rem]">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {initial}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-slate-900">
                                {contribution.user?.displayName}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs font-bold uppercase tracking-wider"
                              >
                                {CONTRIBUTION_TYPE_LABELS[contribution.type]}
                              </Badge>
                            </div>
                            {contribution.message && (
                              <p className="text-slate-700 font-medium leading-relaxed mb-2">
                                {contribution.message}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 font-semibold">
                              {timeAgo(contribution.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
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
