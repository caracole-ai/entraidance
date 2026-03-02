'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { FadeIn } from '@/components/ui/motion';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Connexion reussie !');
      router.push('/missions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4 overflow-hidden">
      {/* Subtle background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{ background: 'oklch(0.55 0.18 280)' }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full blur-3xl opacity-15"
        style={{ background: 'oklch(0.6 0.15 280)' }}
        aria-hidden
      />

      <FadeIn className="w-full max-w-md z-10">
        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-2 pt-8">
            {/* Brand mark */}
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg font-display">G</span>
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connectez-vous a votre compte GR attitude
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
            </CardContent>

            <SocialLoginButtons />

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button
                type="submit"
                className="w-full h-10 gradient-primary text-white font-semibold hover:opacity-90 transition-opacity border-0"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Inscription
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </FadeIn>
    </div>
  );
}
