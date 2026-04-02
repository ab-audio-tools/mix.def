'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { getUserProfile, getUserTracks, toggleFollow } from '@/lib/database';
import { User, Track } from '@/types';
import TrackCard from '@/components/TrackCard';
import {
  FiEdit2,
  FiUserPlus,
  FiUserCheck,
  FiArrowLeft,
  FiTwitter,
  FiInstagram,
  FiLink,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile(userId);
        if (userData) {
          setProfile(userData);
        }

        const userTracks = await getUserTracks(userId);
        setTracks(userTracks);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleFollowClick = async () => {
    if (!currentUser) {
      router.push('/signin');
      return;
    }

    try {
      const result = await toggleFollow(currentUser.id, userId);
      if (result) {
        setIsFollowing(result.following);
        setFollowers((prev) =>
          result.following ? prev + 1 : Math.max(prev - 1, 0)
        );
        toast.success(
          result.following ? 'Following user' : 'Unfollowed user'
        );
      }
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">User not found</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-12">
      {/* Profile Header */}
      <div className="border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-8 transition-colors"
          >
            <FiArrowLeft size={20} />
            Back
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0 overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {profile.username}
                  </h1>
                  {profile.bio && (
                    <p className="text-dark-300 mt-2">{profile.bio}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {isOwnProfile ? (
                    <Link
                      href={`/profile/${profile.id}/edit`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={18} />
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      onClick={handleFollowClick}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: isFollowing ? '#303030' : '#0284c7',
                        color: isFollowing ? '#f5f5f5' : '#121212',
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <FiUserCheck size={18} />
                          Following
                        </>
                      ) : (
                        <>
                          <FiUserPlus size={18} />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(profile.website || profile.twitter || profile.instagram) && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      <FiLink size={16} />
                      Website
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      <FiTwitter size={16} />
                      Twitter
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      <FiInstagram size={16} />
                      Instagram
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-dark-400">Tracks</p>
                  <p className="text-2xl font-bold text-dark-50">
                    {tracks.length}
                  </p>
                </div>
                <div>
                  <p className="text-dark-400">Followers</p>
                  <p className="text-2xl font-bold text-dark-50">{followers}</p>
                </div>
                <div>
                  <p className="text-dark-400">Following</p>
                  <p className="text-2xl font-bold text-dark-50">{following}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Tracks</h2>

        {tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dark-400 mb-4">No tracks uploaded yet</p>
            {isOwnProfile && (
              <Link
                href="/upload"
                className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
              >
                Upload Your First Track
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
