'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from './button';

type FilterBadge = {
  value: string;
  label: string;
  color: string;
};

type FilterGroup = {
  label: string;
  icon?: React.ReactNode;
  badges: FilterBadge[];
  selected: string[];
  onToggle: (value: string) => void;
};

interface FilterAccordionProps {
  groups: FilterGroup[];
  onReset: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function FilterAccordion({
  groups,
  onReset,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
}: FilterAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalActiveFilters = groups.reduce((sum, g) => sum + g.selected.length, 0);

  return (
    <div className="glass-hero rounded-[2rem] overflow-hidden mb-8">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/20 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-tight text-slate-900">
            🔍 Filtres de recherche
          </span>
          {totalActiveFilters > 0 && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
              {totalActiveFilters}
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
              {onSearchChange && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Recherche textuelle
                  </label>
                  <input
                    type="text"
                    value={searchValue || ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 backdrop-blur border border-white/40 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400"
                  />
                </div>
              )}

              {/* Filter groups */}
              {groups.map((group, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    {group.icon}
                    {group.label}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.badges.map((badge) => {
                      const isActive = group.selected.includes(badge.value);
                      return (
                        <button
                          key={badge.value}
                          onClick={() => group.onToggle(badge.value)}
                          className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                            isActive
                              ? `bg-gradient-to-r ${badge.color} text-white shadow-lg scale-105`
                              : 'bg-white/60 text-slate-600 hover:bg-white/80 hover:scale-102'
                          }`}
                        >
                          {badge.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Reset button */}
              <div className="pt-2">
                <Button
                  onClick={onReset}
                  variant="outline"
                  className="w-full h-12 bg-white/60 hover:bg-white/80 border-white/40 rounded-2xl font-bold"
                >
                  <X className="h-5 w-5 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
