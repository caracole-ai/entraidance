'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = () => {
    fetch('http://localhost:3001/admin/users', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem('admin_logged_in');
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUsers(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_logged_in') !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;

    const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.status === 401) {
      sessionStorage.removeItem('admin_logged_in');
      router.push('/admin/login');
      return;
    }

    if (res.ok) {
      toast.success('Utilisateur supprimé');
      fetchUsers();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Utilisateurs</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Nom</th>
              <th className="px-6 py-4 font-medium">Date création</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800 last:border-0">
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 text-gray-400">{user.displayName || '-'}</td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Aucun utilisateur
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
