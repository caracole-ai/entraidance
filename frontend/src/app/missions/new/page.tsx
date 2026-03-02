'use client';
import { t } from '@/i18n';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCreateMission } from '@/hooks/useCreateMission';
import { useAuth } from '@/hooks/useAuth';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import {
  MissionCategory,
  HelpType,
  Urgency,
  Visibility,
  CATEGORY_LABELS,
  HELP_TYPE_LABELS,
  URGENCY_LABELS,
  VISIBILITY_LABELS,
  type ICreateMission,
} from '@/lib/types';
import { toast } from 'sonner';
import { FormWizard, type WizardStep } from '@/components/forms/FormWizard';
import { ValidatedInput } from '@/components/forms/ValidatedInput';
import { BadgeSelector } from '@/components/forms/BadgeSelector';
import { ToggleSwitch } from '@/components/forms/ToggleSwitch';
import { MIN_TITLE_LENGTH, MIN_DESCRIPTION_LENGTH, CATEGORY_ICONS } from '@/lib/constants';

const HELP_TYPE_ICONS: Partial<Record<HelpType, string>> = {
  [HelpType.FINANCIERE]: '💰',
  [HelpType.CONSEIL]: '💡',
  [HelpType.MATERIEL]: '🧰',
  [HelpType.RELATION]: '🤝',
  [HelpType.AUTRE]: '✨',
};

const URGENCY_COLORS: Partial<Record<Urgency, string>> = {
  [Urgency.FAIBLE]: 'oklch(0.6 0.12 180)',
  [Urgency.MOYEN]: 'oklch(0.6 0.14 80)',
  [Urgency.URGENT]: 'oklch(0.55 0.2 15)',
};

const URGENCY_ICONS: Partial<Record<Urgency, string>> = {
  [Urgency.FAIBLE]: '🟢',
  [Urgency.MOYEN]: '🟡',
  [Urgency.URGENT]: '🔴',
};

export default function NewMissionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const createMission = useCreateMission();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ICreateMission>({
    title: '',
    description: '',
    category: MissionCategory.AUTRE,
    helpType: HelpType.CONSEIL,
    urgency: Urgency.MOYEN,
    visibility: Visibility.PUBLIC,
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');
  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const updateForm = <K extends keyof ICreateMission>(
    key: K,
    value: ICreateMission[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (field: 'title' | 'description') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isTitleValid = () => form.title.trim().length >= MIN_TITLE_LENGTH;
  const isDescriptionValid = () => form.description.trim().length >= MIN_DESCRIPTION_LENGTH;

  const scrollToFirstError = () => {
    if (!isTitleValid() && titleRef.current) {
      titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleRef.current.focus();
      markTouched('title');
      toast.error('Le titre doit contenir au moins 5 caractères');
      return;
    }
    if (!isDescriptionValid() && descriptionRef.current) {
      descriptionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      descriptionRef.current.focus();
      markTouched('description');
      toast.error('La description doit contenir au moins 10 caractères');
      return;
    }
  };

  const handleSubmit = () => {
    if (!user && !authLoading) {
      setShowAuthModal(true);
      return;
    }
    if (!isTitleValid() || !isDescriptionValid()) {
      scrollToFirstError();
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMission.mutate(
      { ...form, tags },
      {
        onSuccess: (mission) => {
          toast.success(t('besoins.created'));
          router.push(`/missions/${mission.id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const steps: WizardStep[] = [
    {
      label: 'Description',
      isValid: () => isTitleValid() && isDescriptionValid(),
      isEmpty: () => !form.title && !form.description,
      content: (
        <>
          <ValidatedInput
            ref={titleRef}
            id="title"
            label="Titre"
            value={form.title}
            onChange={(v) => updateForm('title', v)}
            onBlur={() => markTouched('title')}
            minLength={MIN_TITLE_LENGTH}
            placeholder="De quoi avez-vous besoin ?"
            required
            touched={touched.title}
          />
          <ValidatedInput
            ref={descriptionRef}
            id="description"
            label="Description"
            value={form.description}
            onChange={(v) => updateForm('description', v)}
            onBlur={() => markTouched('description')}
            minLength={MIN_DESCRIPTION_LENGTH}
            placeholder="Décrivez votre besoin en détail..."
            required
            touched={touched.description}
            type="textarea"
            rows={5}
          />
        </>
      ),
    },
    {
      label: 'Classification',
      isValid: () => true,
      content: (
        <>
          <BadgeSelector
            label="Catégorie"
            value={form.category}
            onChange={(v) => updateForm('category', v)}
            options={Object.values(MissionCategory)}
            labels={CATEGORY_LABELS}
            icons={CATEGORY_ICONS}
            columns={4}
          />
          <BadgeSelector
            label="Type d'aide"
            value={form.helpType}
            onChange={(v) => updateForm('helpType', v)}
            options={Object.values(HelpType)}
            labels={HELP_TYPE_LABELS}
            icons={HELP_TYPE_ICONS}
            columns={2}
          />
          <BadgeSelector
            label="Urgence"
            value={form.urgency}
            onChange={(v) => updateForm('urgency', v)}
            options={Object.values(Urgency)}
            labels={URGENCY_LABELS}
            icons={URGENCY_ICONS}
            colors={URGENCY_COLORS}
            columns={3}
          />
        </>
      ),
    },
    {
      label: 'Visibilité',
      isValid: () => true,
      content: (
        <>
          <ToggleSwitch
            label="Visibilité"
            value={form.visibility}
            onChange={(v) => updateForm('visibility', v)}
            options={[
              { value: Visibility.PUBLIC, label: 'Public', icon: '🌍' },
              { value: Visibility.GROUPE, label: 'Groupe', icon: '👥' },
              { value: Visibility.PRIVE, label: 'Privé', icon: '🔒' },
            ]}
          />
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              placeholder="aide, urgent, paris..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </>
      ),
    },
    {
      label: 'Confirmation',
      isValid: () => isTitleValid() && isDescriptionValid(),
      content: (
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Titre</span>
            <p className="font-semibold">{form.title}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <p className="text-sm">{form.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{CATEGORY_ICONS[form.category]} {CATEGORY_LABELS[form.category]}</Badge>
            <Badge variant="outline">{HELP_TYPE_ICONS[form.helpType]} {HELP_TYPE_LABELS[form.helpType]}</Badge>
            <Badge variant="outline">{URGENCY_ICONS[form.urgency]} {URGENCY_LABELS[form.urgency]}</Badge>
            <Badge variant="outline">{VISIBILITY_LABELS[form.visibility]}</Badge>
          </div>
          {tagsInput && (
            <div className="flex flex-wrap gap-1">
              {tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
    <AuthRequiredModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    <FormWizard
      title={t("besoins.createTitle")}
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onSubmit={handleSubmit}
      isSubmitting={createMission.isPending}
      submitLabel={t("besoins.submitLabel")}
    />
    </>
  );
}
