'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { useMissions } from '@/hooks/useMissions';
import { t } from '@/i18n';
import { useOffers } from '@/hooks/useOffers';
import {
  CATEGORY_LABELS,
  URGENCY_LABELS,
  OFFER_TYPE_LABELS,
  type Urgency,
  type OfferType,
  MissionStatus,
} from '@/lib/types';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { timeAgo } from '@/components/shared/constants';

// Profile-specific soft colors (different from card gradients)
const URGENCY_COLORS: Record<Urgency, string> = {
  faible: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  moyen: 'bg-amber-50 text-amber-700 border border-amber-200',
  urgent: 'bg-red-50 text-red-700 border border-red-200',
};

const OFFER_TYPE_COLORS: Record<OfferType, string> = {
  don: 'bg-blue-50 text-blue-700 border border-blue-200',
  competence: 'bg-purple-50 text-purple-700 border border-purple-200',
  materiel: 'bg-orange-50 text-orange-700 border border-orange-200',
  service: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ecoute: 'bg-pink-50 text-pink-700 border border-pink-200',
};

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 700;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{displayed}</span>;
}

const STAT_CARDS = [
  { key: 'missionsCreated', label: t('profile.stats.besoinsCreated'), icon: '🎯' },
  { key: 'missionsResolved', label: t('profile.stats.resolved'), icon: '✅' },
  { key: 'contributionsGiven', label: t('profile.stats.contributions'), icon: '🤝' },
  { key: 'offersCreated', label: t('profile.stats.propositions'), icon: '💡' },
] as const;

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: stats } = useUserStats();
  const { data: missionsData } = useMissions({ limit: 50 });
  const { data: offersData } = useOffers({ limit: 50 });
  const [tab, setTab] = useState('missions');

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center text-muted-foreground">
        Connectez-vous pour voir votre profil.
      </div>
    );
  }

  const myMissions = missionsData?.data?.filter((m) => m.creatorId === user.id) ?? [];
  const myOffers = offersData?.data?.filter((o) => o.creatorId === user.id) ?? [];
  const userInitial = user.displayName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="container mx-auto max-w-4xl px-4 pt-20 py-8 space-y-8">
      {/* User info */}
      <FadeIn>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-md">
              <AvatarFallback className="text-2xl font-bold gradient-primary text-white font-display">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">{user.displayName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(myMissions.length !== 1 ? 'profile.summary_besoin_other' : 'profile.summary_besoin_one', { count: myMissions.length })} &middot;{' '}
              {t(myOffers.length !== 1 ? 'profile.summary_proposition_other' : 'profile.summary_proposition_one', { count: myOffers.length })}
            </p>
          </div>
        </div>
      </FadeIn>

      <Separator />

      {/* Stats */}
      <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat, i) => (
          <StaggerItem key={stat.key}>
            <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-3xl font-bold font-display gradient-text-primary">
                  {stats ? (
                    <AnimatedNumber value={stats[stat.key]} />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <Separator />

      {/* Tabs */}
      <FadeIn delay={0.2}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="missions" className="flex-1 sm:flex-none">
              {t('profile.tabs.besoins')}
              {myMissions.length > 0 && (
                <span className="ml-2 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {myMissions.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex-1 sm:flex-none">
              {t('profile.tabs.propositions')}
              {myOffers.length > 0 && (
                <span className="ml-2 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {myOffers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missions" className="mt-6">
            {myMissions.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {myMissions.map((mission) => (
                  <StaggerItem key={mission.id}>
                    <Link href={`/missions/${mission.id}`}>
                      <Card className="transition-all hover:shadow-md cursor-pointer border-border/60 hover:border-primary/20">
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge variant="outline" className="flex-shrink-0 text-xs">
                                {CATEGORY_LABELS[mission.category]}
                              </Badge>
                              <Badge className={`flex-shrink-0 text-xs ${URGENCY_COLORS[mission.urgency]}`}>
                                {URGENCY_LABELS[mission.urgency]}
                              </Badge>
                              <span className="text-sm font-medium truncate">
                                {mission.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant={mission.status === MissionStatus.RESOLUE ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {mission.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {timeAgo(mission.createdAt)}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-medium">Aucune mission creee</p>
                <p className="text-sm mt-1">Publiez votre premiere mission pour obtenir de l&apos;aide.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            {myOffers.length > 0 ? (
              <StaggerContainer className="space-y-3">
                {myOffers.map((offer) => (
                  <StaggerItem key={offer.id}>
                    <Link href={`/offers/${offer.id}`}>
                      <Card className="transition-all hover:shadow-md cursor-pointer border-border/60 hover:border-primary/20">
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge className={`flex-shrink-0 text-xs ${OFFER_TYPE_COLORS[offer.offerType]}`}>
                                {OFFER_TYPE_LABELS[offer.offerType]}
                              </Badge>
                              {offer.category && (
                                <Badge variant="outline" className="flex-shrink-0 text-xs">
                                  {CATEGORY_LABELS[offer.category]}
                                </Badge>
                              )}
                              <span className="text-sm font-medium truncate">
                                {offer.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="secondary" className="text-xs">{offer.status}</Badge>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {timeAgo(offer.createdAt)}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-3">💡</p>
                <p className="font-medium">Aucune offre creee</p>
                <p className="text-sm mt-1">Proposez votre aide en creant une offre.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
