'use client';

import { useEffect, useState } from 'react';
import { Music, Lock, Play, Download } from 'lucide-react';
import FloatingPlayer from '@/components/FloatingPlayer';

interface SharedFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  format?: string;
}

interface SharedContainer {
  id: string;
  name: string;
  description?: string;
  files: SharedFile[];
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const [share, setShare] = useState<any>(null);
  const [file, setFile] = useState<SharedFile | null>(null);
  const [container, setContainer] = useState<SharedContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      fetchShare(resolvedParams.token);
    })();
  }, [params]);

  async function fetchShare(token: string) {
    try {
      setLoading(true);

      // Get share info
      const shareRes = await fetch(`/api/shares/public/${token}`);
      if (!shareRes.ok) {
        setError('Link di condivisione non valido o scaduto');
        return;
      }

      const shareData = await shareRes.json();
      setShare(shareData.share);

      // If it's a file share
      if (shareData.file) {
        setFile(shareData.file);
        setSelectedFile(shareData.file);
        setPlayerOpen(true);
      }

      // If it's a container share
      if (shareData.container) {
        setContainer(shareData.container);
      }
    } catch (error) {
      console.error('Error fetching share:', error);
      setError('Errore nel caricamento del contenuto condiviso');
    } finally {
      setLoading(false);
    }
  }

  const getPublicAudioUrl = (path: string) => {
    // New uploads are stored locally as /uploads/... and are already publicly reachable.
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/')) {
      return path;
    }

    // Fallback for legacy storage paths saved without a leading slash.
    if (path.startsWith('uploads/')) {
      return `/${path}`;
    }

    // Legacy fallback for old Supabase object keys.
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio-files/${path}`;
  };

  const handleDownload = (path: string, fileName: string) => {
    const url = getPublicAudioUrl(path);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Caricamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4 text-dark-700" />
          <p className="text-dark-50 font-semibold mb-2">Accesso non autorizzato</p>
          <p className="text-dark-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <p className="text-dark-400">Nessun contenuto disponibile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 p-6 pb-40">
      <div className="pointer-events-none fixed inset-0 opacity-30">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-6">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-50 mb-3">Contenuto Condiviso</h1>
          <p className="text-dark-400">
            Visualizza e ascolta i file audio condivisi
          </p>
        </div>

        {/* File Share */}
        {file && (
          <div className="bg-dark-900/90 border border-dark-800 rounded-2xl p-6 md:p-8 mb-10 shadow-2xl shadow-black/40">
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="h-24 w-24 rounded-xl bg-dark-850 border border-dark-700 flex items-center justify-center">
                <Music size={38} className="text-primary-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-400 mb-2">Single Track</p>
                <h2 className="text-2xl md:text-3xl font-bold text-dark-50 truncate">{file.file_name}</h2>
                <p className="text-sm text-dark-400 mt-2">Ascolto privato via link condiviso</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 p-4 bg-dark-850 border border-dark-800 rounded-xl">
              {file.duration && (
                <div>
                  <p className="text-dark-500 text-sm">Durata</p>
                  <p className="text-dark-50 font-semibold">
                    {Math.floor(file.duration / 60)}:{(file.duration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </p>
                </div>
              )}

              {file.format && (
                <div>
                  <p className="text-dark-500 text-sm">Formato</p>
                  <p className="text-dark-50 font-semibold uppercase">
                    {file.format}
                  </p>
                </div>
              )}

              {file.sample_rate && (
                <div>
                  <p className="text-dark-500 text-sm">Sample Rate</p>
                  <p className="text-dark-50 font-semibold">
                    {(file.sample_rate / 1000).toFixed(1)} kHz
                  </p>
                </div>
              )}

              {file.bitrate && (
                <div>
                  <p className="text-dark-500 text-sm">Bitrate</p>
                  <p className="text-dark-50 font-semibold">
                    {file.bitrate} kbps
                  </p>
                </div>
              )}

              {file.lufs && (
                <div>
                  <p className="text-dark-500 text-sm">LUFS</p>
                  <p className="text-dark-50 font-semibold">
                    {file.lufs.toFixed(2)}
                  </p>
                </div>
              )}

              {file.file_size && (
                <div>
                  <p className="text-dark-500 text-sm">Dimensione</p>
                  <p className="text-dark-50 font-semibold">
                    {(file.file_size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(file.file_path, file.file_name)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-dark-50 rounded-lg transition-colors font-semibold"
              >
                <Download size={18} />
                Download
              </button>

              <button
                onClick={() => {
                  setSelectedFile(file);
                  setPlayerOpen(true);
                }}
                className="h-12 w-12 inline-flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-50 transition-colors"
                aria-label="Play track"
                title="Play"
              >
                <Play size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Container Share */}
        {container && (
          <div className="rounded-2xl border border-dark-800 bg-dark-900/80 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-50 mb-2">
              {container.name}
            </h2>
            {container.description && (
              <p className="text-dark-400 mb-6">{container.description}</p>
            )}

            {container.files && container.files.length > 0 ? (
              <div className="space-y-3">
                {container.files.map((f) => (
                  <div
                    key={f.id}
                    className="bg-dark-850 border border-dark-800 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 hover:border-primary-700/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-dark-50 font-semibold truncate">{f.file_name}</p>
                      <p className="text-xs text-dark-500 mt-1 truncate">
                        {(f.file_size / 1024 / 1024).toFixed(2)} MB • {f.format?.toUpperCase() || 'AUDIO'} • {f.sample_rate ? `${(f.sample_rate / 1000).toFixed(1)}kHz` : 'n/a'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(f.file_path, f.file_name)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-50 rounded-lg transition-colors text-sm font-semibold"
                      >
                        <Download size={16} />
                        Download
                      </button>

                      <button
                        onClick={() => {
                          setSelectedFile(f);
                          setPlayerOpen(true);
                        }}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-50 transition-colors"
                        aria-label={`Play ${f.file_name}`}
                        title="Play"
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-dark-400 text-center py-8">
                Nessun file in questo container
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating Player */}
      {playerOpen && selectedFile && (
        <FloatingPlayer
          file={{
            ...selectedFile,
            file_path: getPublicAudioUrl(selectedFile.file_path),
          }}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  );
}
