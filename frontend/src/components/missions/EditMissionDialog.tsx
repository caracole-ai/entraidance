'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EditItemDialog, type SelectField, type InputField } from '@/components/shared/EditItemDialog';
import { missionsApi } from '@/lib/api';
import {
  type IMission,
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
  CATEGORY_LABELS,
  HELP_TYPE_LABELS,
  URGENCY_LABELS,
  VISIBILITY_LABELS,
} from '@/lib/types';
import { toast } from 'sonner';
import { t } from '@/i18n';

interface EditMissionDialogProps {
  mission: IMission;
}

export function EditMissionDialog({ mission }: EditMissionDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(mission.title);
  const [description, setDescription] = useState(mission.description);
  const [category, setCategory] = useState<MissionCategory>(mission.category);
  const [helpType, setHelpType] = useState<HelpType>(mission.helpType);
  const [urgency, setUrgency] = useState<Urgency>(mission.urgency);
  const [visibility, setVisibility] = useState<Visibility>(mission.visibility);
  const [location, setLocation] = useState(mission.location ?? '');
  const [tags, setTags] = useState(mission.tags.join(', '));

  const updateMission = useMutation({
    mutationFn: (data: Parameters<typeof missionsApi.update>[1]) =>
      missionsApi.update(mission.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast.success(t('besoins.updated'));
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
    updateMission.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      helpType,
      urgency,
      visibility,
      location: location.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setTitle(mission.title);
      setDescription(mission.description);
      setCategory(mission.category);
      setHelpType(mission.helpType);
      setUrgency(mission.urgency);
      setVisibility(mission.visibility);
      setLocation(mission.location ?? '');
      setTags(mission.tags.join(', '));
    }
  }, [mission]);

  const selectFields: SelectField[] = [
    {
      id: 'category',
      label: 'Catégorie',
      value: category,
      onChange: (v) => setCategory(v as MissionCategory),
      options: Object.entries(CATEGORY_LABELS).map(([k, l]) => ({ value: k, label: l })),
    },
    {
      id: 'helpType',
      label: "Type d'aide",
      value: helpType,
      onChange: (v) => setHelpType(v as HelpType),
      options: Object.entries(HELP_TYPE_LABELS).map(([k, l]) => ({ value: k, label: l })),
    },
    {
      id: 'urgency',
      label: 'Urgence',
      value: urgency,
      onChange: (v) => setUrgency(v as Urgency),
      options: Object.entries(URGENCY_LABELS).map(([k, l]) => ({ value: k, label: l })),
    },
    {
      id: 'visibility',
      label: 'Visibilité',
      value: visibility,
      onChange: (v) => setVisibility(v as Visibility),
      options: Object.entries(VISIBILITY_LABELS).map(([k, l]) => ({ value: k, label: l })),
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
      placeholder: 'aide, urgent, transport',
    },
  ];

  return (
    <EditItemDialog
      title={t('besoins.edit.title')}
      itemTitle={mission.title}
      category={category}
      selectFields={selectFields}
      inputFields={inputFields}
      onSubmit={handleSubmit}
      isPending={updateMission.isPending}
      onOpenChange={handleOpenChange}
    />
  );
}
