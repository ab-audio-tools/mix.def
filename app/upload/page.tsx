'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { uploadAudioFile, uploadCoverImage } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Cloud, X, ArrowLeft, Music } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function UploadPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <div className="text-center">
          <p className="text-white/50 mb-4">You need to be signed in to upload</p>
          <Link
            href="/signin"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white rounded-lg transition-all font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File is too large (max 100MB)');
        return;
      }
      setAudioFile(file);
      setAudioPreview(file.name);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover image is too large (max 10MB)');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!audioFile) {
      toast.error('Audio file is required');
      return;
    }

    setUploading(true);

    try {
      const audioResult = await uploadAudioFile(audioFile, user.id);
      if (!audioResult.success) {
        throw new Error('Failed to upload audio file');
      }

      let coverUrl: string | null = null;
      if (coverFile) {
        const coverResult = await uploadCoverImage(coverFile, user.id);
        if (coverResult.success) {
          coverUrl = coverResult.url;
        }
      }

      const estimatedDuration = Math.round(audioFile.size / (128000 / 8));

      const { error } = await supabase.from('tracks').insert({
        user_id: user.id,
        title,
        description: description || null,
        duration: estimatedDuration,
        file_url: audioResult.url,
        cover_url: coverUrl,
        tags: tags,
        plays_count: 0,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;

      toast.success('Track uploaded successfully!');
      router.push(`/profile/${user.id}`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload track');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href={`/profile/${user.id}`}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors duration-300"
        >
          <ArrowLeft size={20} />
          Back to profile
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.15] bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-xl p-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Upload Your Track
          </h1>
          <p className="text-white/50 mb-8">Share your music with the community</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Cover Image */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Cover Image (Optional)
              </label>
              <div className="relative w-full max-w-xs">
                {coverPreview ? (
                  <div className="relative group">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-all duration-300 backdrop-blur-md"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center aspect-square rounded-xl border-2 border-dashed border-white/[0.2] hover:border-rose-500/50 cursor-pointer transition-all duration-300 bg-white/[0.03] group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                    <div className="text-center pointer-events-none">
                      <Cloud size={40} className="mx-auto mb-2 text-white/40 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-sm text-white/60">Upload cover</p>
                    </div>
                  </label>
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Track Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Track"
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                  "transition-all duration-300"
                )}
                disabled={uploading}
              />
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/40",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50",
                  "transition-all duration-300 min-h-24 resize-none"
                )}
                disabled={uploading}
              />
            </motion.div>

            {/* Tags */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/40",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                    "transition-all duration-300"
                  )}
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={cn(
                    "px-6 py-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
                    "transition-all duration-300 font-medium"
                  )}
                  disabled={uploading}
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-sm text-indigo-400"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Audio File */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Audio File (MP3, WAV, etc.) *
              </label>
              {audioFile ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Music size={24} className="text-indigo-400" />
                    <div>
                      <p className="text-white font-medium">{audioFile.name}</p>
                      <p className="text-white/50 text-sm">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview('');
                    }}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              ) : (
                <label className="flex items-center justify-center w-full p-8 rounded-xl border-2 border-dashed border-white/[0.2] hover:border-rose-500/50 cursor-pointer transition-all duration-300 bg-white/[0.03] group">
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={handleAudioChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="text-center pointer-events-none">
                    <Cloud size={48} className="mx-auto mb-3 text-white/40 group-hover:text-rose-400 transition-colors" />
                    <p className="text-white/80 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-white/50 text-sm">
                      MP3, WAV, or other audio format (max 100MB)
                    </p>
                  </div>
                </label>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={uploading}
              className={cn(
                "w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 mt-8",
                uploading
                  ? "bg-white/[0.1] text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
              )}
            >
              {uploading ? 'Uploading...' : 'Upload Track'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
