'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Track } from '@/types';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
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

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(track.likes_count || 0);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handlePlay = () => {
    if (onPlay) {
      onPlay(track);
    } else {
      window.location.href = `/track/${track.id}`;
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsHeartAnimating(true);
    
    setTimeout(() => setIsHeartAnimating(false), 600);

    try {
      // API call would go here
    } catch (error) {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      toast.error('Failed to like track');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`);
      toast.success('Track link copied!');
    } catch (error) {
      toast.error('Failed to copy track link');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.15] group-hover:border-white/[0.25] rounded-2xl transition-all duration-300" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.1] to-rose-500/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl rounded-2xl" />

      <div className="relative z-10">
        {/* Cover Image */}
        <div className="relative w-full aspect-square overflow-hidden rounded-t-[22px] bg-gradient-to-br from-indigo-500/20 to-rose-500/20">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🎵</div>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Button */}
          <motion.button
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-indigo-500/50">
              <Play size={28} className="text-white fill-white ml-1" />
            </div>
          </motion.button>

          {/* Duration Badge */}
          {track.duration && (
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 border border-white/[0.15]">
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
              className="text-white/50 hover:text-indigo-400 text-sm transition-colors block truncate mb-2"
            >
              {track.user.username}
            </Link>
          )}

          {/* Title */}
          <Link
            href={`/track/${track.id}`}
            className="text-white font-semibold hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-indigo-300 hover:to-rose-300 transition-all block truncate mb-3 line-clamp-2 cursor-pointer"
          >
            {track.title}
          </Link>

          {/* Tags */}
          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {track.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tags=${encodeURIComponent(tag)}`}
                  className="text-xs bg-white/[0.05] hover:bg-rose-500/20 text-white/60 hover:text-rose-300 px-2.5 py-1.5 rounded-lg transition-all duration-200 border border-white/[0.1] hover:border-rose-500/30"
                >
                  #{tag}
                </Link>
              ))}
              {track.tags.length > 2 && (
                <span className="text-xs text-white/40 px-2.5 py-1.5">
                  +{track.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-white/40 mb-4 pb-4 border-b border-white/[0.1]">
            {formatDistanceToNow(new Date(track.created_at), {
              addSuffix: true,
              locale: it,
            })}
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-white/50 mb-4">
            <div className="flex items-center gap-1.5 group/stat hover:text-indigo-400 cursor-pointer transition-colors">
              <Play size={14} className="group-hover/stat:scale-110 transition-transform" />
              <span>{formatCount(track.plays_count)}</span>
            </div>
            <div className="flex items-center gap-1.5 group/stat hover:text-rose-400 cursor-pointer transition-colors">
              <Heart size={14} className="group-hover/stat:scale-110 transition-transform" />
              <span>{formatCount(likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 group/stat hover:text-indigo-400 cursor-pointer transition-colors">
              <MessageCircle size={14} className="group-hover/stat:scale-110 transition-transform" />
              <span>{formatCount(track.comments_count)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button 
              onClick={handleLike}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm font-medium duration-300 relative overflow-hidden",
                isLiked 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.15]'
              )}
            >
              <Heart 
                size={16} 
                className={cn(
                  "transition-all duration-300",
                  isLiked ? 'fill-rose-400' : ''
                )}
              />
              <span className="hidden sm:inline">Like</span>
            </motion.button>
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2.5 bg-white/[0.05] hover:bg-rose-500/20 rounded-lg transition-all text-white/70 hover:text-rose-300 hover:border-rose-500/30 border border-white/[0.1] duration-300"
              title="Share"
            >
              <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
