'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OfferCard } from '@/components/offers/OfferCard';
import { useOffers } from '@/hooks/useOffers';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { type IOfferFilters } from '@/lib/api';
import {
  MissionCategory,
  OfferType,
  CATEGORY_LABELS,
  OFFER_TYPE_LABELS,
} from '@/lib/types';
import { t } from '@/i18n';

const ALL_VALUE = '__all__';

const OFFER_TYPE_COLORS: Record<OfferType, { bg: string; active: string }> = {
  [OfferType.DON]: { bg: 'bg-blue-50 text-blue-700 border-blue-200', active: 'bg-blue-500 text-white border-blue-500' },
  [OfferType.COMPETENCE]: { bg: 'bg-purple-50 text-purple-700 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
  [OfferType.MATERIEL]: { bg: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  [OfferType.SERVICE]: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-500 text-white border-emerald-500' },
  [OfferType.ECOUTE]: { bg: 'bg-pink-50 text-pink-700 border-pink-200', active: 'bg-pink-500 text-white border-pink-500' },
  [OfferType.AUTRE]: { bg: 'bg-gray-50 text-gray-700 border-gray-200', active: 'bg-gray-500 text-white border-gray-500' },
};

export default function OffersPage() {
  const [filters, setFilters] = useState<IOfferFilters>({ page: 1, limit: 12 });
  const { data, isLoading } = useOffers(filters);

  const updateFilter = (key: keyof IOfferFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === ALL_VALUE ? undefined : value,
      page: 1,
    }));
  };

  const toggleFilter = (key: keyof IOfferFilters, value: string) => {
    const current = filters[key] as string | undefined;
    updateFilter(key, current === value ? ALL_VALUE : value);
  };

  return (
    <div className="min-h-screen bg-gradient-stitch">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-8 md:pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Abstract Liquid Glass Shapes (background blobs) */}
          <div className="absolute -top-24 -left-20 w-[450px] h-[450px] bg-emerald-500/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-10 glass-hero p-8 md:p-16 rounded-[3.5rem] flex flex-col items-center text-center gap-8">
            <div className="space-y-6 max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-black uppercase tracking-[0.2em]">
                Partagez vos talents
              </span>
              <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Propositions{' '}
                d&apos;
                <span 
                  className="inline-block animate-float text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 text-glow px-2 font-['Marck_Script'] text-[1.1em] rotate-[-2deg]"
                >
                  aide
                </span>{' '}
                ✨
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
                Découvrez les talents et ressources partagés par notre communauté solidaire.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button asChild className="group relative flex items-center gap-3 px-10 py-6 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] overflow-hidden border-0">
                <Link href="/offers/new">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Plus className="relative z-10" size={24} />
                  <span className="relative z-10">Proposer mon aide</span>
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
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex flex-col gap-8 shrink-0">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">
                Filtres de recherche
              </h3>

              <div className="space-y-6">
                {/* Search */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <Search size={18} className="text-emerald-600" />
                    Recherche
                  </label>
                  <Input
                    placeholder="Mots-clés..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="glass-sidebar-liquid border-white/60 rounded-xl"
                  />
                </div>

                {/* Offer Type */}
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <Sparkles size={18} className="text-emerald-600" />
                    Type de proposition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(OfferType).map((ot) => {
                      const isActive = filters.offerType === ot;
                      const colors = OFFER_TYPE_COLORS[ot];
                      return (
                        <button
                          key={ot}
                          onClick={() => toggleFilter('offerType', ot)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            isActive ? colors.active : colors.bg
                          }`}
                        >
                          {OFFER_TYPE_LABELS[ot]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest">
                    <span className="text-emerald-600">📂</span>
                    Catégorie
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(MissionCategory).map((cat) => {
                      const isActive = filters.category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleFilter('category', cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                            isActive
                              ? 'bg-slate-700 text-white border-slate-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {CATEGORY_LABELS[cat]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Offers Cards Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-16 text-slate-600">
                <div className="text-4xl mb-3">⏳</div>
                <p className="font-semibold">{t('propositions.loading')}</p>
              </div>
            ) : data?.data && data.data.length > 0 ? (
              <>
                <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
                  {data.data.map((offer) => (
                    <StaggerItem key={offer.id}>
                      <OfferCard offer={offer} />
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
                <div className="text-6xl mb-4">🌟</div>
                <h3 className="text-lg font-black mb-2 text-slate-900">{t('propositions.none')}</h3>
                <p className="text-slate-600 mb-6 font-medium">
                  {t('propositions.noneSubtitle')}
                </p>
                <Button asChild className="bg-emerald-600 text-white border-0 hover:opacity-90 rounded-xl font-bold px-8 py-4">
                  <Link href="/offers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('propositions.create')}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
