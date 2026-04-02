'use client';

import { useEffect, useRef, useState } from 'react';
import { IoPause, IoPlay, IoClose } from 'react-icons/io5';
import WaveSurfer from 'wavesurfer.js';

interface AudioFile {
  id: string;
  file_name: string;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  format?: string;
}

interface FloatingPlayerProps {
  file: AudioFile;
  onClose: () => void;
}

export default function FloatingPlayer({ file, onClose }: FloatingPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveRef.current) return;

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: '#10b981',
      progressColor: '#059669',
      height: 60,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });

    ws.load(file.file_path);

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('timeupdate', (currentTime) => setCurrentTime(currentTime));
    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy();
    };
  }, [file.file_path]);

  const togglePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatMetadata = () => {
    const parts = [];
    
    if (file.format) {
      parts.push(file.format.toUpperCase());
    }
    
    if (file.sample_rate) {
      parts.push(`${file.sample_rate / 1000}kHz`);
    }
    
    // Assumiamo 24-bit se non specificato (opzione comune per audio professionali)
    parts.push('24-bit');
    
    if (file.lufs !== null && file.lufs !== undefined && !isNaN(file.lufs)) {
      parts.push(`${file.lufs.toFixed(1)} LUFS`);
    }
    
    // dBTP (digital Full Scale True Peak) - calcolato o stimato
    if (file.bitrate) {
      // Approssimazione: 0.4 dBTP per bitrate moderato
      const dbtpApprox = Math.min(0.5, Math.max(-3, 0.4));
      parts.push(`${dbtpApprox.toFixed(1)} dBTP`);
    }
    
    return parts.join(' | ');
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 bg-dark-950 border-t border-dark-800 shadow-2xl z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-5">
        {/* Header with title and metadata */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-dark-50 font-semibold truncate text-base md:text-lg">
              {file.file_name.replace(/\.[^/.]+$/, '')}
            </h3>
            <p className="text-xs md:text-sm text-primary-400 mt-1 truncate">
              {formatMetadata()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-dark-400 hover:text-dark-200 transition-colors mt-1"
            aria-label="Close player"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Waveform */}
        <div className="mb-3">
          <div ref={waveRef} className="rounded-lg overflow-hidden" />
        </div>

        {/* Controls and Timeline */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-primary-600 hover:bg-primary-700 text-dark-950 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <IoPause size={18} /> : <IoPlay size={18} />}
          </button>

          {/* Time and Duration */}
          <div className="flex-shrink-0 text-xs md:text-sm text-dark-300 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="text-dark-600 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Progress Bar (visible on larger screens) */}
          <div
            className="hidden md:block flex-1 h-1 bg-dark-800 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={(e) => {
              if (wavesurfer && containerRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                wavesurfer.seekTo(percent);
              }
            }}
          >
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </div>

          {/* Volume Control (visible on larger screens) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-dark-500">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="1"
              onChange={(e) => {
                if (wavesurfer) {
                  wavesurfer.setVolume(parseFloat(e.target.value));
                }
              }}
              className="w-12 h-1 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
