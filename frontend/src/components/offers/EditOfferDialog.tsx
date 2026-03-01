'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { offersApi } from '@/lib/api';
import {
  type IOffer,
  OfferType,
  MissionCategory,
  Visibility,
  OFFER_TYPE_LABELS,
  CATEGORY_LABELS,
  VISIBILITY_LABELS,
} from '@/lib/types';
import { toast } from 'sonner';

interface EditOfferDialogProps {
  offer: IOffer;
}

export function EditOfferDialog({ offer }: EditOfferDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(offer.title);
  const [description, setDescription] = useState(offer.description);
  const [offerType, setOfferType] = useState<OfferType>(offer.offerType);
  const [category, setCategory] = useState<MissionCategory | ''>(offer.category ?? '');
  const [availability, setAvailability] = useState(offer.availability ?? '');
  const [visibility, setVisibility] = useState<Visibility | ''>(offer.visibility ?? '');
  const [location, setLocation] = useState(offer.location ?? '');
  const [tags, setTags] = useState(offer.tags.join(', '));

  const updateOffer = useMutation({
    mutationFn: (data: Parameters<typeof offersApi.update>[1]) =>
      offersApi.update(offer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offer', offer.id] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offre mise a jour !');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur');
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Le titre et la description sont requis');
      return;
    }
    updateOffer.mutate({
      title: title.trim(),
      description: description.trim(),
      offerType,
      category: category || undefined,
      availability: availability.trim() || undefined,
      visibility: visibility || undefined,
      location: location.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(offer.title);
      setDescription(offer.description);
      setOfferType(offer.offerType);
      setCategory(offer.category ?? '');
      setAvailability(offer.availability ?? '');
      setVisibility(offer.visibility ?? '');
      setLocation(offer.location ?? '');
      setTags(offer.tags.join(', '));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{"Modifier l'offre"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-offer-title">Titre</Label>
            <Input
              id="edit-offer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-offer-description">Description</Label>
            <Textarea
              id="edit-offer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>{"Type d'offre"}</Label>
            <Select value={offerType} onValueChange={(v) => setOfferType(v as OfferType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(OFFER_TYPE_LABELS) as [OfferType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categorie (optionnel)</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v === '__none__' ? '' : v as MissionCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Aucune</SelectItem>
                {(Object.entries(CATEGORY_LABELS) as [MissionCategory, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-offer-availability">Disponibilite (optionnel)</Label>
            <Input
              id="edit-offer-availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Ex: weekends, soirees..."
            />
          </div>
          <div className="space-y-2">
            <Label>Visibilite (optionnel)</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v === '__none__' ? '' : v as Visibility)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Par defaut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Par defaut</SelectItem>
                {(Object.entries(VISIBILITY_LABELS) as [Visibility, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-offer-location">Localisation (optionnel)</Label>
            <Input
              id="edit-offer-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Paris, France"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-offer-tags">Tags (separes par des virgules)</Label>
            <Input
              id="edit-offer-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="aide, competence, benevole"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={updateOffer.isPending}>
            {updateOffer.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
