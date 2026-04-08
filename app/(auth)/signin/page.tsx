'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn(email, password);
      toast.success('Signed in successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.15,
      },
    }),
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.1] via-purple-500/[0.05] to-fuchsia-500/[0.1] blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back Home</span>
          </Link>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-300 to-fuchsia-300">
              Welcome Back
            </span>
          </h1>
          <p className="text-white/60 text-lg">Sign in to your mix.def account</p>
        </motion.div>

        <div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-semibold text-white mb-3">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-transparent border border-white/30 text-white placeholder-white/40 transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-white/[0.05]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-white">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-4 py-3 pr-12 rounded-xl bg-transparent border border-white/30 text-white placeholder-white/40 transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-white/[0.05]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              custom={4}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              type="submit"
              disabled={loading}
              className={cn(
                "w-full px-4 py-3 mt-8 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 text-white font-semibold transition-all duration-300",
                "hover:from-cyan-600 hover:via-purple-600 hover:to-fuchsia-600 hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-1",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p
            custom={6}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center text-white/60 text-sm mt-8"
          >
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
