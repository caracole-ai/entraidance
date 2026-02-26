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
import { useCreateOffer } from '@/hooks/useCreateOffer';
import {
  MissionCategory,
  OfferType,
  Visibility,
  CATEGORY_LABELS,
  OFFER_TYPE_LABELS,
  VISIBILITY_LABELS,
  type ICreateOffer,
} from '@/lib/types';
import { toast } from 'sonner';
import { FormWizard, type WizardStep } from '@/components/forms/FormWizard';
import { ValidatedInput } from '@/components/forms/ValidatedInput';

const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 10;

export default function NewOfferPage() {
  const router = useRouter();
  const createOffer = useCreateOffer();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ICreateOffer>({
    title: '',
    description: '',
    offerType: OfferType.SERVICE,
    category: MissionCategory.AUTRE,
    availability: '',
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

  const updateForm = <K extends keyof ICreateOffer>(
    key: K,
    value: ICreateOffer[K]
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
    createOffer.mutate(
      { ...form, tags },
      {
        onSuccess: (offer) => {
          toast.success('Offre créée !');
          router.push(`/offers/${offer.id}`);
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
            placeholder="Que proposez-vous ?"
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
            placeholder="Décrivez votre offre en détail..."
            required
            touched={touched.description}
            type="textarea"
            rows={5}
          />
          <ValidatedInput
            id="availability"
            label="Disponibilité"
            value={form.availability || ''}
            onChange={(v) => updateForm('availability', v)}
            placeholder="Quand êtes-vous disponible ? (ex: weekends, soirs en semaine...)"
            type="textarea"
            rows={2}
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
            <Label>Type d&apos;offre</Label>
            <Select
              value={form.offerType}
              onValueChange={(v) => updateForm('offerType', v as OfferType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OfferType).map((ot) => (
                  <SelectItem key={ot} value={ot}>
                    {OFFER_TYPE_LABELS[ot]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={form.category || MissionCategory.AUTRE}
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
            <Label>Visibilité</Label>
            <Select
              value={form.visibility || Visibility.PUBLIC}
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
              placeholder="aide, bricolage, paris..."
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
          {form.availability && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Disponibilité</span>
              <p className="text-sm">{form.availability}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{OFFER_TYPE_LABELS[form.offerType]}</Badge>
            {form.category && (
              <Badge variant="outline">{CATEGORY_LABELS[form.category]}</Badge>
            )}
            {form.visibility && (
              <Badge variant="outline">{VISIBILITY_LABELS[form.visibility]}</Badge>
            )}
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
      title="Proposer une Offre"
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onSubmit={handleSubmit}
      isSubmitting={createOffer.isPending}
      submitLabel="Valider mon offre"
    />
  );
}
