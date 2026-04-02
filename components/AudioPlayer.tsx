'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FiPlay, FiPause, FiVolume2, FiX } from 'react-icons/fi';

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

    // Initialize WaveSurfer
    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      url: src,
      height: 60,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      waveColor: '#0ea5e9',
      progressColor: '#0284c7',
      cursorColor: '#0ea5e9',
    });

    waveSurferRef.current = waveSurfer;

    // Event listeners
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
    <div className="bg-dark-900 border-t border-dark-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-dark-50 font-semibold truncate">{title}</p>
            <p className="text-dark-400 text-sm truncate">{artist}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 p-2 text-dark-400 hover:text-dark-50 transition-colors"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        {/* Waveform */}
        <div
          ref={containerRef}
          className="mb-3 rounded-lg overflow-hidden bg-dark-800"
        />

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play Button */}
          <button
            onClick={handlePlayPause}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center text-dark-950 transition-colors"
          >
            {isPlaying ? (
              <FiPause size={20} fill="currentColor" />
            ) : (
              <FiPlay size={20} className="ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Time Display */}
          <div className="text-xs text-dark-400 font-mono flex-shrink-0">
            <span>{formatTime(currentTime)}</span>
            <span className="text-dark-600"> / </span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Volume Control */}
          <div className="ml-auto flex items-center gap-2">
            <FiVolume2 size={18} className="text-dark-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
