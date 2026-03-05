'use client';

import { useState } from 'react';
import { ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MissionCategory,
  OfferType,
  CATEGORY_LABELS,
  OFFER_TYPE_LABELS,
} from '@/lib/types';

const OFFER_TYPE_COLORS: Record<OfferType, { bg: string; active: string }> = {
  [OfferType.DON]: { bg: 'bg-blue-50 text-blue-700 border-blue-200', active: 'bg-blue-500 text-white border-blue-500' },
  [OfferType.COMPETENCE]: { bg: 'bg-purple-50 text-purple-700 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
  [OfferType.MATERIEL]: { bg: 'bg-orange-50 text-orange-700 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  [OfferType.SERVICE]: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: 'bg-emerald-500 text-white border-emerald-500' },
  [OfferType.ECOUTE]: { bg: 'bg-pink-50 text-pink-700 border-pink-200', active: 'bg-pink-500 text-white border-pink-500' },
  [OfferType.AUTRE]: { bg: 'bg-gray-50 text-gray-700 border-gray-200', active: 'bg-gray-500 text-white border-gray-500' },
};

interface FilterAccordionProps {
  search: string;
  onSearchChange: (value: string) => void;
  offerTypes: OfferType[];
  onOfferTypesChange: (types: OfferType[]) => void;
  categories: MissionCategory[];
  onCategoriesChange: (cats: MissionCategory[]) => void;
}

type Section = 'search' | 'offerType' | 'category' | null;

export function FilterAccordion({
  search,
  onSearchChange,
  offerTypes,
  onOfferTypesChange,
  categories,
  onCategoriesChange,
}: FilterAccordionProps) {
  const [openSection, setOpenSection] = useState<Section>(null);

  const toggleSection = (section: Section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const toggleOfferType = (type: OfferType) => {
    if (offerTypes.includes(type)) {
      onOfferTypesChange(offerTypes.filter((t) => t !== type));
    } else {
      onOfferTypesChange([...offerTypes, type]);
    }
  };

  const toggleCategory = (cat: MissionCategory) => {
    if (categories.includes(cat)) {
      onCategoriesChange(categories.filter((c) => c !== cat));
    } else {
      onCategoriesChange([...categories, cat]);
    }
  };

  const clearAll = () => {
    onSearchChange('');
    onOfferTypesChange([]);
    onCategoriesChange([]);
    setOpenSection(null);
  };

  const hasActiveFilters = search || offerTypes.length > 0 || categories.length > 0;

  return (
    <div className="w-full glass-card-liquid rounded-2xl p-4">
      {/* Header with active filters count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600">
          Filtres de recherche
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
          >
            <X size={14} />
            Tout effacer
          </button>
        )}
      </div>

      {/* Accordion sections */}
      <div className="flex flex-wrap gap-3">
        {/* Search Section */}
        <div className="flex-1 min-w-[200px]">
          <button
            onClick={() => toggleSection('search')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              openSection === 'search'
                ? 'bg-emerald-100 text-emerald-700'
                : 'glass-sidebar-liquid border-white/60 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search size={16} />
              <span>Recherche</span>
              {search && (
                <span className="ml-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px]">
                  1
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${openSection === 'search' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {openSection === 'search' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 px-2">
                  <Input
                    placeholder="Mots-clés..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="glass-sidebar-liquid border-white/60 rounded-xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Offer Type Section */}
        <div className="flex-1 min-w-[200px]">
          <button
            onClick={() => toggleSection('offerType')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              openSection === 'offerType'
                ? 'bg-purple-100 text-purple-700'
                : 'glass-sidebar-liquid border-white/60 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>Type de proposition</span>
              {offerTypes.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white rounded-full text-[10px]">
                  {offerTypes.length}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${openSection === 'offerType' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {openSection === 'offerType' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 px-2 flex flex-wrap gap-2">
                  {Object.values(OfferType).map((ot) => {
                    const isActive = offerTypes.includes(ot);
                    const colors = OFFER_TYPE_COLORS[ot];
                    return (
                      <button
                        key={ot}
                        onClick={() => toggleOfferType(ot)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                          isActive ? colors.active : colors.bg
                        }`}
                      >
                        {OFFER_TYPE_LABELS[ot]}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Section */}
        <div className="flex-1 min-w-[200px]">
          <button
            onClick={() => toggleSection('category')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              openSection === 'category'
                ? 'bg-slate-100 text-slate-700'
                : 'glass-sidebar-liquid border-white/60 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>📂</span>
              <span>Catégorie</span>
              {categories.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-slate-600 text-white rounded-full text-[10px]">
                  {categories.length}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${openSection === 'category' ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {openSection === 'category' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 px-2 flex flex-wrap gap-2">
                  {Object.values(MissionCategory).map((cat) => {
                    const isActive = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-slate-200/60">
          <div className="flex flex-wrap gap-2">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                <Search size={12} />
                {search}
                <button
                  onClick={() => onSearchChange('')}
                  className="hover:bg-emerald-200 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {offerTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
              >
                {OFFER_TYPE_LABELS[type]}
                <button
                  onClick={() => toggleOfferType(type)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                {CATEGORY_LABELS[cat]}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="hover:bg-slate-200 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
