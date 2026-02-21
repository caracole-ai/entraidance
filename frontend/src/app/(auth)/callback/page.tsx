'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      loginWithToken(token)
        .then(() => {
          toast.success('Connexion reussie !');
          router.replace('/missions');
        })
        .catch(() => {
          toast.error('Erreur lors de la connexion');
          router.replace('/login');
        });
    } else {
      toast.error(error || 'Erreur lors de la connexion OAuth');
      router.replace('/login');
    }
  }, [searchParams, loginWithToken, router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
