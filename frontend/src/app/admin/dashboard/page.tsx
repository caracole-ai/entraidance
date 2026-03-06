'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, HandHelping, Gift, Heart } from 'lucide-react';

interface Stats {
  users: number;
  needs: number;
  offers: number;
  contributions: number;
}

const STAT_CARDS = [
  { key: 'users' as const, label: 'Utilisateurs', icon: Users, href: '/admin/users' },
  { key: 'needs' as const, label: 'Besoins', icon: HandHelping, href: '/admin/needs' },
  { key: 'offers' as const, label: 'Offres', icon: Gift, href: '/admin/offers' },
  { key: 'contributions' as const, label: 'Contributions', icon: Heart, href: '/admin/contributions' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      router.push('/admin/login');
      return;
    }

    fetch('http://localhost:3001/admin/stats', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_logged_in');
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, href }) => (
          <Link
            key={key}
            href={href}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon size={24} className="text-gray-400" />
              <span className="text-3xl font-bold">{stats ? stats[key] : '-'}</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
