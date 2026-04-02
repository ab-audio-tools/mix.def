'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { IoArrowBack, IoCloudUpload, IoTrash, IoShare, IoPlaySharp, IoMusicalNote, IoSearch, IoChevronDown, IoEllipsisVertical } from 'react-icons/io5';
import { extractFullAudioMetadata } from '@/lib/audioMetadata';
import { authenticatedFetch } from '@/lib/clientAuth';
import toast from 'react-hot-toast';
import FloatingPlayer from '@/components/FloatingPlayer';

interface File {
  id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
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
      console.log('[ContainerPage] 📝 Fetching container and files...');
      const [containerRes, filesRes] = await Promise.all([
        authenticatedFetch(`/api/containers/${containerId}`),
        authenticatedFetch(`/api/containers/${containerId}/files`),
      ]);

      if (containerRes.ok) {
        const containerData = await containerRes.json();
        console.log('[ContainerPage] ✅ Container loaded:', containerData.container?.name);
        setContainer(containerData.container);
      }

      if (filesRes.ok) {
        const data = await filesRes.json();
        console.log('[ContainerPage] ✅ Files loaded:', data.files?.length, 'files');
        setFiles(data.files);
      }
    } catch (error) {
      console.error('[ContainerPage] ❌ Error fetching container:', error);
      toast.error('Errore nel caricamento del container');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    let filesToUpload: FileList | null = null;

    if (e.type === 'drop') {
      const dragEvent = e as React.DragEvent<HTMLDivElement>;
      filesToUpload = dragEvent.dataTransfer?.files || null;
      console.log('[ContainerPage] 📥 Drop detected, files:', filesToUpload?.length);
    } else if (e.type === 'change') {
      const inputEvent = e as React.ChangeEvent<HTMLInputElement>;
      filesToUpload = inputEvent.currentTarget?.files || null;
      console.log('[ContainerPage] 📁 Input change detected, files:', filesToUpload?.length);
    }

    if (!filesToUpload || filesToUpload.length === 0) {
      console.log('[ContainerPage] ⚠️ No files to upload');
      return;
    }

    const resolvedParams = await params;
    await uploadFiles(filesToUpload, resolvedParams.id);
  }

  async function uploadFiles(filesToUpload: FileList, containerId: string) {
    try {
      setUploading(true);
      console.log('[ContainerPage] 📝 Uploading', filesToUpload.length, 'files...');

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Check if audio file
        if (!file.type.startsWith('audio/')) {
          toast.error(`${file.name} non è un file audio`);
          continue;
        }

        // Extract audio metadata
        toast.loading(`Analizzando ${file.name}...`);
        const audioMetadata = await extractFullAudioMetadata(file);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('duration', audioMetadata.duration?.toString() || '');
        formData.append('sample_rate', audioMetadata.sample_rate?.toString() || '');
        formData.append('bitrate', audioMetadata.bitrate?.toString() || '');
        formData.append('lufs', audioMetadata.lufs?.toString() || '');

        console.log('[ContainerPage] 📤 Uploading:', file.name);
        const response = await authenticatedFetch(`/api/containers/${containerId}/files`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('[ContainerPage] ✅ File uploaded:', file.name);
          toast.success(`${file.name} caricato con successo`);
          await fetchContainerAndFiles(containerId);
        } else {
          const errorData = await response.json();
          console.error('[ContainerPage] ❌ Upload failed:', file.name, '- Error:', errorData.error);
          toast.error(`Errore nel caricamento di ${file.name}: ${errorData.error}`);
        }
      }
    } catch (error) {
      console.error('[ContainerPage] ❌ Error uploading files:', error);
      toast.error('Errore nel caricamento dei file');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    if (!confirm(`Sei sicuro di voler eliminare ${fileName}?`)) return;

    const resolvedParams = await params;
    try {
      console.log('[ContainerPage] 🗑️ Deleting file:', fileName);
      const response = await authenticatedFetch(`/api/containers/${resolvedParams.id}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('[ContainerPage] ✅ File deleted:', fileName);
        toast.success('File eliminato');
        await fetchContainerAndFiles(resolvedParams.id);
      } else {
        console.error('[ContainerPage] ❌ Delete failed:', fileName);
        toast.error('Errore nell\'eliminazione del file');
      }
    } catch (error) {
      console.error('[ContainerPage] ❌ Error deleting file:', error);
      toast.error('Errore nell\'eliminazione del file');
    }
  }

  async function handleShare(fileId: string) {
    try {
      console.log('[ContainerPage] 🔗 Creating share link for:', fileId);
      const response = await authenticatedFetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (response.ok) {
        const data = await response.json();
        const shareUrl = `${window.location.origin}${data.shareLink}`;
        navigator.clipboard.writeText(shareUrl);
        console.log('[ContainerPage] ✅ Share link created');
        toast.success('Link di condivisione copiato!');
      } else {
        console.error('[ContainerPage] ❌ Share creation failed');
        toast.error('Errore nella creazione del link');
      }
    } catch (error) {
      console.error('[ContainerPage] ❌ Error creating share link:', error);
      toast.error('Errore nella creazione del link');
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
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Caricamento...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Caricamento container...</p>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Container non trovato</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-dark-950 pb-40"
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
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />

      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-dark-800 bg-dark-900 px-5 py-6 hidden lg:flex lg:flex-col">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 inline-flex items-center gap-2 text-dark-200 hover:text-primary-500 transition-colors"
          >
            <IoArrowBack size={16} />
            Back
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-8 h-12 rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-50 font-semibold transition-colors inline-flex items-center justify-center gap-2"
          >
            <IoCloudUpload size={18} />
            Add files
          </button>

          <div className="space-y-2 text-sm text-dark-300">
            <div className="rounded-lg bg-dark-850 px-4 py-3">Players</div>
            <div className="rounded-lg px-4 py-3 hover:bg-dark-850 transition-colors">Players shared with me</div>
            <div className="rounded-lg px-4 py-3 hover:bg-dark-850 transition-colors">Folders</div>
            <div className="rounded-lg px-4 py-3 hover:bg-dark-850 transition-colors">Archives</div>
            <div className="rounded-lg px-4 py-3 hover:bg-dark-850 transition-colors">Trash</div>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-xs font-semibold tracking-wider text-dark-500 mb-3">STORAGE</p>
            <div className="h-2 w-full rounded-full bg-dark-800 overflow-hidden">
              <div className="h-full w-1/3 bg-primary-500" />
            </div>
            <p className="mt-3 text-xs text-dark-400">{(files.reduce((sum, f) => sum + f.file_size, 0) / 1024 / 1024).toFixed(1)} MB used</p>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="h-16 border-b border-dark-800 bg-dark-900/80 backdrop-blur px-4 lg:px-8 flex items-center justify-between">
            <div className="w-full max-w-xl relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
              <input
                placeholder="Search"
                className="w-full h-10 rounded-md bg-dark-850 border border-dark-800 pl-10 pr-4 text-sm text-dark-100 placeholder-dark-500 outline-none focus:border-primary-600"
              />
            </div>
            <div className="ml-4 text-sm text-dark-200 hidden sm:block">{user.email}</div>
          </header>

          <div className="p-4 lg:p-8">
            <section className="flex flex-col lg:flex-row gap-6 lg:items-center mb-8">
              <div className="h-48 w-48 rounded-xl bg-dark-850 border border-dark-800 flex items-center justify-center">
                <IoMusicalNote size={64} className="text-primary-500" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-dark-50">{container.name}</h1>
                <p className="text-dark-400 mt-2">{container.description || 'No description'}</p>
                <p className="text-sm text-primary-500 mt-3">{files.length} tracks</p>
              </div>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-11 rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-50 font-semibold transition-colors"
              >
                Add files
              </button>
              <button className="h-11 rounded-lg bg-dark-850 border border-dark-800 text-dark-200">Paywall</button>
              <button className="h-11 rounded-lg bg-dark-850 border border-dark-800 text-dark-200">Share</button>
              <button className="h-11 rounded-lg bg-dark-850 border border-dark-800 text-dark-200">Download</button>
              <button className="h-11 rounded-lg bg-dark-850 border border-dark-800 text-dark-200 inline-flex items-center justify-center gap-2">
                Plus <IoChevronDown size={14} />
              </button>
            </section>

            {uploading && (
              <div className="mb-4 p-3 bg-primary-900/30 border border-primary-500 rounded-lg text-primary-50 text-sm">
                Caricamento in corso...
              </div>
            )}

            {files.length === 0 ? (
              <div className={`rounded-xl border border-dashed p-10 text-center ${dragActive ? 'border-primary-500 bg-primary-900/10' : 'border-dark-700 bg-dark-900/40'}`}>
                <IoCloudUpload size={28} className="mx-auto mb-3 text-primary-500" />
                <p className="text-dark-200">Trascina qui i file audio oppure usa Add files</p>
              </div>
            ) : (
              <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] border-t border-dark-800">
                <div className="divide-y divide-dark-800/80">
                  {files.map((file) => {
                    const isPlaying = playingFile?.id === file.id;
                    return (
                      <div key={file.id} className={`h-18 px-3 lg:px-4 py-3 flex items-center gap-3 hover:bg-dark-900/60 transition-colors ${isPlaying ? 'bg-dark-900/70' : ''}`}>
                        <button
                          onClick={() => setPlayingFile(file)}
                          className="h-9 w-9 rounded-full border border-dark-700 text-dark-200 hover:text-primary-400 hover:border-primary-500 inline-flex items-center justify-center"
                        >
                          <IoPlaySharp size={16} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-dark-100">{file.file_name}</p>
                          <p className="text-xs text-dark-500 mt-1">
                            {formatDuration(file.duration)} · {file.sample_rate ? `${Math.round(file.sample_rate / 1000)}kHz` : '--'} · {file.bitrate ? `${Math.round(file.bitrate / 1000)}kbps` : '--'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleShare(file.id)}
                          className="h-8 w-8 rounded bg-dark-850 border border-dark-800 text-dark-300 hover:text-primary-400"
                          title="Condividi"
                        >
                          <IoShare size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.file_name)}
                          className="h-8 w-8 rounded bg-dark-850 border border-dark-800 text-dark-300 hover:text-red-400"
                          title="Elimina"
                        >
                          <IoTrash size={14} className="mx-auto" />
                        </button>
                        <button className="h-8 w-8 rounded bg-dark-850 border border-dark-800 text-dark-300 hover:text-dark-100" title="Menu">
                          <IoEllipsisVertical size={14} className="mx-auto" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-l border-dark-800 p-6 bg-dark-900/20">
                  <button className="w-full h-11 rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-50 font-semibold transition-colors">
                    Start a collaboration
                  </button>
                  <div className="mt-6 rounded-lg border border-dark-800 bg-dark-900 p-4 min-h-56">
                    <p className="text-sm text-dark-400">Collaboration feed</p>
                    <p className="text-xs text-dark-500 mt-2">I commenti appariranno qui.</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

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
