'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MissionCard } from '@/components/missions/MissionCard';
import { useMissions } from '@/hooks/useMissions';
import {
  MissionCategory,
  HelpType,
  Urgency,
  CATEGORY_LABELS,
  HELP_TYPE_LABELS,
  URGENCY_LABELS,
  type IMissionFilters,
} from '@/lib/types';

const ALL_VALUE = '__all__';

export default function MissionsPage() {
  const [filters, setFilters] = useState<IMissionFilters>({ page: 1, limit: 12 });
  const { data, isLoading } = useMissions(filters);

  const updateFilter = (key: keyof IMissionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === ALL_VALUE ? undefined : value,
      page: 1,
    }));
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Missions</h1>
        <Button asChild className="w-full sm:w-auto h-11 sm:h-10">
          <Link href="/missions/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="sm:inline">Créer une Mission</span>
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <Input
          placeholder="Rechercher..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <Select
          value={filters.category || ALL_VALUE}
          onValueChange={(v) => updateFilter('category', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toutes les categories</SelectItem>
            {Object.values(MissionCategory).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.helpType || ALL_VALUE}
          onValueChange={(v) => updateFilter('helpType', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type d'aide" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Tous les types</SelectItem>
            {Object.values(HelpType).map((ht) => (
              <SelectItem key={ht} value={ht}>
                {HELP_TYPE_LABELS[ht]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.urgency || ALL_VALUE}
          onValueChange={(v) => updateFilter('urgency', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Urgence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toutes les urgences</SelectItem>
            {Object.values(Urgency).map((u) => (
              <SelectItem key={u} value={u}>
                {URGENCY_LABELS[u]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mission grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Chargement des missions...
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                }
              >
                Precedent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} sur {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                }
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Aucune mission trouvee. Creez la premiere !
        </div>
      )}
    </div>
  );
}
