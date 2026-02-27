'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: {
    q?: string;
    category?: string;
    urgency?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => void;
  onReset: () => void;
}

export function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('DESC');

  const handleSearch = () => {
    onSearch({
      q: q || undefined,
      category: category || undefined,
      urgency: urgency || undefined,
      status: status || undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    setQ('');
    setCategory('');
    setUrgency('');
    setStatus('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    onReset();
  };

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          Recherche & Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="search-q">Recherche</Label>
          <Input
            id="search-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Titre ou description..."
          />
        </div>

        {/* Category filter */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              <SelectItem value="demenagement">Déménagement</SelectItem>
              <SelectItem value="bricolage">Bricolage</SelectItem>
              <SelectItem value="numerique">Numérique</SelectItem>
              <SelectItem value="administratif">Administratif</SelectItem>
              <SelectItem value="garde_enfants">Garde d'enfants</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="ecoute">Écoute</SelectItem>
              <SelectItem value="emploi">Emploi</SelectItem>
              <SelectItem value="alimentation">Alimentation</SelectItem>
              <SelectItem value="animaux">Animaux</SelectItem>
              <SelectItem value="education">Éducation</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Urgency filter */}
        <div className="space-y-2">
          <Label>Urgence</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes</SelectItem>
              <SelectItem value="faible">Faible</SelectItem>
              <SelectItem value="moyen">Moyen</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous</SelectItem>
              <SelectItem value="ouverte">Ouverte</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="resolue">Résolue</SelectItem>
              <SelectItem value="expiree">Expirée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort options */}
        <div className="space-y-2">
          <Label>Tri</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date création</SelectItem>
                <SelectItem value="expiresAt">Date expiration</SelectItem>
                <SelectItem value="urgency">Urgence</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESC">Décroissant</SelectItem>
                <SelectItem value="ASC">Croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex-1 h-11 sm:h-10 text-base sm:text-sm">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button onClick={handleReset} variant="outline" size="icon" className="h-11 w-11 sm:h-10 sm:w-10">
            <X className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
