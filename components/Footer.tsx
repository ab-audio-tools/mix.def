'use client';

import Link from 'next/link';
import { Code, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#030303] border-t border-white/[0.1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                mix.def
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A modern platform for music producers and sound designers to
              showcase their work and connect with creators worldwide.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <Link href="/explore" className="hover:text-indigo-400 transition-colors duration-300">
                  Explore Tracks
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-indigo-400 transition-colors duration-300">
                  Join Community
                </Link>
              </li>
              <li>
                <Link href="/upload" className="hover:text-indigo-400 transition-colors duration-300">
                  Upload Music
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <Link href="/help" className="hover:text-indigo-400 transition-colors duration-300">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/[0.05] hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center hover:scale-110"
                aria-label="Twitter"
              >
                <ExternalLink size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-all duration-300 flex items-center justify-center hover:scale-110"
                aria-label="Instagram"
              >
                <ExternalLink size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/[0.05] hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center hover:scale-110"
                aria-label="GitHub"
              >
                <Code size={18} />
              </a>
              <a
                href="mailto:hello@mix.def.io"
                className="w-10 h-10 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-all duration-300 flex items-center justify-center hover:scale-110"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.1] pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            &copy; 2024 mix.def. All rights reserved.
          </p>
          <p className="text-white/40 text-sm mt-4 md:mt-0">
            Made with ❤️ by music creators, for music creators
          </p>
        </div>
      </div>
    </footer>
  );
}
