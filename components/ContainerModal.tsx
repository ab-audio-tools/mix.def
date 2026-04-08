'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  initialName?: string;
  initialDescription?: string;
  title?: string;
  submitText?: string;
}

export default function ContainerModal({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  initialDescription = '',
  title = 'New Container',
  submitText = 'Create',
}: ContainerModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSubmit({ name, description });
      setName('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.15] backdrop-blur-xl rounded-2xl p-8 shadow-2xl w-full max-w-md">
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={loading}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/[0.1] rounded-lg transition-all duration-300"
              >
                <X size={20} />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Container Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Rock Vocals"
                    disabled={loading}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.15] text-white placeholder-white/40 transition-all duration-300",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.08]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    disabled={loading}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.15] text-white placeholder-white/40 transition-all duration-300 resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white/[0.08]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-lg border border-white/[0.2] text-white font-semibold transition-all duration-300",
                      "hover:border-white/[0.4] hover:bg-white/[0.05]",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold transition-all duration-300",
                      "hover:from-indigo-600 hover:to-rose-600 hover:shadow-lg hover:shadow-indigo-500/30",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {loading ? 'Saving...' : submitText}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
