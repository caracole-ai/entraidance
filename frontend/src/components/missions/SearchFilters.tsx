'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  onSearch: (filters: {
    q?: string;
    category?: string[];
    urgency?: string[];
    status?: string[];
    sortBy?: string;
    sortOrder?: string;
  }) => void;
  onReset: () => void;
}

type FilterBadge = {
  value: string;
  label: string;
  color: string;
};

const CATEGORIES: FilterBadge[] = [
  { value: 'demenagement', label: 'Déménagement', color: 'from-purple-400 to-violet-500' },
  { value: 'bricolage', label: 'Bricolage', color: 'from-orange-400 to-amber-500' },
  { value: 'numerique', label: 'Numérique', color: 'from-blue-400 to-cyan-500' },
  { value: 'administratif', label: 'Administratif', color: 'from-sky-400 to-blue-500' },
  { value: 'garde_enfants', label: "Garde d'enfants", color: 'from-pink-400 to-rose-500' },
  { value: 'transport', label: 'Transport', color: 'from-violet-400 to-purple-500' },
  { value: 'ecoute', label: 'Écoute', color: 'from-red-400 to-pink-500' },
  { value: 'emploi', label: 'Emploi', color: 'from-emerald-400 to-teal-500' },
  { value: 'alimentation', label: 'Alimentation', color: 'from-amber-400 to-orange-500' },
  { value: 'animaux', label: 'Animaux', color: 'from-lime-400 to-green-500' },
  { value: 'education', label: 'Éducation', color: 'from-yellow-400 to-amber-500' },
  { value: 'autre', label: 'Autre', color: 'from-slate-400 to-gray-500' },
];

const URGENCIES: FilterBadge[] = [
  { value: 'faible', label: 'Faible', color: 'from-emerald-400 to-teal-400' },
  { value: 'moyen', label: 'Moyen', color: 'from-amber-400 to-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'from-red-500 to-pink-500' },
];

const STATUSES: FilterBadge[] = [
  { value: 'ouverte', label: 'Ouverte', color: 'from-green-400 to-emerald-500' },
  { value: 'en_cours', label: 'En cours', color: 'from-blue-400 to-cyan-500' },
  { value: 'resolue', label: 'Résolue', color: 'from-purple-400 to-violet-500' },
  { value: 'expiree', label: 'Expirée', color: 'from-slate-400 to-gray-500' },
];

export function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [q, setQ] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  const toggleBadge = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const handleSearch = () => {
    onSearch({
      q: q || undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      urgency: selectedUrgencies.length > 0 ? selectedUrgencies : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    setQ('');
    setSelectedCategories([]);
    setSelectedUrgencies([]);
    setSelectedStatuses([]);
    setSortBy('createdAt');
    setSortOrder('DESC');
    onReset();
  };

  const hasActiveFilters =
    q.length > 0 ||
    selectedCategories.length > 0 ||
    selectedUrgencies.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="glass-hero rounded-[2rem] overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            Filtres de recherche
          </h2>
          {hasActiveFilters && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
              {selectedCategories.length + selectedUrgencies.length + selectedStatuses.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-600" />
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              {/* Search input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Recherche textuelle
                </label>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Titre ou description..."
                  className="bg-white/60 backdrop-blur border-white/40 focus:border-purple-400 focus:ring-purple-400/30"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Catégories
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        onClick={() =>
                          toggleBadge(cat.value, selectedCategories, setSelectedCategories)
                        }
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                            : 'bg-white/60 text-slate-600 hover:bg-white/80'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Urgencies */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Urgence
                </label>
                <div className="flex flex-wrap gap-2">
                  {URGENCIES.map((urg) => {
                    const isActive = selectedUrgencies.includes(urg.value);
                    return (
                      <button
                        key={urg.value}
                        onClick={() =>
                          toggleBadge(urg.value, selectedUrgencies, setSelectedUrgencies)
                        }
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${urg.color} text-white shadow-lg scale-105`
                            : 'bg-white/60 text-slate-600 hover:bg-white/80'
                        }`}
                      >
                        {urg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statuses */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((stat) => {
                    const isActive = selectedStatuses.includes(stat.value);
                    return (
                      <button
                        key={stat.value}
                        onClick={() =>
                          toggleBadge(stat.value, selectedStatuses, setSelectedStatuses)
                        }
                        className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${stat.color} text-white shadow-lg scale-105`
                            : 'bg-white/60 text-slate-600 hover:bg-white/80'
                        }`}
                      >
                        {stat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur border border-white/40 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  >
                    <option value="createdAt">Date création</option>
                    <option value="expiresAt">Date expiration</option>
                    <option value="urgency">Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ordre
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur border border-white/40 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                  >
                    <option value="DESC">Décroissant</option>
                    <option value="ASC">Croissant</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSearch}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black rounded-2xl shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 w-12 bg-white/60 hover:bg-white/80 border-white/40 rounded-2xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
