'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MissionCard } from '@/components/missions/MissionCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useMissions } from '@/hooks/useMissions';

const STEPS = [
  {
    number: '01',
    title: 'Publiez votre besoin',
    description: "Décrivez votre situation en quelques mots. Catégorie, urgence, localisation — c'est prêt en 2 minutes.",
    color: '#ea580c',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'La communauté répond',
    description: 'Des personnes proches de vous reçoivent une notification et peuvent participer, conseiller ou financer.',
    color: '#7c3aed',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Ensemble, on avance',
    description: 'Suivez les contributions en temps réel. Clôturez la mission quand le besoin est satisfait.',
    color: '#10b981',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

const subtitleWords = 'Trouvez des solutions, soyez la solution. Tout simplement.'.split(' ');

export default function HomePage() {
  const { data } = useMissions({ limit: 6 });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, oklch(0.65 0.2 25 / 0.12), transparent 70%)',
            borderRadius: '50%',
            top: '-200px',
            right: '-150px',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, oklch(0.6 0.15 280 / 0.1), transparent 70%)',
            borderRadius: '50%',
            bottom: '-100px',
            left: '-120px',
            pointerEvents: 'none',
          }}
        />

        <div className="relative container mx-auto max-w-3xl">
          <FadeIn>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl font-display leading-tight">
              La solidarité,{' '}
              <span className="gradient-text-primary">en action</span>
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

          <FadeIn delay={0.9} className="mt-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="shimmer shadow-lg text-white border-none px-8 font-semibold"
                style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 280), oklch(0.6 0.15 320))' }}
              >
                <Link href="/missions/new">Créer une Mission</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/offers/new">Proposer une Offre</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold font-display">Comment ça marche ?</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Trois étapes simples pour transformer un besoin en action collective.
            </p>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold font-display text-lg shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}bb)`,
                    }}
                  >
                    {step.number}
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ color: step.color, background: `${step.color}18` }}
                  >
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mt-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Missions récentes */}
      {data?.data && data.data.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl font-bold font-display">Missions récentes</h2>
              <Button variant="ghost" asChild>
                <Link href="/missions">Voir tout →</Link>
              </Button>
            </motion.div>

            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="relative py-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(135deg, oklch(0.65 0.2 25 / 0.07), oklch(0.6 0.15 280 / 0.07))',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative container mx-auto max-w-2xl text-center space-y-6"
        >
          <h2 className="text-3xl font-bold font-display">Rejoignez la communauté</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Des milliers de personnes s'entraident déjà. Publiez votre premier besoin ou proposez votre aide dès aujourd'hui.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              asChild
              className="shimmer shadow-lg text-white border-none px-8 font-semibold"
              style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 280), oklch(0.6 0.15 320))' }}
            >
              <Link href="/missions/new">Créer une Mission</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8">
              <Link href="/missions">Explorer les missions</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
