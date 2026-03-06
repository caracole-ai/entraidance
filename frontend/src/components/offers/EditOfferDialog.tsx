'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EditItemDialog, type SelectField, type InputField } from '@/components/shared/EditItemDialog';
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
import { t } from '@/i18n';

interface EditOfferDialogProps {
  offer: IOffer;
}

export function EditOfferDialog({ offer }: EditOfferDialogProps) {
  const queryClient = useQueryClient();
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
      toast.success(t('propositions.updated'));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erreur';
      if (message !== 'AUTH_REQUIRED') {
        toast.error(message);
      }
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error(t('besoins.edit.titleRequired'));
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

  const handleOpenChange = useCallback((isOpen: boolean) => {
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
  }, [offer]);

  const selectFields: SelectField[] = [
    {
      id: 'offerType',
      label: t('propositions.typeLabel'),
      value: offerType,
      onChange: (v) => setOfferType(v as OfferType),
      options: Object.entries(OFFER_TYPE_LABELS).map(([k, l]) => ({ value: k, label: l })),
    },
    {
      id: 'category',
      label: 'Catégorie',
      value: category || '__none__',
      onChange: (v) => setCategory(v === '__none__' ? '' : v as MissionCategory),
      options: Object.entries(CATEGORY_LABELS).map(([k, l]) => ({ value: k, label: l })),
      allowNone: true,
      placeholder: 'Aucune',
    },
    {
      id: 'visibility',
      label: 'Visibilité',
      value: visibility || '__none__',
      onChange: (v) => setVisibility(v === '__none__' ? '' : v as Visibility),
      options: Object.entries(VISIBILITY_LABELS).map(([k, l]) => ({ value: k, label: l })),
      allowNone: true,
      placeholder: 'Par défaut',
    },
  ];

  const inputFields: InputField[] = [
    {
      id: 'title',
      label: 'Titre',
      value: title,
      onChange: setTitle,
      required: true,
    },
    {
      id: 'description',
      label: 'Description',
      value: description,
      onChange: setDescription,
      type: 'textarea',
      rows: 4,
      required: true,
    },
    {
      id: 'availability',
      label: 'Disponibilité',
      value: availability,
      onChange: setAvailability,
      placeholder: 'Ex: weekends, soirées...',
    },
    {
      id: 'location',
      label: 'Localisation',
      value: location,
      onChange: setLocation,
      placeholder: 'Paris, France',
    },
    {
      id: 'tags',
      label: 'Tags (séparés par virgules)',
      value: tags,
      onChange: setTags,
      placeholder: 'aide, compétence, bénévole',
    },
  ];

  return (
    <EditItemDialog
      title={t('propositions.edit.title')}
      itemTitle={offer.title}
      category={category || null}
      selectFields={selectFields}
      inputFields={inputFields}
      onSubmit={handleSubmit}
      isPending={updateOffer.isPending}
      onOpenChange={handleOpenChange}
    />
  );
}
