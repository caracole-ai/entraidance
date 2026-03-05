'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCloseMission } from '@/hooks/useCloseMission';
import { toast } from 'sonner';
import { t } from '@/i18n';

interface CloseMissionDialogProps {
  missionId: string;
}

export function CloseMissionDialog({ missionId }: CloseMissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [thanks, setThanks] = useState('');
  const closeMission = useCloseMission();

  const handleClose = () => {
    closeMission.mutate(
      { id: missionId, data: { feedback, thanks: thanks || undefined } },
      {
        onSuccess: () => {
          setStep(3);
        },
        onError: (error) => {
          if (error.message !== 'AUTH_REQUIRED') {
            toast.error(error.message);
          }
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep(0);
      setFeedback('');
      setThanks('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {t('besoins.close.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === 0 && (
          <>
            <DialogHeader>
              <DialogTitle>{t('besoins.close.title')}</DialogTitle>
              <DialogDescription>
                {t('besoins.close.description')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setStep(1)}>
                {t('common.continue')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>{t('besoins.close.howTitle')}</DialogTitle>
              <DialogDescription>
                {t('besoins.close.howDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="feedback">{t('besoins.close.feedbackLabel')}</Label>
              <Textarea
                id="feedback"
                placeholder={t('besoins.close.feedbackPlaceholder')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(0)}>
                {t('common.back')}
              </Button>
              <Button onClick={() => setStep(2)}>
                {t('common.continue')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>{t('besoins.close.thanksTitle')}</DialogTitle>
              <DialogDescription>
                {t('besoins.close.thanksDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="thanks">{t('besoins.close.thanksLabel')}</Label>
              <Textarea
                id="thanks"
                placeholder={t('besoins.close.thanksPlaceholder')}
                value={thanks}
                onChange={(e) => setThanks(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('common.back')}
              </Button>
              <Button
                onClick={handleClose}
                disabled={closeMission.isPending}
              >
                {closeMission.isPending ? t('common.sending') : t('besoins.close.confirm')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                {t('besoins.close.doneTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('besoins.close.doneDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
