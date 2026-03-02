'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MissionCard } from '@/components/missions/MissionCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useMissions } from '@/hooks/useMissions';
import { t } from '@/i18n';

const STEPS = [
  {
    number: '01',
    title: t('home.step1Title'),
    description: t('home.step1Desc'),
    color: '#7c5cbf',
    icon: '✍️',
  },
  {
    number: '02',
    title: t('home.step2Title'),
    description: t('home.step2Desc'),
    color: '#7c3aed',
    icon: '👥',
  },
  {
    number: '03',
    title: t('home.step3Title'),
    description: t('home.step3Desc'),
    color: '#10b981',
    icon: '✅',
  },
];

const subtitleWords = t('home.subtitle').split(' ');

export default function HomePage() {
  const { data } = useMissions({ limit: 6 });

  return (
    <div className="min-h-screen bg-gradient-stitch">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 py-24 px-4 text-center">
        {/* Decorative blobs */}
        <div
          className="absolute w-[600px] h-[600px] bg-[#9333ea]/20 rounded-full blur-[140px] -top-48 -right-32 pointer-events-none animate-pulse"
          aria-hidden="true"
        />
        <div
          className="absolute w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-[140px] -bottom-24 -left-32 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative container mx-auto max-w-4xl">
          <FadeIn>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="font-display">{t('home.heroTitle1')}</span>{' '}
              <span className="font-elegant gradient-text-primary not-italic text-[1.25em] inline-block float-animation">{t('home.heroTitle2')}</span>
            </h1>
          </FadeIn>

          <div className="mt-6 flex flex-wrap justify-center gap-x-2 gap-y-1 text-xl text-muted-foreground">
            {subtitleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <FadeIn delay={0.9} className="mt-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="h-12 rounded-2xl shadow-[0_20px_40px_-10px_rgba(147,51,234,0.4)] bg-[#9333ea] text-white hover:opacity-90 border-0 px-8 font-bold text-base"
              >
                <Link href="/missions/new">{t('home.ctaCreate')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-2xl px-8 glass-sidebar-liquid border-white/60 hover:bg-white/80 font-bold">
                <Link href="/offers/new">{t('home.ctaOffer')}</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="font-display">{t('home.howItWorks')} </span>
              <span className="font-elegant gradient-text-primary">{t('home.howItWorks2')}</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('home.howItWorksSubtitle')}
            </p>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="glass-card-stitch rounded-[2.5rem] p-8 text-center space-y-4 hover:shadow-2xl"
              >
                <div className="relative inline-block">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold font-display text-xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}bb)`,
                    }}
                  >
                    {step.number}
                  </div>
                  <div className="absolute -bottom-2 -right-2 text-3xl">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mt-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Besoins récents */}
      {data?.data && data.data.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-10"
            >
              <h2 className="text-3xl font-bold font-display">{t('home.recentBesoins')}</h2>
              <Button variant="ghost" asChild className="rounded-xl">
                <Link href="/missions">{t('home.viewAll')}</Link>
              </Button>
            </motion.div>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.data.map((mission) => (
                <StaggerItem key={mission.id}>
                  <MissionCard mission={mission} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="relative py-20 px-4 overflow-hidden mt-16">
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-pink-100/30"
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative container mx-auto max-w-3xl text-center space-y-6"
        >
          <h2 className="text-4xl font-bold tracking-tight">
            <span className="font-display">{t('home.joinTitle1')} </span>
            <span className="font-elegant gradient-text-primary">{t('home.joinTitle2')}</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            {t('home.joinSubtitle')}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-4">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-2xl shadow-[0_20px_40px_-10px_rgba(147,51,234,0.4)] bg-[#9333ea] text-white hover:opacity-90 border-0 px-8 font-bold text-base"
            >
              <Link href="/missions/new">{t('home.ctaCreate')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 rounded-2xl px-8 glass-sidebar-liquid border-white/60 hover:bg-white/80 font-bold">
              <Link href="/missions">{t('home.ctaExplore')}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
