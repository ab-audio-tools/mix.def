'use client';

import { useEffect, useRef, useState } from 'react';
import { IoClose, IoPlaySharp, IoPauseSharp, IoVolumeMedium, IoDownload } from 'react-icons/io5';
import WaveSurfer from 'wavesurfer.js';

interface PlayerProps {
  fileId: string;
  fileName: string;
  fileUrl: string;
  metadata?: {
    duration?: number;
    sample_rate?: number;
    bitrate?: number;
    lufs?: number;
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

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#005018', // primary-500
      progressColor: '#089f00', // accent-500
      cursorColor: '#1b9a19',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 64,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.load(fileUrl);

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
    });
    wavesurfer.on('timeupdate', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    return () => {
      wavesurfer.destroy();
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

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 right-0 w-full md:w-96 bg-dark-900/95 backdrop-blur-sm border border-dark-800 rounded-t-lg shadow-2xl z-40"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-800">
        <h3 className="text-dark-50 font-semibold truncate flex-1 mr-4">
          {fileName}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-dark-50"
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* Waveform */}
      <div
        ref={waveformRef}
        className="bg-dark-950 border-b border-dark-800"
        style={{ width: '100%' }}
      />

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Play/Pause and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? <IoPauseSharp size={18} /> : <IoPlaySharp size={18} />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <IoVolumeMedium size={16} className="text-dark-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>

          <div className="text-sm text-dark-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-dark-800 rounded-lg text-xs">
          {metadata.duration && (
            <div>
              <p className="text-dark-500">Durata</p>
              <p className="text-dark-50 font-semibold">
                {formatTime(metadata.duration)}
              </p>
            </div>
          )}

          {metadata.format && (
            <div>
              <p className="text-dark-500">Formato</p>
              <p className="text-dark-50 font-semibold uppercase">
                {metadata.format}
              </p>
            </div>
          )}

          {metadata.sample_rate && (
            <div>
              <p className="text-dark-500">Sample Rate</p>
              <p className="text-dark-50 font-semibold">
                {(metadata.sample_rate / 1000).toFixed(1)} kHz
              </p>
            </div>
          )}

          {metadata.bitrate && (
            <div>
              <p className="text-dark-500">Bitrate</p>
              <p className="text-dark-50 font-semibold">
                {metadata.bitrate} kbps
              </p>
            </div>
          )}

          {metadata.lufs && (
            <div>
              <p className="text-dark-500">LUFS</p>
              <p className="text-dark-50 font-semibold">
                {metadata.lufs.toFixed(2)} LUFS
              </p>
            </div>
          )}

          {typeof metadata !== 'object' || Object.keys(metadata).length === 0 ? (
            <p className="col-span-2 text-dark-400 text-center py-2">
              Nessun metadata disponibile
            </p>
          ) : null}
        </div>

        {/* Download Button */}
        <a
          href={fileUrl}
          download={fileName}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-50 rounded-lg transition-colors text-sm font-semibold"
        >
          <IoDownload size={14} />
          Scarica
        </a>
      </div>
    </div>
  );
}
