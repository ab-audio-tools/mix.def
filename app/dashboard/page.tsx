'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Settings } from 'lucide-react';
import { authenticatedFetch } from '@/lib/clientAuth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ContainerModal from '@/components/ContainerModal';
import { cn } from '@/lib/utils';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      toast.error('Error loading containers');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateContainer(data: { name: string; description: string }) {
    try {
      console.log('[Dashboard] 📝 Creating container...');
      const response = await authenticatedFetch('/api/containers', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('[Dashboard] ✅ Container created:', responseData.container);
        toast.success('Container created successfully');
        await fetchContainers();
      } else {
        const errorData = await response.json();
        console.log('[Dashboard] ❌ Error response:', errorData);
        toast.error('Error creating container');
      }
    } catch (error) {
      console.error('[Dashboard] 🔴 Error creating container:', error);
      toast.error('Error creating container');
    }
  }

  async function handleDeleteContainer(id: string) {
    if (!confirm('Delete this container?')) return;

    try {
      const response = await authenticatedFetch(`/api/containers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Container deleted');
        fetchContainers();
      } else {
        toast.error('Error deleting container');
      }
    } catch (error) {
      console.error('[Dashboard] 🔴 Error deleting container:', error);
      toast.error('Error deleting container');
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <div className="w-72 border-r border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl p-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                mix.def
              </h1>
              <p className="text-xs text-white/50 mt-0.5">Audio Platform</p>
            </div>
          </div>
        </motion.div>

        {/* New Container Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "w-full px-4 py-3 mb-8 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold transition-all duration-300",
            "hover:from-indigo-600 hover:to-rose-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5",
            "flex items-center justify-center gap-2"
          )}
        >
          <Plus size={18} />
          New Container
        </motion.button>

        {/* Navigation */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
              Navigation
            </p>
            <nav className="space-y-2">
              <button className="w-full px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.1] transition-all duration-300 text-left text-sm font-medium">
                All Containers
              </button>
              <button className="w-full px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.1] transition-all duration-300 text-left text-sm font-medium">
                Recent
              </button>
            </nav>
          </div>

          {/* Storage Info */}
          <div className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.1]">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
              Storage
            </p>
            <p className="text-sm text-white mb-3">2.5 GB / 1 TB</p>
            <div className="w-full h-2 rounded-full bg-white/[0.1] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: '2.5%' }}
              />
            </div>
          </div>
        </div>

        {/* User Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-auto pt-6 border-t border-white/[0.1]"
        >
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-all duration-300">
            <div>
              <p className="text-sm font-semibold text-white">
                {user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-white/50">{user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg hover:bg-white/[0.1] text-white/60 hover:text-white transition-all duration-300"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-8 md:p-12 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Containers
              </span>
            </h2>
            <p className="text-lg text-white/60">
              Organize and manage your audio files
            </p>
          </motion.div>

          {/* Containers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-48 rounded-xl bg-white/[0.05] border border-white/[0.1] animate-pulse"
                />
              ))}
            </div>
          ) : containers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-white/[0.1] bg-white/[0.03]"
            >
              <div className="text-6xl mb-4 opacity-30">📦</div>
              <p className="text-white/60 mb-6 text-lg text-center">
                No containers yet. Create one to get started.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                  "px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold transition-all duration-300",
                  "hover:from-indigo-600 hover:to-rose-600 hover:shadow-lg hover:shadow-indigo-500/30"
                )}
              >
                Create Your First Container
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {containers.map((container, i) => (
                <motion.div
                  key={container.id}
                  custom={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <div className="relative h-full rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.15] backdrop-blur-xl p-6 hover:border-white/[0.3] transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10 overflow-hidden">
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.1] to-rose-500/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors duration-300">
                          {container.name}
                        </h3>
                        <p className="text-sm text-white/50 line-clamp-2">
                          {container.description || 'No description'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-6">
                        <button
                          onClick={() => router.push(`/dashboard/container/${container.id}`)}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-medium transition-all duration-300",
                            "text-sm"
                          )}
                        >
                          Open
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContainer(container.id);
                          }}
                          className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-all duration-300"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Container Modal */}
      <ContainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateContainer}
        title="Create New Container"
        submitText="Create"
      />
    </div>
  );
}
