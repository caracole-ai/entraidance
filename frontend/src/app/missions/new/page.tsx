'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateMission } from '@/hooks/useCreateMission';
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

const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 10;

export default function NewMissionPage() {
  const router = useRouter();
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

  // Validation
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
          toast.success('Mission créée !');
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
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={form.category}
              onValueChange={(v) => updateForm('category', v as MissionCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MissionCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type d&apos;aide</Label>
            <Select
              value={form.helpType}
              onValueChange={(v) => updateForm('helpType', v as HelpType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(HelpType).map((ht) => (
                  <SelectItem key={ht} value={ht}>
                    {HELP_TYPE_LABELS[ht]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Urgence</Label>
            <Select
              value={form.urgency}
              onValueChange={(v) => updateForm('urgency', v as Urgency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Urgency).map((u) => (
                  <SelectItem key={u} value={u}>
                    {URGENCY_LABELS[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ),
    },
    {
      label: 'Visibilité',
      isValid: () => true,
      content: (
        <>
          <div className="space-y-2">
            <Label>Visibilité</Label>
            <Select
              value={form.visibility}
              onValueChange={(v) => updateForm('visibility', v as Visibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Visibility).map((vis) => (
                  <SelectItem key={vis} value={vis}>
                    {VISIBILITY_LABELS[vis]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Badge variant="outline">{CATEGORY_LABELS[form.category]}</Badge>
            <Badge variant="outline">{HELP_TYPE_LABELS[form.helpType]}</Badge>
            <Badge variant="outline">{URGENCY_LABELS[form.urgency]}</Badge>
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
    <FormWizard
      title="Créer une Mission"
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onSubmit={handleSubmit}
      isSubmitting={createMission.isPending}
      submitLabel="Valider ma mission"
    />
  );
}
