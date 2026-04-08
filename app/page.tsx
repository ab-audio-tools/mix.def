'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TrackCard from '@/components/TrackCard';
import { getTracks } from '@/lib/database';
import { Track } from '@/types';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { motion } from 'framer-motion';
import { ArrowRight, Music, Users, Zap } from 'lucide-react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Hero Section */}
      <HeroGeometric
        title1="Condividi Audio Privato"
        title2="Con i Tuoi Clienti"
      />

      {/* Features Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#030303] via-[#0a0a0a] to-[#030303]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.03] via-transparent to-rose-500/[0.03] blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Why Choose mix.def?
              </span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              A modern platform designed for music creators to share, discover, and collaborate
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Music,
                title: "Upload & Share",
                description: "Easily upload your tracks with metadata, cover art, and detailed information"
              },
              {
                icon: Users,
                title: "Connect & Discover",
                description: "Find talented producers and sound designers in our creative community"
              },
              {
                icon: Zap,
                title: "Modern Experience",
                description: "Built with cutting-edge technology for the best experience"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative p-8 rounded-2xl"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.15] group-hover:border-white/[0.25] transition-all duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/[0.1] to-rose-500/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                
                <div className="relative z-10">
                  <feature.icon className="w-12 h-12 mb-4 text-indigo-400" />
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-rose-300 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-white/50 group-hover:text-white/70 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Tracks Section */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300">
                  Recent Tracks
                </span>
              </h2>
              <p className="text-white/40 text-lg">
                Discover the latest uploads from our community
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.15] hover:border-white/[0.25] text-white/80 hover:text-white transition-all duration-300 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white/[0.03] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tracks.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tracks.map((track) => (
                <motion.div key={track.id} variants={itemVariants}>
                  <TrackCard track={track} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-xl">No tracks yet. Be the first to upload!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.1] via-transparent to-rose-500/[0.1] blur-3xl" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Ready to Share Your Sound?
            </h2>
            <p className="text-lg text-white/40 mb-8">
              Join thousands of creators and start building your portfolio today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.15] rounded-xl font-semibold text-white transition-all duration-300"
              >
                Explore First
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
