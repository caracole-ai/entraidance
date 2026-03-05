'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Force dynamic rendering (no prerendering)
export const dynamic = 'force-dynamic';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const { toast } = useToast();
  const processed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Read token from URL fragment (not query param) to avoid server-side logging
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const token = hashParams.get('token');

    // Error still comes via query param (not sensitive)
    const errorParam = searchParams.get('error');

    if (token) {
      console.log('[OAuth] Token reçu, longueur:', token.length);
      
      // Clean the URL immediately to remove token from history
      window.history.replaceState(null, '', window.location.pathname);

      loginWithToken(token)
        .then(() => {
          console.log('[OAuth] Login réussi, redirection...');
          toast({
            title: 'Connexion réussie !',
            description: 'Bienvenue sur Entraidance',
          });
          
          // Petit delay pour laisser le temps au state de se mettre à jour
          setTimeout(() => {
            router.replace('/missions');
          }, 300);
        })
        .catch((err) => {
          console.error('[OAuth] Erreur login:', err);
          setError('Erreur lors de la connexion');
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la connexion',
          });
          setTimeout(() => {
            router.replace('/login');
          }, 1000);
        });
    } else {
      console.error('[OAuth] Pas de token dans URL');
      setError(errorParam || 'Erreur lors de la connexion OAuth');
      toast({
        title: 'Erreur',
        description: errorParam || 'Erreur lors de la connexion OAuth',
      });
      setTimeout(() => {
        router.replace('/login');
      }, 1000);
    }
  }, [searchParams, loginWithToken, router, toast]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
