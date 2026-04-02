'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackCard from '@/components/TrackCard';
import { getTracks, searchTracks, getTracksByTags } from '@/lib/database';
import { Track } from '@/types';
import { FiFilter, FiX } from 'react-icons/fi';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : 'Explore Tracks'}
        </h1>
        <p className="text-dark-400">
          {loading ? 'Loading...' : `${tracks.length} tracks found`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters */}
        <div className={`${
          showFilters ? 'block' : 'hidden'
        } md:block w-full md:w-56 flex-shrink-0`}>
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FiFilter size={18} />
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden text-dark-400 hover:text-dark-50"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-medium text-dark-300 mb-3">Tags</p>
              <div className="space-y-2">
                {allTags.map((tag) => (
                  <label key={tag} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                    />
                    <span className="text-sm text-dark-300 capitalize">
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="w-full mt-4 py-2 text-sm text-primary-500 hover:text-primary-400 transition-colors border border-dark-700 rounded"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiFilter size={18} />
            Filters
          </button>

          {/* Tracks Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card h-64 animate-shimmer"></div>
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
              <p className="text-dark-400 mb-4">No tracks found</p>
              <button
                onClick={() => {
                  setSelectedTags([]);
                }}
                className="text-primary-500 hover:text-primary-400 font-semibold"
              >
                Clear filters and try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
