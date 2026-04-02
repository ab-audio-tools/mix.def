'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { IoAdd, IoTrash, IoSettings } from 'react-icons/io5';
import { authenticatedFetch } from '@/lib/clientAuth';
import toast from 'react-hot-toast';

interface Container {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewContainer, setShowNewContainer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    fetchContainers();
  }, [user, router]);

  async function fetchContainers() {
    try {
      console.log('[Dashboard] 🔄 Fetching containers...');
      setLoading(true);
      const response = await authenticatedFetch('/api/containers');
      const data = await response.json();

      console.log('[Dashboard] 📦 Containers fetched:', data.containers?.length || 0, 'total');
      if (data.containers && data.containers.length > 0) {
        data.containers.forEach((c: any) => {
          console.log('[Dashboard] ├─', c.name, '(ID:', c.id, ')');
        });
      }

      if (response.ok) {
        setContainers(data.containers);
      }
    } catch (error) {
      console.error('[Dashboard] 🔴 Error fetching containers:', error);
      toast.error('Errore nel caricamento dei container');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateContainer(e: React.FormEvent) {
    e.preventDefault();
    try {
      console.log('[Dashboard] 📝 Creating container...');
      console.log('[Dashboard] ├─ Name:', newName);
      console.log('[Dashboard] └─ Description:', newDescription);

      const response = await authenticatedFetch('/api/containers', {
        method: 'POST',
        body: JSON.stringify({ name: newName, description: newDescription }),
      });

      console.log('[Dashboard] 📡 Response Status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('[Dashboard] ✅ Container created:', responseData.container);
        toast.success('Container creato con successo');
        setNewName('');
        setNewDescription('');
        setShowNewContainer(false);
        fetchContainers();
      } else {
        const errorData = await response.json();
        console.log('[Dashboard] ❌ Error response:', errorData);
        toast.error('Errore nella creazione del container');
      }
    } catch (error) {
      console.error('[Dashboard] 🔴 Error creating container:', error);
      toast.error('Errore nella creazione del container');
    }
  }

  async function handleDeleteContainer(id: string) {
    if (!confirm('Elimina questo container?')) return;

    try {
      const response = await authenticatedFetch(`/api/containers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Container eliminato');
        fetchContainers();
      } else {
        toast.error('Errore nell\'eliminazione del container');
      }
    } catch (error) {
      console.error('[Dashboard] 🔴 Error deleting container:', error);
      toast.error('Errore nell\'eliminazione del container');
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-dark-900 border-r border-dark-800 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-500">mix.def</h1>
          <p className="text-xs text-dark-400 mt-1">Audio sharing platform</p>
        </div>

        <nav className="flex-1 space-y-4">
          <button className="w-full bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6">
            <IoAdd size={20} />
            New
          </button>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Navigation</p>
            <a href="#" className="block px-4 py-2 rounded-lg text-dark-50 hover:bg-dark-800 transition-colors">
              Containers
            </a>
            <a href="#" className="block px-4 py-2 rounded-lg text-dark-50 hover:bg-dark-800 transition-colors">
              Recent
            </a>
          </div>
        </nav>

        {/* Storage Info */}
        <div className="pt-6 border-t border-dark-800">
          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Storage</p>
          <p className="text-sm text-dark-300">2.5 GB used / 1 TB available</p>
          <div className="mt-3 w-full bg-dark-800 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '2.5%' }}></div>
          </div>
        </div>

        {/* User */}
        <div className="pt-6 border-t border-dark-800 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-dark-50">{user.email?.split('@')[0]}</p>
            <p className="text-xs text-dark-400">{user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-dark-400 hover:text-dark-200 transition-colors"
          >
            <IoSettings size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-dark-50 mb-2">Containers</h2>
            <p className="text-dark-400">Organizza i tuoi file audio in container</p>
          </div>

          {/* Create New Container Form */}
          {showNewContainer && (
            <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 mb-8">
              <form onSubmit={handleCreateContainer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-50 mb-2">
                    Nome Container
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Es. Progressive Rock Collection"
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-50 mb-2">
                    Descrizione (opzionale)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Es. Collezione di album progressive rock"
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-dark-50 placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Crea Container
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewContainer(false)}
                    className="flex-1 bg-dark-800 hover:bg-dark-700 text-dark-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Containers Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-dark-400">Caricamento...</p>
            </div>
          ) : containers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-dark-400 mb-4">Nessun container ancora</p>
              {!showNewContainer && (
                <button
                  onClick={() => setShowNewContainer(true)}
                  className="bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <IoAdd size={18} />
                  Crea il primo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {containers.map((container) => (
                <div
                  key={container.id}
                  onClick={() => router.push(`/dashboard/container/${container.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg p-6 aspect-square flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 mb-3">
                    <div>
                      <h3 className="font-bold text-dark-50 text-lg group-hover:text-white transition-colors">
                        {container.name}
                      </h3>
                      {container.description && (
                        <p className="text-xs text-dark-200 mt-1 line-clamp-2">
                          {container.description}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-dark-300">
                      {new Date(container.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContainer(container.id);
                    }}
                    className="w-full text-xs text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          )}

          {!showNewContainer && containers.length > 0 && (
            <button
              onClick={() => setShowNewContainer(true)}
              className="mt-8 bg-primary-500 hover:bg-primary-600 text-dark-950 font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <IoAdd size={20} />
              Nuovo Container
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
