'use client';

import { useEffect, useState } from 'react';
import { IoMusicalNote, IoLockClosed } from 'react-icons/io5';
import FloatingAudioPlayer from '@/components/FloatingAudioPlayer';

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
          <IoLockClosed size={48} className="mx-auto mb-4 text-dark-700" />
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
    <div className="min-h-screen bg-dark-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-50 mb-2">Contenuto Condiviso</h1>
          <p className="text-dark-400">
            Visualizza e ascolta i file audio condivisi
          </p>
        </div>

        {/* File Share */}
        {file && (
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6 text-center mb-8">
            <IoMusicalNote size={48} className="mx-auto mb-4 text-primary-500" />
            <h2 className="text-2xl font-bold text-dark-50 mb-2">{file.file_name}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 p-4 bg-dark-800 rounded-lg">
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

            <button
              onClick={() => {
                setSelectedFile(file);
                setPlayerOpen(true);
              }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors font-semibold"
            >
              Riproduci
            </button>
          </div>
        )}

        {/* Container Share */}
        {container && (
          <div>
            <h2 className="text-2xl font-bold text-dark-50 mb-4">
              {container.name}
            </h2>
            {container.description && (
              <p className="text-dark-400 mb-6">{container.description}</p>
            )}

            {container.files && container.files.length > 0 ? (
              <div className="space-y-2">
                {container.files.map((f) => (
                  <div
                    key={f.id}
                    className="bg-dark-900 border border-dark-800 rounded-lg p-4 flex items-center justify-between hover:border-dark-700 transition-colors"
                  >
                    <div>
                      <p className="text-dark-50 font-semibold">{f.file_name}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        {(f.file_size / 1024 / 1024).toFixed(2)} MB •{' '}
                        {f.format?.toUpperCase()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFile(f);
                        setPlayerOpen(true);
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Riproduci
                    </button>
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
        <FloatingAudioPlayer
          fileId={selectedFile.id}
          fileName={selectedFile.file_name}
          fileUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio-files/${selectedFile.file_path}`}
          metadata={{
            duration: selectedFile.duration,
            sample_rate: selectedFile.sample_rate,
            bitrate: selectedFile.bitrate,
            lufs: selectedFile.lufs,
            format: selectedFile.format,
          }}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </div>
  );
}
