'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  category?: string;
  type?: string;
  status?: string;
  createdAt: string;
}

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);

  const fetchOffers = () => {
    fetch('http://localhost:3001/admin/offers', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_logged_in');
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOffers(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchOffers();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette offre ?')) return;

    const res = await fetch(`http://localhost:3001/admin/offers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.status === 401) {
      sessionStorage.removeItem('admin_logged_in');
      router.push('/admin/login');
      return;
    }

    if (res.ok) {
      toast.success('Offre supprimée');
      fetchOffers();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Offres</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-4 font-medium">Titre</th>
              <th className="px-6 py-4 font-medium">Catégorie</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Statut</th>
              <th className="px-6 py-4 font-medium">Date création</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-b border-gray-800 last:border-0">
                <td className="px-6 py-4">{offer.title}</td>
                <td className="px-6 py-4 text-gray-400">{offer.category || '-'}</td>
                <td className="px-6 py-4 text-gray-400">{offer.type || '-'}</td>
                <td className="px-6 py-4 text-gray-400">{offer.status || '-'}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Aucune offre
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
