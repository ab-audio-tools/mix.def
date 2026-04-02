'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { uploadAudioFile, uploadCoverImage } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { FiUploadCloud, FiX, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-400 mb-4">You need to be signed in to upload</p>
          <Link
            href="/signin"
            className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors"
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
      // Upload audio file
      const audioResult = await uploadAudioFile(audioFile, user.id);
      if (!audioResult.success) {
        throw new Error('Failed to upload audio file');
      }

      // Upload cover image if provided
      let coverUrl: string | null = null;
      if (coverFile) {
        const coverResult = await uploadCoverImage(coverFile, user.id);
        if (coverResult.success) {
          coverUrl = coverResult.url;
        }
      }

      // Calculate duration (rough estimate from file size and bitrate)
      // In a real app, you'd want to actually calculate this from the audio file
      const estimatedDuration = Math.round(audioFile.size / (128000 / 8)); // Assuming 128kbps

      // Create track record in database
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
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href={`/profile/${user.id}`}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-8 transition-colors"
        >
          <FiArrowLeft size={20} />
          Back to profile
        </Link>

        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-8">Upload Your Track</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Cover Image (Optional)
              </label>
              <div className="relative w-full max-w-xs">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-dark-950/80 rounded hover:bg-dark-900 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-dark-700 hover:border-primary-500 cursor-pointer transition-colors bg-dark-900/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <FiUploadCloud size={32} className="mx-auto mb-2 text-dark-500" />
                      <p className="text-sm text-dark-400">Upload cover</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Track Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Track"
                className="w-full input-field"
                disabled={uploading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
                className="w-full input-field min-h-24 resize-none"
                disabled={uploading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
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
                  className="flex-1 input-field"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 bg-primary-600/20 border border-primary-600/50 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audio File */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Audio File (MP3, WAV, etc.) *
              </label>
              {audioFile ? (
                <div className="flex items-center justify-between p-4 bg-dark-900 border border-primary-600/50 rounded-lg">
                  <div>
                    <p className="text-dark-50 font-medium">{audioFile.name}</p>
                    <p className="text-dark-400 text-sm">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview('');
                    }}
                    className="p-2 text-dark-400 hover:text-dark-50 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full p-8 rounded-lg border-2 border-dashed border-dark-700 hover:border-primary-500 cursor-pointer transition-colors bg-dark-900/50">
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={handleAudioChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="text-center">
                    <FiUploadCloud size={40} className="mx-auto mb-3 text-dark-500" />
                    <p className="text-dark-50 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-dark-400 text-sm">
                      MP3, WAV, or other audio format (max 100MB)
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-dark-50 font-semibold rounded-lg transition-colors mt-8"
            >
              {uploading ? 'Uploading...' : 'Upload Track'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
