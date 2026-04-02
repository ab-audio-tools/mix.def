'use client';

import Link from 'next/link';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg"></div>
              <span>mix.def</span>
            </div>
            <p className="text-dark-400 text-sm">
              A modern platform for music producers and sound designers to
              showcase their work and connect with creators.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>
                <Link href="/explore" className="hover:text-dark-50 transition-colors">
                  Explore Tracks
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-dark-50 transition-colors">
                  Join Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-dark-50 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>
                <Link href="/help" className="hover:text-dark-50 transition-colors">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-dark-50 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-dark-50 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="mailto:hello@mix.def.io"
                className="text-dark-400 hover:text-primary-500 transition-colors"
                aria-label="Email"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-dark-500 text-sm">
            &copy; 2024 mix.def. All rights reserved.
          </p>
          <p className="text-dark-500 text-sm mt-4 md:mt-0">
            Made with ❤️ by music creators, for music creators
          </p>
        </div>
      </div>
    </footer>
  );
}
