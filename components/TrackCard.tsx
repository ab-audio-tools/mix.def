'use client';

import Link from 'next/link';
import { Track } from '@/types';
import { FiPlay, FiHeart, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
}

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  const handlePlay = () => {
    if (onPlay) {
      onPlay(track);
    } else {
      // Navigate to track detail page
      window.location.href = `/track/${track.id}`;
    }
  };

  return (
    <div className="card group overflow-hidden">
      {/* Cover Image */}
      <div className="relative w-full aspect-square bg-dark-800 overflow-hidden">
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🎵</div>
              <p className="text-dark-400 text-sm">No cover</p>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        >
          <div className="w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors">
            <FiPlay size={28} className="ml-1 text-dark-950 fill-dark-950" />
          </div>
        </button>

        {/* Duration Badge */}
        {track.duration && (
          <div className="absolute bottom-2 right-2 bg-dark-950/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
            {formatDuration(track.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Artist */}
        {track.user && (
          <Link
            href={`/profile/${track.user.id}`}
            className="text-dark-500 hover:text-dark-300 text-sm transition-colors block truncate mb-1"
          >
            {track.user.username}
          </Link>
        )}

        {/* Title */}
        <Link
          href={`/track/${track.id}`}
          className="text-dark-50 font-semibold hover:text-primary-400 transition-colors block truncate mb-3"
        >
          {track.title}
        </Link>

        {/* Tags */}
        {track.tags && track.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {track.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag}
                href={`/explore?tags=${encodeURIComponent(tag)}`}
                className="text-xs bg-dark-800 hover:bg-dark-700 text-dark-300 px-2 py-1 rounded transition-colors"
              >
                #{tag}
              </Link>
            ))}
            {track.tags.length > 2 && (
              <span className="text-xs text-dark-500">
                +{track.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-dark-500 mb-4">
          {formatDistanceToNow(new Date(track.created_at), {
            addSuffix: true,
            locale: it,
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-dark-400 mb-4 pb-4 border-b border-dark-800">
          <div className="flex items-center gap-1 hover:text-primary-400 cursor-pointer transition-colors">
            <FiPlay size={16} />
            <span>{formatCount(track.plays_count)}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-accent-400 cursor-pointer transition-colors">
            <FiHeart size={16} />
            <span>{formatCount(track.likes_count)}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-primary-400 cursor-pointer transition-colors">
            <FiMessageSquare size={16} />
            <span>{formatCount(track.comments_count)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded transition-colors text-sm font-medium text-dark-300 hover:text-dark-50">
            <FiHeart size={16} />
            Like
          </button>
          <button className="px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded transition-colors text-dark-300 hover:text-dark-50">
            <FiShare2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
