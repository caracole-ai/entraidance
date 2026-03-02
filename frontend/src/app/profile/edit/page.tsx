'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availabilityHours, setAvailabilityHours] = useState<number | ''>('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | ''>(50);

  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  // Load current profile data
  useEffect(() => {
    if (!user) return;

    setBio(user.bio || '');
    setSkills(user.skills || []);
    setInterests(user.interests || []);
    setAvailabilityHours(user.availabilityHours || '');
    setMaxDistanceKm(user.maxDistanceKm || 50);
  }, [user]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: bio || undefined,
          skills: skills.length > 0 ? skills : undefined,
          interests: interests.length > 0 ? interests : undefined,
          availabilityHours: availabilityHours || undefined,
          maxDistanceKm: maxDistanceKm || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await res.json();

      toast({
        title: 'Profil mis à jour',
        description: `Complétion: ${data.profileCompletion}%`,
      });

      router.push('/profile');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-2xl mt-20 py-4 px-4 sm:py-8">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Compléter mon profil</CardTitle>
          <CardDescription className="text-sm">
            Ajoutez vos compétences et préférences pour améliorer le matching
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parlez un peu de vous..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">{bio.length}/500</p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Compétences</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Ex: Déménagement, Bricolage..."
                />
                <Button type="button" onClick={addSkill} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <Label>Centres d'intérêt</Label>
              <div className="flex gap-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  placeholder="Ex: Éducation, Environnement..."
                />
                <Button type="button" onClick={addInterest} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilité (heures/semaine)</Label>
              <Input
                id="availability"
                type="number"
                min="1"
                max="168"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 5"
              />
            </div>

            {/* Max Distance */}
            <div className="space-y-2">
              <Label htmlFor="distance">Distance maximale (km)</Label>
              <Input
                id="distance"
                type="number"
                min="1"
                max="1000"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
