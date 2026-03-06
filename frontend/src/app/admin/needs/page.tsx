'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Need {
  id: string;
  title: string;
  category?: string;
  status?: string;
  createdAt: string;
}

export default function AdminNeedsPage() {
  const router = useRouter();
  const [needs, setNeeds] = useState<Need[]>([]);

  const fetchNeeds = () => {
    fetch('http://localhost:3001/admin/needs', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_logged_in');
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setNeeds(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchNeeds();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce besoin ?')) return;

    const res = await fetch(`http://localhost:3001/admin/needs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.status === 401) {
      sessionStorage.removeItem('admin_logged_in');
      router.push('/admin/login');
      return;
    }

    if (res.ok) {
      toast.success('Besoin supprimé');
      fetchNeeds();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Besoins</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-4 font-medium">Titre</th>
              <th className="px-6 py-4 font-medium">Catégorie</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Date création</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {needs.map((need) => (
              <tr key={need.id} className="border-b border-gray-800 last:border-0">
                <td className="px-6 py-4">{need.title}</td>
                <td className="px-6 py-4 text-gray-400">{need.category || '-'}</td>
                <td className="px-6 py-4 text-gray-400">{need.status || '-'}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(need.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(need.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {needs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Aucun besoin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
