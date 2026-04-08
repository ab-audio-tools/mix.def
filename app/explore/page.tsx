'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackCard from '@/components/TrackCard';
import { getTracks, searchTracks, getTracksByTags } from '@/lib/database';
import { Track } from '@/types';
import { Filter, X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function ExploreContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const tags = searchParams.get('tags')?.split(',') || [];

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);

  const allTags = [
    'ambient',
    'electronic',
    'hip-hop',
    'lo-fi',
    'synthwave',
    'techno',
    'house',
    'drum-n-bass',
    'downtempo',
    'experimental',
  ];

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      let results: Track[] = [];

      if (query) {
        results = await searchTracks(query);
      } else if (selectedTags.length > 0) {
        results = await getTracksByTags(selectedTags);
      } else {
        const { tracks } = await getTracks(100);
        results = tracks;
      }

      setTracks(results);
      setLoading(false);
    };

    fetchTracks();
  }, [query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
              {query ? `Search: "${query}"` : 'Explore Tracks'}
            </span>
          </h1>
          <p className="text-white/50 text-lg">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Loading tracks...
              </span>
            ) : (
              `${tracks.length} track${tracks.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              showFilters ? 'block' : 'hidden'
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="sticky top-20 rounded-2xl border border-white/[0.15] bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                  <Filter size={20} className="text-indigo-400" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden text-white/60 hover:text-white hover:bg-white/[0.1] p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tags Filter */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                  Genre
                </p>
                <div className="space-y-2">
                  {allTags.map((tag) => (
                    <label
                      key={tag}
                      className={`
                        flex items-center gap-3 cursor-pointer p-3 rounded-lg
                        transition-all duration-300
                        ${
                          selectedTags.includes(tag)
                            ? 'bg-indigo-500/20 border border-indigo-500/50'
                            : 'hover:bg-white/[0.05] border border-transparent hover:border-white/[0.15]'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm text-white/70 capitalize font-medium">
                        {tag}
                      </span>
                      {selectedTags.includes(tag) && (
                        <span className="ml-auto text-xs text-indigo-400">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {selectedTags.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="w-full py-2.5 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Clear Filters
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mb-6 flex items-center gap-2 px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.15] hover:border-white/[0.25] transition-all text-white/80 hover:text-white font-semibold"
            >
              <Filter size={18} />
              <span>Show Filters</span>
            </button>

            {/* Tracks Grid */}
            {loading ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.15] p-6 h-64 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : tracks.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {tracks.map((track) => (
                  <motion.div key={track.id} variants={itemVariants}>
                    <TrackCard track={track} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32"
              >
                <div className="text-7xl mb-6">🔍</div>
                <p className="text-white/50 mb-8 text-xl">
                  No tracks found. Try a different search or filter.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold transition-all duration-300"
                >
                  <RefreshCw size={18} />
                  Clear Filters and Try Again
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030303] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-white/[0.1] rounded-lg w-1/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white/[0.1] rounded-2xl aspect-square" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
