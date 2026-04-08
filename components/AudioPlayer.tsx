'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  onClose?: () => void;
}

export default function AudioPlayer({
  src,
  title,
  artist,
  onClose,
}: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      height: 60,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      waveColor: 'rgba(6, 182, 212, 0.3)',
      progressColor: 'rgb(6, 182, 212)',
      cursorColor: 'rgb(6, 182, 212)',
    });

    waveSurferRef.current = waveSurfer;

    const handleReady = () => {
      setDuration(waveSurfer.getDuration());
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleAudioProcess = () => setCurrentTime(waveSurfer.getCurrentTime());

    waveSurfer.on('ready', handleReady);
    waveSurfer.on('play', handlePlay);
    waveSurfer.on('pause', handlePause);
    waveSurfer.on('audioprocess', handleAudioProcess);

    return () => {
      waveSurfer.destroy();
    };
  }, [src]);

  const handlePlayPause = () => {
    waveSurferRef.current?.playPause();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (waveSurferRef.current) {
      waveSurferRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-white/10 p-4 bg-white/[0.02] backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{title}</p>
            <p className="text-white/60 text-sm truncate">{artist}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Waveform */}
        <div
          ref={containerRef}
          className="mb-3 rounded-xl overflow-hidden bg-white/[0.03] border border-white/10"
        />

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play Button */}
          <button
            onClick={handlePlayPause}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white transition-all duration-300 font-bold shadow-lg",
              "hover:from-cyan-600 hover:via-purple-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5",
              "active:scale-95"
            )}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} className="ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Time Display */}
          <div className="text-xs text-white/60 font-mono flex-shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40"> / </span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="ml-auto flex items-center gap-2">
            <Volume2 size={18} className="text-white/60" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
