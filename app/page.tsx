'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TrackCard from '@/components/TrackCard';
import { getTracks } from '@/lib/database';
import { Track } from '@/types';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const { tracks } = await getTracks(12);
      setTracks(tracks);
      setLoading(false);
    };

    fetchTracks();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950 py-20 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-primary-500 to-accent-500 bg-clip-text text-transparent">
            Share Your Sound
          </h1>
          <p className="text-xl md:text-2xl text-dark-300 mb-8 max-w-2xl mx-auto">
            mix.def is a modern platform for music producers and sound designers to
            showcase their work, connect with other creators, and build their portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-dark-50 font-semibold rounded-lg transition-colors"
            >
              Explore Tracks
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center px-8 py-3 border border-dark-700 hover:border-dark-600 text-dark-50 font-semibold rounded-lg transition-colors"
            >
              Upload Your Music
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tracks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Tracks</h2>
            <p className="text-dark-400">
              Discover the newest sounds from our community
            </p>
          </div>
          <Link
            href="/explore"
            className="text-primary-500 hover:text-primary-400 font-semibold flex items-center gap-2"
          >
            View All
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="card h-64 animate-shimmer"
              ></div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dark-400 mb-4">
              No tracks yet. Be the first to upload!
            </p>
            <Link
              href="/upload"
              className="text-primary-500 hover:text-primary-400 font-semibold"
            >
              Upload a track
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-900 to-accent-900 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to share your music?
          </h2>
          <p className="text-lg text-dark-200 mb-8">
            Join thousands of creators building their portfolio on mix.def
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-dark-50 hover:bg-dark-200 text-dark-950 font-semibold rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
