'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cloud, Trash2, Share2, Play, Edit2, Plus } from 'lucide-react';
import { extractFullAudioMetadata } from '@/lib/audioMetadata';
import { authenticatedFetch } from '@/lib/clientAuth';
import toast from 'react-hot-toast';
import ContainerModal from '@/components/ContainerModal';
import FloatingPlayer from '@/components/FloatingPlayer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface File {
  id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  true_peak?: number;
  loudness_range?: number;
  format?: string;
  created_at: string;
}

interface Container {
  id: string;
  name: string;
  description?: string;
}

export default function ContainerPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [container, setContainer] = useState<Container | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [playingFile, setPlayingFile] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    (async () => {
      const resolvedParams = await params;
      fetchContainerAndFiles(resolvedParams.id);
    })();
  }, [user, router, params]);

  async function fetchContainerAndFiles(containerId: string) {
    try {
      setLoading(true);
      const [containerRes, filesRes] = await Promise.all([
        authenticatedFetch(`/api/containers/${containerId}`),
        authenticatedFetch(`/api/containers/${containerId}/files`),
      ]);

      if (containerRes.ok) {
        const containerData = await containerRes.json();
        setContainer(containerData.container);
      }

      if (filesRes.ok) {
        const data = await filesRes.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching container:', error);
      toast.error('Error loading container');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    let filesToUpload: FileList | null = null;

    try {
      if ('dataTransfer' in e) {
        // Drag and drop event
        const dragEvent = e as React.DragEvent<HTMLDivElement>;
        filesToUpload = dragEvent.dataTransfer?.files || null;
      } else if ('currentTarget' in e) {
        // File input change event
        const inputEvent = e as React.ChangeEvent<HTMLInputElement>;
        filesToUpload = inputEvent.currentTarget?.files || null;
      }

      if (!filesToUpload || filesToUpload.length === 0) {
        console.warn('[Upload] No files selected');
        return;
      }

      console.log('[Upload] Selected files:', filesToUpload.length);
      const resolvedParams = await params;
      await uploadFiles(filesToUpload, resolvedParams.id);
    } catch (error) {
      console.error('[Upload] Error in handleFileUpload:', error);
      toast.error('Error uploading files');
    }
  }

  async function uploadFiles(filesToUpload: FileList, containerId: string) {
    try {
      setUploading(true);

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        if (!file.type.startsWith('audio/')) {
          toast.error(`${file.name} is not an audio file`);
          continue;
        }

        const toastId = toast.loading(`Processing ${file.name}...`);
        const audioMetadata = await extractFullAudioMetadata(file);
        toast.dismiss(toastId);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('duration', audioMetadata.duration?.toString() || '');
        formData.append('sample_rate', audioMetadata.sample_rate?.toString() || '');
        formData.append('bitrate', audioMetadata.bitrate?.toString() || '');
        formData.append('lufs', audioMetadata.lufs?.toString() || '');
        formData.append('true_peak', audioMetadata.true_peak?.toString() || '');
        formData.append('loudness_range', audioMetadata.loudness_range?.toString() || '');
        formData.append('format', audioMetadata.format?.toString() || '');

        const response = await authenticatedFetch(`/api/containers/${containerId}/files`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast.success(`${file.name} uploaded successfully`);
          await fetchContainerAndFiles(containerId);
        } else {
          const errorData = await response.json();
          toast.error(`Error uploading ${file.name}: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    if (!confirm(`Delete ${fileName}?`)) return;

    const resolvedParams = await params;
    try {
      const response = await authenticatedFetch(`/api/containers/${resolvedParams.id}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('File deleted');
        await fetchContainerAndFiles(resolvedParams.id);
      } else {
        toast.error('Error deleting file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    }
  }

  async function handleShare(fileId: string) {
    try {
      const response = await authenticatedFetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.shareLink);
        toast.success('Share link copied!');
      } else {
        toast.error('Error creating share link');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Error creating share link');
    }
  }

  async function handleShareContainer() {
    if (!container) return;

    try {
      const response = await authenticatedFetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId: container.id }),
      });

      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.shareLink);
        toast.success('Container share link copied!');
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.error || 'Error creating share link');
      }
    } catch (error) {
      console.error('Error creating container share link:', error);
      toast.error('Error creating share link');
    }
  }

  async function handleUpdateContainer(data: { name: string; description: string }) {
    if (!container) return;

    try {
      const response = await authenticatedFetch(`/api/containers/${container.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setContainer(updatedData.container);
        toast.success('Container updated successfully');
      } else {
        toast.error('Error updating container');
      }
    } catch (error) {
      console.error('Error updating container:', error);
      toast.error('Error updating container');
    }
  }

  function formatDuration(seconds?: number) {
    if (!seconds || Number.isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/60">Loading container...</p>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/60">Container not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/[0.05] via-transparent to-fuchsia-500/[0.05] blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <div className="w-72 border-r border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl p-6 flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => router.push('/dashboard')}
          className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Upload Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full px-4 py-3 mb-6 rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 text-white font-semibold transition-all duration-300",
            "hover:from-cyan-600 hover:via-purple-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5",
            "flex items-center justify-center gap-2"
          )}
        >
          <Cloud size={18} />
          Add Files
        </motion.button>

        {/* Share Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={handleShareContainer}
          className={cn(
            "w-full px-4 py-3 mb-8 rounded-lg border border-white/[0.2] hover:border-white/[0.3] text-white font-semibold transition-all duration-300",
            "hover:bg-white/[0.05]",
            "flex items-center justify-center gap-2"
          )}
        >
          <Share2 size={18} />
          Share
        </motion.button>

        {/* Container Info */}
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
            Container Info
          </p>
          <div className="p-4 rounded-lg bg-white/[0.05] border border-white/[0.1]">
            <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">
              {container.name}
            </h3>
            <p className="text-xs text-white/50 line-clamp-3">
              {container.description || 'No description'}
            </p>
            <p className="text-xs text-white/40 mt-3">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Storage */}
        <div className="pt-6 border-t border-white/[0.1]">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Storage
          </p>
          <p className="text-sm text-white mb-3">
            {(files.reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024).toFixed(1)} MB
          </p>
          <div className="w-full h-2 rounded-full bg-white/[0.1] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: files.length > 0 ? '30%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />

        <div
          className="p-8 md:p-12"
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragCounter((prev) => prev + 1);
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragCounter((prev) => {
              const next = prev - 1;
              if (next <= 0) setDragActive(false);
              return Math.max(0, next);
            });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            setDragCounter(0);
            handleFileUpload(e);
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  {container.name}
                </span>
              </h1>
              <p className="text-white/60">{container.description || 'No description'}</p>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 rounded-lg hover:bg-white/[0.1] text-cyan-400 hover:text-cyan-300 transition-all duration-300"
              title="Edit container"
            >
              <Edit2 size={24} />
            </motion.button>
          </motion.div>

          {/* Upload Area or Files Grid */}
          {files.length === 0 && !uploading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300",
                dragActive
                  ? 'border-cyan-500 bg-cyan-500/[0.1]'
                  : 'border-white/[0.2] bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/[0.3]'
              )}
            >
              <Cloud size={48} className="mx-auto mb-4 text-white/60" />
              <p className="text-lg font-semibold text-white mb-2">Drop your audio files here</p>
              <p className="text-sm text-white/60">or click to browse</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Files List */}
              <div className="space-y-2">
                {files.map((file, i) => {
                  const isPlaying = playingFile?.id === file.id;
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                        isPlaying
                          ? 'bg-cyan-500/[0.2] border-cyan-500/50'
                          : 'bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2]'
                      )}
                    >
                      {/* Play Button */}
                      <button
                        onClick={() => setPlayingFile(file)}
                        className={cn(
                          "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                          isPlaying
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/[0.1] text-white hover:bg-cyan-500 hover:text-white'
                        )}
                      >
                        <Play size={18} />
                      </button>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.file_name}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {formatDuration(file.duration)} · {file.sample_rate ? `${Math.round(file.sample_rate / 1000)}kHz` : '--'} · {file.bitrate ? `${Math.round(file.bitrate / 1000)}kbps` : '--'}
                        </p>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleShare(file.id)}
                        className="flex-shrink-0 p-2 rounded-lg bg-white/[0.1] hover:bg-cyan-500/20 text-white/60 hover:text-cyan-400 transition-all duration-300"
                        title="Share"
                      >
                        <Share2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id, file.file_name)}
                        className="flex-shrink-0 p-2 rounded-lg bg-white/[0.1] hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-all duration-300"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Upload More */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: files.length * 0.05 }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border border-dashed border-white/[0.2] text-white font-medium transition-all duration-300",
                  "hover:border-white/[0.3] hover:bg-white/[0.05]",
                  "flex items-center justify-center gap-2 mt-4"
                )}
              >
                <Plus size={18} />
                Upload More Files
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Container Modal */}
      {container && (
        <ContainerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateContainer}
          initialName={container.name}
          initialDescription={container.description || ''}
          title="Edit Container"
          submitText="Update"
        />
      )}

      {/* Floating Player */}
      {playingFile && (
        <FloatingPlayer 
          file={playingFile} 
          onClose={() => setPlayingFile(null)} 
        />
      )}
    </div>
  );
}
