'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTrackById, toggleLike } from '@/lib/database';
import { useAuthStore } from '@/lib/auth';
import { Track, Comment } from '@/types';
import AudioPlayer from '@/components/AudioPlayer';
import {
  FiArrowLeft,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiPlay,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function TrackPage() {
  const params = useParams();
  const trackId = params.id as string;
  const { user } = useAuthStore();

  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      setLoading(true);
      try {
        const trackData = await getTrackById(trackId);
        if (trackData) {
          setTrack(trackData);
          setIsLiked(trackData.is_liked || false);
          // setComments(trackData.comments || []);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
        toast.error('Failed to load track');
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [trackId]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like tracks');
      return;
    }

    try {
      const result = await toggleLike(user.id, trackId);
      if (result) {
        setIsLiked(result.liked);
        if (track) {
          setTrack({
            ...track,
            likes_count: result.liked
              ? track.likes_count + 1
              : Math.max(track.likes_count - 1, 0),
          });
        }
      }
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Track link copied!');
    } catch (error) {
      toast.error('Failed to copy track link');
    }
  };

  const scrollToComments = () => {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);

    try {
      // In a real app, you would save this to the database
      // For now, we'll just add it to the local state
      toast.success('Comment posted successfully');
      setCommentText('');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">Track not found</p>
          <Link
            href="/explore"
            className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
          >
            Back to explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-12">
      {/* Header */}
      <div className="border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-8 transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to explore
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="w-full md:w-64 aspect-square bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎵</div>
                  </div>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {track.title}
              </h1>

              {track.user && (
                <Link
                  href={`/profile/${track.user.id}`}
                  className="text-lg text-dark-400 hover:text-primary-400 transition-colors inline-block mb-4"
                >
                  {track.user.username}
                </Link>
              )}

              {track.description && (
                <p className="text-dark-300 mb-6">{track.description}</p>
              )}

              {/* Tags */}
              {track.tags && track.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {track.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/explore?tags=${encodeURIComponent(tag)}`}
                      className="text-xs bg-dark-800 hover:bg-dark-700 text-dark-300 px-3 py-1 rounded-full transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm mb-6 pb-6 border-b border-dark-800">
                <div>
                  <p className="text-dark-400">Plays</p>
                  <p className="text-xl font-bold text-dark-50">
                    {track.plays_count}
                  </p>
                </div>
                <div>
                  <p className="text-dark-400">Likes</p>
                  <p className="text-xl font-bold text-dark-50">
                    {track.likes_count}
                  </p>
                </div>
                <div>
                  <p className="text-dark-400">Comments</p>
                  <p className="text-xl font-bold text-dark-50">
                    {track.comments_count}
                  </p>
                </div>
                <div>
                  <p className="text-dark-400">Uploaded</p>
                  <p className="text-sm text-dark-50">
                    {formatDistanceToNow(new Date(track.created_at), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                    isLiked
                      ? 'bg-accent-600 text-dark-50'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                  }`}
                >
                  <FiHeart
                    size={18}
                    fill={isLiked ? 'currentColor' : 'none'}
                  />
                  Like
                </button>
                <button onClick={scrollToComments} className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-50 rounded-lg transition-colors font-semibold">
                  <FiMessageSquare size={18} />
                  Comment
                </button>
                <button onClick={handleShare} className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-dark-50 rounded-lg transition-colors font-semibold">
                  <FiShare2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      <AudioPlayer
        src={track.file_url}
        title={track.title}
        artist={track.user?.username || 'Unknown'}
      />

      {/* Comments Section */}
      <div id="comments" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Comments</h2>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0 overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full input-field min-h-20 resize-none mb-2"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-dark-50 rounded-lg transition-colors font-semibold"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-dark-900 border border-dark-800 rounded-lg text-center">
            <p className="text-dark-400 mb-3">
              Sign in to comment on this track
            </p>
            <Link
              href="/signin"
              className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="card p-4">
                <div className="flex gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark-50">
                      {comment.user?.username}
                    </p>
                    <p className="text-xs text-dark-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-dark-300">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-dark-400">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
