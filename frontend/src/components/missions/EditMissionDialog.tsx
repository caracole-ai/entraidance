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
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
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
          <DialogTitle>{t('besoins.edit.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MissionCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [MissionCategory, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{"Type d'aide"}</Label>
            <Select value={helpType} onValueChange={(v) => setHelpType(v as HelpType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(HELP_TYPE_LABELS) as [HelpType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgence</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(URGENCY_LABELS) as [Urgency, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visibilite</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as Visibility)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(VISIBILITY_LABELS) as [Visibility, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Localisation (optionnel)</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Paris, France"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags (separes par des virgules)</Label>
            <Input
              id="edit-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="aide, urgent, transport"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={updateMission.isPending}>
            {updateMission.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
