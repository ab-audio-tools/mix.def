'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Menu, X, LogOut, User, Home, Search, LayoutDashboard, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isExplore = pathname === '/explore';
  const isDashboard = pathname === '/dashboard';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
      setIsOpen(false);
      setIsProfileMenuOpen(false);
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.1] backdrop-blur-xl bg-[#030303]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group transition-all duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-shadow duration-300" />
            <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 group-hover:from-indigo-300 group-hover:to-rose-300 transition-all duration-300">
              mix.def
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    "w-full rounded-lg px-4 py-2 pl-10 text-white/90 placeholder-white/40 bg-white/[0.05] border border-white/[0.1] transition-all duration-300",
                    searchFocused ? 'ring-2 ring-indigo-500/50 border-indigo-500/50 bg-white/[0.08]' : ''
                  )}
                />
                <Search className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 w-4 h-4",
                  searchFocused ? 'text-indigo-400' : 'text-white/40'
                )} />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className={cn(
                "flex items-center gap-1.5 transition-all duration-300 text-sm font-medium",
                isExplore 
                  ? 'text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-lg' 
                  : 'text-white/60 hover:text-white'
              )}
            >
              <Home size={18} />
              <span>Explore</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-1.5 transition-all duration-300 text-sm font-medium",
                    isDashboard 
                      ? 'text-indigo-400 bg-indigo-500/10 px-3 py-2 rounded-lg' 
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>

                {/* Avatar with Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-[#030303] transition-all duration-300 hover:-translate-y-1"
                    title="Profile"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-white/[0.08] border border-white/[0.15] backdrop-blur-xl shadow-xl overflow-hidden z-50"
                    >
                      <Link
                        href={`/profile/${user.id}`}
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.1] transition-all duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.1] transition-all duration-200 border-t border-white/[0.1]"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <Settings size={16} />
                          <span>Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200 border-t border-white/[0.1]"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut size={16} />
                          <span>Logout</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-white/70 hover:text-white font-semibold transition-colors duration-300 border border-white/[0.2] rounded-lg hover:border-white/[0.3]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors duration-300"
          >
            {isOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-white/[0.1] py-4 space-y-4 bg-gradient-to-b from-[#030303]/50 to-[#030303] backdrop-blur-md"
          >
            <form onSubmit={handleSearch} className="px-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg px-4 py-2 pl-10 text-white/90 placeholder-white/40 bg-white/[0.05] border border-white/[0.1]"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              </div>
            </form>

            <div className="space-y-1 px-4">
              <Link
                href="/explore"
                className={cn(
                  "block px-4 py-3 rounded-lg transition-all duration-300",
                  isExplore
                    ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                )}
                onClick={() => setIsOpen(false)}
              >
                Explore
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300",
                      isDashboard
                        ? 'bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/signin"
                    className="block px-4 py-3 rounded-lg border border-white/[0.2] text-white/70 hover:text-white text-center font-semibold transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold transition-all duration-300 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
