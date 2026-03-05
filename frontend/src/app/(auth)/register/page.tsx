'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { toast } from 'sonner';
import { FadeIn } from '@/components/ui/motion';
import { Heart } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ displayName, email, password });
      toast.success('Inscription réussie !');
      router.push('/missions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-stitch">
      {/* Hero Section with glassmorphism */}
      <section className="relative w-full pt-20 pb-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto relative">
          {/* Abstract Liquid Glass Shapes (background blobs) */}
          <div className="absolute -top-24 -right-20 w-[450px] h-[450px] bg-[#9333ea]/30 rounded-full blur-[140px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none" />

          {/* Register Card */}
          <FadeIn className="relative z-10">
            <div className="glass-hero p-8 md:p-12 rounded-[3rem] shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-[#9333ea] to-indigo-500 flex items-center justify-center shadow-lg">
                  <Heart size={32} fill="white" className="text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  <span className="font-elegant gradient-text-primary">Inscription</span>
                </h1>
                <p className="mt-3 text-muted-foreground text-base">
                  Créez votre compte Entraidance
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-semibold">Nom d&apos;affichage</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Votre nom"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="h-12 rounded-xl glass-sidebar-liquid border-white/60 focus:border-[#9333ea]/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl glass-sidebar-liquid border-white/60 focus:border-[#9333ea]/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Choisissez un mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl glass-sidebar-liquid border-white/60 focus:border-[#9333ea]/60"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl shadow-[0_20px_40px_-10px_rgba(147,51,234,0.4)] bg-[#9333ea] text-white hover:opacity-90 border-0 font-bold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Inscription...' : "S'inscrire"}
                </Button>

                <SocialLoginButtons />

                <p className="text-center text-sm text-muted-foreground pt-4">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="text-[#9333ea] font-semibold hover:underline">
                    Connexion
                  </Link>
                </p>
              </form>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
