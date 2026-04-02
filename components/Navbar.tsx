'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiSearch, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg"></div>
            <span className="hidden sm:inline">mix.def</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full input-field pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500" />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/explore"
              className="text-dark-300 hover:text-dark-50 transition-colors flex items-center gap-1"
            >
              <FiHome size={18} />
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-dark-300 hover:text-dark-50 transition-colors flex items-center gap-1"
                >
                  <FiHome size={18} />
                  I Miei File
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center hover:ring-2 hover:ring-primary-500"
                  title="Profile"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FiUser size={20} />
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-dark-300 hover:text-dark-50 transition-colors"
                  title="Sign out"
                >
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 text-dark-50 hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded-lg transition-colors font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-dark-50"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-dark-800 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full input-field pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500" />
              </div>
            </form>

            <div className="space-y-2">
              <Link
                href="/explore"
                className="block px-4 py-2 text-dark-300 hover:text-dark-50 hover:bg-dark-900 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Explore
              </Link>

              {user ? (
                <>
                  <Link
                    href="/upload"
                    className="block px-4 py-2 text-dark-300 hover:text-dark-50 hover:bg-dark-900 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Upload
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    className="block px-4 py-2 text-dark-300 hover:text-dark-50 hover:bg-dark-900 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-dark-900 rounded transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-4 py-2 text-dark-300 hover:text-dark-50 hover:bg-dark-900 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-dark-50 rounded transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
