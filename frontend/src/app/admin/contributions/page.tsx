'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Contribution {
  id: string;
  userId?: string;
  missionId?: string;
  type?: string;
  status?: string;
  createdAt: string;
}

export default function AdminContributionsPage() {
  const router = useRouter();
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const fetchContributions = () => {
    fetch('http://localhost:3001/admin/contributions', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_logged_in');
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setContributions(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchContributions();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette contribution ?')) return;

    const res = await fetch(`http://localhost:3001/admin/contributions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.status === 401) {
      sessionStorage.removeItem('admin_logged_in');
      router.push('/admin/login');
      return;
    }

    if (res.ok) {
      toast.success('Contribution supprimée');
      fetchContributions();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Contributions</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-4 font-medium">User ID</th>
              <th className="px-6 py-4 font-medium">Mission ID</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Date création</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c.id} className="border-b border-gray-800 last:border-0">
                <td className="px-6 py-4 font-mono text-xs">{c.userId || '-'}</td>
                <td className="px-6 py-4 font-mono text-xs">{c.missionId || '-'}</td>
                <td className="px-6 py-4 text-gray-400">{c.type || '-'}</td>
                <td className="px-6 py-4 text-gray-400">{c.status || '-'}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {contributions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Aucune contribution
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
