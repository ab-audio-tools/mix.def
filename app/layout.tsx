import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/glass.css';
import '../styles/animations.css';
import '../styles/theme.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'mix.def - Share Your Sound',
  description:
    'mix.def is a modern audio sharing and portfolio platform for music producers and sound designers.',
  keywords: [
    'audio',
    'music production',
    'sound design',
    'portfolio',
    'producer',
  ],
  authors: [{ name: 'mix.def Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
