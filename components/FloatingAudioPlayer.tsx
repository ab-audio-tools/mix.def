'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, Download } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '@/lib/utils';

interface PlayerProps {
  fileId: string;
  fileName: string;
  fileUrl: string;
  metadata?: {
    duration?: number;
    sample_rate?: number;
    bitrate?: number;
    lufs?: number;
    true_peak?: number;
    loudness_range?: number;
    format?: string;
  };
  onClose: () => void;
}

export default function FloatingAudioPlayer({
  fileId,
  fileName,
  fileUrl,
  metadata = {},
  onClose,
}: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(6, 182, 212, 0.3)',
      progressColor: 'rgb(6, 182, 212)',
      cursorColor: 'rgb(6, 182, 212)',
      barWidth: 1.5,
      barGap: 0.5,
      barRadius: 2,
      height: 48,
    });

    wavesurferRef.current = wavesurfer;

    void wavesurfer.load(fileUrl).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      console.warn('Error loading wavesurfer:', error);
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });
    wavesurfer.on('timeupdate', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    return () => {
      try {
        wavesurfer.destroy();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.warn('Error destroying wavesurfer:', error);
      }
    };
  }, [fileUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(vol);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMetadataString = () => {
    const parts: string[] = [];
    
    if (metadata.format) {
      parts.push(metadata.format.toUpperCase());
    }
    
    if (metadata.sample_rate) {
      parts.push(`${(metadata.sample_rate / 1000).toFixed(1)}kHz`);
    }
    
    if (metadata.bitrate) {
      parts.push(`${Math.round(metadata.bitrate / 1000)}kbps`);
    }
    
    if (metadata.lufs !== undefined && metadata.lufs !== null) {
      parts.push(`${metadata.lufs.toFixed(1)}dB LUFS`);
    }

    if (metadata.true_peak !== undefined && metadata.true_peak !== null) {
      parts.push(`${metadata.true_peak.toFixed(1)}dBTP`);
    }

    if (metadata.loudness_range !== undefined && metadata.loudness_range !== null) {
      parts.push(`${metadata.loudness_range.toFixed(1)}dB LRA`);
    }
    
    return parts.join(' | ');
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0 w-full md:w-96 rounded-t-3xl shadow-2xl z-40 border border-white/10 backdrop-blur-md bg-white/[0.05] animate-slide-up"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate mr-4 text-sm md:text-base">
            {fileName}
          </h3>
          <p className="text-white/60 text-xs">{formatMetadataString()}</p>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-2 rounded-lg transition-all duration-300 text-white/60 hover:text-white",
            "hover:bg-white/10 flex-shrink-0"
          )}
          title="Close player"
        >
          <X size={20} />
        </button>
      </div>

      {/* Waveform */}
      <div
        ref={waveformRef}
        className="bg-white/[0.02] border-b border-white/10 transition-all duration-300"
        style={{ width: '100%' }}
      />

      {/* Controls */}
      <div className="p-4 space-y-4 bg-gradient-to-t from-white/[0.02] to-transparent">
        {/* Play/Pause and Time */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className={cn(
                "w-12 h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 text-white rounded-full flex items-center justify-center transition-all duration-300 font-bold shadow-lg",
                "hover:from-cyan-600 hover:via-purple-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-1",
                "active:scale-95"
              )}
            >
              {isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} className="ml-0.5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-white/60 hover:text-white transition-colors" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 transition-all"
              />
            </div>
          </div>

          <div className="text-xs md:text-sm text-white/60 font-mono">
            {formatTime(currentTime)} <span className="text-white/40">/</span> {formatTime(duration)}
          </div>
        </div>

        {/* Download Button */}
        <a
          href={fileUrl}
          download={fileName}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold",
            "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30",
            "hover:-translate-y-0.5"
          )}
        >
          <Download size={16} />
          <span>Scarica</span>
        </a>
      </div>
    </div>
  );
}
