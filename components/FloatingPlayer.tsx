'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '@/lib/utils';

interface AudioFile {
  id: string;
  file_name: string;
  file_path: string;
  duration?: number;
  sample_rate?: number;
  bitrate?: number;
  lufs?: number;
  true_peak?: number;
  loudness_range?: number;
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

  useEffect(() => {
    if (!waveRef.current) return;

    const ws = WaveSurfer.create({
      container: waveRef.current,
      waveColor: 'rgba(6, 182, 212, 0.3)',
      progressColor: 'rgb(6, 182, 212)',
      cursorColor: 'rgb(6, 182, 212)',
      height: 60,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });

    void ws.load(file.file_path).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.warn('Error loading wavesurfer:', error);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('timeupdate', (currentTime) => setCurrentTime(currentTime));
    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    setWavesurfer(ws);

    return () => {
      try {
        ws.destroy();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.warn('Error destroying wavesurfer:', error);
      }
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
    const parts: string[] = [];

    if (file.format) {
      parts.push(file.format.toUpperCase());
    }

    if (file.sample_rate) {
      parts.push(`${(file.sample_rate / 1000).toFixed(1)}kHz`);
    }

    if (file.bitrate) {
      parts.push(`${Math.round(file.bitrate / 1000)}kbps`);
    }

    if (file.lufs !== null && file.lufs !== undefined && !isNaN(file.lufs)) {
      parts.push(`${file.lufs.toFixed(1)}dB LUFS`);
    }

    if (file.true_peak !== null && file.true_peak !== undefined && !isNaN(file.true_peak)) {
      parts.push(`${file.true_peak.toFixed(1)}dBTP`);
    }

    if (file.loudness_range !== null && file.loudness_range !== undefined && !isNaN(file.loudness_range)) {
      parts.push(`${file.loudness_range.toFixed(1)}dB LRA`);
    }

    return parts.join(' | ');
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 border-t border-white/10 shadow-2xl z-50 bg-white/[0.02] backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-5">
        {/* Header with title and metadata */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate text-base md:text-lg">
              {file.file_name.replace(/\.[^/.]+$/, '')}
            </h3>
            <p className="text-xs md:text-sm text-cyan-400 mt-1 truncate">
              {formatMetadata()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors mt-1"
            aria-label="Close player"
          >
            <X size={20} />
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
            className={cn(
              "flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 group-hover:shadow-lg group-hover:shadow-rose-500/50 transition-all duration-300 font-bold shadow-lg",
              "hover:from-indigo-600 hover:to-rose-600 hover:shadow-lg hover:shadow-rose-500/50 hover:-translate-y-0.5",
              "active:scale-95"
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          {/* Time and Duration */}
          <div className="flex-shrink-0 text-xs md:text-sm text-white/60 tabular-nums font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Progress Bar (visible on larger screens) */}
          <div
            className="hidden md:block flex-1 h-1 bg-white/10 rounded-full cursor-pointer hover:h-2 transition-all"
            onClick={(e) => {
              if (wavesurfer && containerRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                wavesurfer.seekTo(percent);
              }
            }}
          >
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </div>

          {/* Volume Control (visible on larger screens) */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-white/60">Vol</span>
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
              className="w-12 h-1 cursor-pointer accent-cyan-500 bg-white/10 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
