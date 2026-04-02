'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-50 mb-8 transition-colors"
      >
        <FiArrowLeft size={20} />
        Back to home
      </Link>

      <div className="card p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-dark-400 mb-8">
          Sign in to your mix.def account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-field"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-dark-300">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
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
                className="w-full input-field pr-10"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-500 hover:text-dark-300"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-dark-50 font-semibold rounded-lg transition-colors mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-dark-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary-500 hover:text-primary-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
