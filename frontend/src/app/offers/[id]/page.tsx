'use client';

import { t } from '@/i18n';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Tag, Calendar, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOffer } from '@/hooks/useOffer';
import { useAuth } from '@/hooks/useAuth';
import { offersApi } from '@/lib/api';
import { EditOfferDialog } from '@/components/offers/EditOfferDialog';
import {
  OFFER_TYPE_LABELS,
  CATEGORY_LABELS,
  type OfferType,
  type MissionCategory,
  OfferStatus,
} from '@/lib/types';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { CategoryIcon, CATEGORY_COLORS } from '@/components/icons/CategoryIcon';

const OFFER_TYPE_COLORS: Record<OfferType, string> = {
  don: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white',
  competence: 'bg-gradient-to-r from-purple-400 to-violet-400 text-white',
  materiel: 'bg-gradient-to-r from-orange-400 to-amber-400 text-white',
  service: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  ecoute: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white',
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

export default function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: offer, isLoading } = useOffer(id);
  const { data: correlations } = useQuery({
    queryKey: ['offer-correlations', id],
    queryFn: () => offersApi.getCorrelations(id),
    enabled: !!id,
  });

  const handleClose = async () => {
    try {
      await offersApi.close(id);
      toast.success(t('propositions.confirmClose'));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    }
  };

  const deleteOffer = useMutation({
    mutationFn: () => offersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success(t('propositions.deleted'));
      router.push('/offers');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    },
  });

  const handleDelete = () => {
    if (window.confirm(t('propositions.confirmDelete'))) {
      deleteOffer.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-stitch flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Chargement...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-stitch flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Offre introuvable.</div>
      </div>
    );
  }

  const isCreator = user?.id === offer.creatorId;
  const isOpen = offer.status === OfferStatus.OUVERTE || offer.status === OfferStatus.EN_COURS;
  const categoryAccent = offer.category ? (CATEGORY_ACCENT[offer.category as MissionCategory] ?? '#10b981') : '#10b981';
  const creatorInitial = offer.creator?.displayName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen bg-gradient-stitch pb-20">
      <div className="container mx-auto max-w-4xl px-6 mt-20 space-y-8">
        {/* Hero card avec icône catégorie */}
        <FadeIn>
          <div className="relative glass-hero p-8 md:p-12 rounded-[2.5rem]">
            {/* Icône catégorie en cercle semi-transparent (top-right) */}
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

            {/* Badge type offre (top-left) */}
            <div className="absolute top-3 left-3 z-10">
              <div className={`${OFFER_TYPE_COLORS[offer.offerType]} px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg`}>
                {OFFER_TYPE_LABELS[offer.offerType]}
              </div>
            </div>

            {/* Content */}
            <div className="relative z-0 pt-8">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {offer.category && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.15em]"
                    style={{
                      backgroundColor: `${categoryAccent}20`,
                      color: categoryAccent,
                    }}
                  >
                    {CATEGORY_LABELS[offer.category as MissionCategory]}
                  </span>
                )}
                {!isOpen && (
                  <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">
                    {offer.status === OfferStatus.CLOTUREE ? 'Clôturée' : 'Expirée'}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-6">
                {offer.title}
              </h1>

              {/* Creator */}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {creatorInitial}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{offer.creator?.displayName}</div>
                  <div className="text-slate-500 text-xs">{timeAgo(offer.createdAt)}</div>
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
              {offer.description}
            </p>
          </div>
        </FadeIn>

        {/* Availability */}
        {offer.availability && (
          <FadeIn delay={0.15}>
            <div className="glass-card-liquid p-8 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} style={{ color: categoryAccent }} />
                <h2 className="text-xl font-black tracking-tight text-slate-900">Disponibilité</h2>
              </div>
              <p className="text-slate-700 font-medium">{offer.availability}</p>
            </div>
          </FadeIn>
        )}

        {/* Info row */}
        <FadeIn delay={0.2}>
          <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-600 px-2">
            {offer.location && (
              <div className="flex items-center gap-2">
                <MapPin size={18} style={{ color: categoryAccent }} />
                {offer.location}
              </div>
            )}
            {offer.tags && offer.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag size={18} style={{ color: categoryAccent }} />
                {offer.tags.join(', ')}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Creator actions */}
        {isCreator && (
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap gap-3">
              {isOpen && (
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="glass-sidebar-liquid border-white/60 rounded-xl font-bold"
                >
                  {t('besoins.close.title')}
                </Button>
              )}
              <EditOfferDialog offer={offer} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleteOffer.isPending}
                className="glass-sidebar-liquid border-red-300 text-red-600 hover:bg-red-50 font-bold rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteOffer.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </FadeIn>
        )}

        <Separator className="bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        {/* Correlated missions */}
        <FadeIn delay={0.3}>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">
              Missions corrélées
              {correlations && correlations.length > 0 && (
                <span className="ml-2 text-lg font-normal text-slate-500">
                  ({correlations.length})
                </span>
              )}
            </h2>
            {correlations && correlations.length > 0 ? (
              <StaggerContainer className="space-y-4">
                {correlations.map((correlation) => (
                  <StaggerItem key={correlation.id}>
                    <Link href={`/missions/${correlation.missionId}`}>
                      <div className="glass-card-liquid p-6 rounded-[1.5rem] hover:shadow-2xl transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-1">
                              {correlation.mission?.title}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">
                              Score de corrélation: {Math.round(correlation.score * 100)}%
                            </p>
                          </div>
                          <div className="text-emerald-600 font-black text-xs">
                            →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-12 glass-hero rounded-[2rem] p-8">
                <p className="text-slate-600 font-medium">
                  Aucune mission corrélée pour le moment.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
