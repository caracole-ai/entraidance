'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MissionCard } from '@/components/missions/MissionCard';
import { useMissions } from '@/hooks/useMissions';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { FilterAccordion } from '@/components/ui/FilterAccordion';
import {
  MissionCategory,
  HelpType,
  Urgency,
  CATEGORY_LABELS,
  HELP_TYPE_LABELS,
  URGENCY_LABELS,
  type IMissionFilters,
} from '@/lib/types';
import { t } from '@/i18n';

export default function MissionsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedHelpTypes, setSelectedHelpTypes] = useState<string[]>([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState<string[]>([]);

  // Build filters for API - send first selected value to maintain backend compatibility
  const filters = useMemo<IMissionFilters>(() => ({
    page: 1,
    limit: 12,
    search: searchText || undefined,
    category: selectedCategories[0] as MissionCategory | undefined,
    helpType: selectedHelpTypes[0] as HelpType | undefined,
    urgency: selectedUrgencies[0] as Urgency | undefined,
  }), [searchText, selectedCategories, selectedHelpTypes, selectedUrgencies]);

  const { data, isLoading } = useMissions(filters);

  const toggleMultiSelect = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedHelpTypes([]);
    setSelectedUrgencies([]);
  };

  return (
    <div className="min-h-screen bg-gradient-stitch">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-8 md:pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Abstract Liquid Glass Shapes (background blobs) */}
          <div className="absolute -top-24 -left-20 w-[450px] h-[450px] bg-[#9333ea]/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 glass-hero p-8 md:p-16 rounded-[3.5rem] flex flex-col items-center text-center gap-8">
            <div className="space-y-6 max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#9333ea]/10 text-[#9333ea] text-xs font-black uppercase tracking-[0.2em]">
                La solidarité réinventée
              </span>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Besoins{' '}
                d&apos;
                <span 
                  className="inline-block animate-float text-transparent bg-clip-text bg-gradient-to-r from-[#9333ea] via-indigo-500 to-purple-400 text-glow px-2 font-['Marck_Script'] text-[1.1em] rotate-[-2deg]"
                >
                  entraide
                </span>{' '}
                🤝
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Partageons nos talents et aidons-nous mutuellement dans une ambiance chaleureuse, solidaire et moderne.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild className="group relative flex items-center gap-3 px-10 py-6 bg-[#9333ea] text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(147,51,234,0.4)] overflow-hidden border-0">
                <Link href="/missions/new">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Plus className="relative z-10" size={24} />
                  <span className="relative z-10">Exprimer un besoin</span>
                </Link>
              </Button>
              <Button variant="outline" className="px-10 py-6 glass-sidebar-liquid rounded-2xl font-black text-lg text-slate-800 hover:bg-white/80 transition-all border-white/50">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20 w-full">
        {/* Horizontal Filter Accordion */}
        <FilterAccordion
          searchValue={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Rechercher par titre ou description..."
          groups={[
            {
              label: 'Type de besoin',
              icon: <span className="text-[#9333ea]">✨</span>,
              badges: Object.values(HelpType).map((ht) => ({
                value: ht,
                label: HELP_TYPE_LABELS[ht],
                color: {
                  [HelpType.FINANCIERE]: 'from-emerald-400 to-teal-500',
                  [HelpType.CONSEIL]: 'from-violet-400 to-purple-500',
                  [HelpType.MATERIEL]: 'from-amber-400 to-orange-500',
                  [HelpType.RELATION]: 'from-pink-400 to-rose-500',
                  [HelpType.AUTRE]: 'from-slate-400 to-gray-500',
                }[ht],
              })),
              selected: selectedHelpTypes,
              onToggle: (v) => toggleMultiSelect(v, selectedHelpTypes, setSelectedHelpTypes),
            },
            {
              label: 'Urgence',
              icon: <span className="text-[#9333ea]">⏱️</span>,
              badges: Object.values(Urgency).map((u) => ({
                value: u,
                label: URGENCY_LABELS[u],
                color: {
                  [Urgency.FAIBLE]: 'from-sky-400 to-blue-400',
                  [Urgency.MOYEN]: 'from-orange-400 to-amber-500',
                  [Urgency.URGENT]: 'from-red-500 to-pink-500',
                }[u],
              })),
              selected: selectedUrgencies,
              onToggle: (v) => toggleMultiSelect(v, selectedUrgencies, setSelectedUrgencies),
            },
            {
              label: 'Catégorie',
              icon: <span className="text-[#9333ea]">📂</span>,
              badges: Object.values(MissionCategory).map((cat) => ({
                value: cat,
                label: CATEGORY_LABELS[cat],
                color: 'from-slate-500 to-gray-600',
              })),
              selected: selectedCategories,
              onToggle: (v) => toggleMultiSelect(v, selectedCategories, setSelectedCategories),
            },
          ]}
          onReset={resetFilters}
        />

        {/* Mission Cards Grid */}
        <div className="w-full">
            {isLoading ? (
              <div className="text-center py-16 text-slate-600">
                <div className="text-4xl mb-3">⏳</div>
                <p className="font-semibold">{t('besoins.loading')}</p>
              </div>
            ) : data?.data && data.data.length > 0 ? (
              <>
                <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {data.data.map((mission) => (
                    <StaggerItem key={mission.id}>
                      <MissionCard mission={mission} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={data.page <= 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                      }
                      className="glass-sidebar-liquid border-white/60 rounded-xl font-bold"
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-slate-700 font-semibold px-4">
                      Page {data.page} sur {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={data.page >= data.totalPages}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                      className="glass-sidebar-liquid border-white/60 rounded-xl font-bold"
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 glass-hero rounded-[3rem] p-12">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-lg font-black mb-2 text-slate-900">{t('besoins.none')}</h3>
                <p className="text-slate-600 mb-6 font-medium">
                  {t('besoins.noneSubtitle')}
                </p>
                <Button asChild className="bg-[#9333ea] text-white border-0 hover:opacity-90 rounded-xl font-bold px-8 py-4">
                  <Link href="/missions/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('besoins.create')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}
