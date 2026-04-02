# File Structure Guide

## Overview
This guide explains the purpose of each folder and file in the mix.def project.

```
mix.def/
├── .github/
│   └── copilot-instructions.md    # GitHub Copilot guidelines
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Authentication routes (grouped)
│   │   ├── layout.tsx              # Auth layout (gradient background)
│   │   ├── signin/page.tsx         # Sign in page
│   │   └── signup/page.tsx         # Sign up page
│   ├── api/                        # API routes
│   │   ├── tracks/route.ts         # Track API endpoints
│   │   └── comments/route.ts       # Comment API endpoints
│   ├── explore/                    # Track exploration page
│   │   └── page.tsx         # Browse & filter tracks
│   ├── profile/                    # User profile pages
│   │   └── [id]/page.tsx           # Profile for user ID
│   ├── track/                      # Track detail page
│   │   └── [id]/page.tsx           # Individual track page
│   ├── upload/                     # Track upload page
│   │   └── page.tsx                # Upload form
│   ├── layout.tsx                  # Root layout (navbar, footer)
│   ├── page.tsx                    # Home page
│   ├── globals.css                 # Global styles
│   ├── favicon.ico                 # Browser tab icon
│   └── ...                         # Next.js system files
├── components/                     # Reusable React components
│   ├── Navbar.tsx                  # Navigation bar
│   ├── Footer.tsx                  # Footer
│   ├── AuthProvider.tsx            # Auth context wrapper
│   ├── TrackCard.tsx               # Track card component
│   └── AudioPlayer.tsx             # Audio player with waveform
├── lib/                            # Utility functions & logic
│   ├── supabase.ts                 # Supabase client
│   ├── database.ts                 # Database operations
│   ├── auth.ts                     # Auth store (Zustand)
│   └── utils.ts                    # Helper functions
├── types/                          # TypeScript type definitions
│   └── index.ts                    # All type definitions
├── public/                         # Static files
│   ├── favicon.ico                 # Favicon
│   └── ...                         # Logos, images, etc.
├── styles/                         # Additional CSS files
│   └── (currently empty)
├── .env.local                      # Environment variables (LOCAL)
├── .env.example                    # Environment variables (TEMPLATE)
├── .gitignore                      # Files to ignore in git
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.js               # PostCSS config
├── next.config.js                  # Next.js configuration
├── README.md                       # Project documentation
├── SETUP.md                        # Setup guide
└── FILE_STRUCTURE.md               # This file

```

## Key Files Explained

### app/layout.tsx
The root layout that wraps all pages. Contains:
- `<Navbar />` component
- `<main>` section (content goes here)
- `<Footer />` component
- `<Toaster />` for notifications

### app/page.tsx
Home page with:
- Hero section
- Featured tracks grid
- Call-to-action section

### components/Navbar.tsx
Navigation bar with:
- Logo
- Search bar
- Links to Explore, Upload
- User profile/login buttons
- Mobile menu

### components/TrackCard.tsx
Reusable card component that displays:
- Cover image
- Title and artist
- Play button overlay
- Like, comment, share buttons
- Duration badge
- Tags

### components/AudioPlayer.tsx
Full-featured audio player with:
- WaveSurfer.js integration
- Play/pause controls
- Volume control
- Time display
- Waveform visualization

### lib/supabase.ts
Initializes Supabase client:
- Regular client for frontend
- Admin client for server-side operations

### lib/database.ts
Database operations for:
- User profile fetch/update
- Track CRUD operations
- Search and filtering
- Like/follow functionality
- File uploads

### lib/auth.ts
Zustand store for authentication:
- User state
- Sign up/in/out functions
- Persistent storage

## Data Flow

```
User Action
    ↓
Component (e.g., TrackCard.tsx)
    ↓
Database Function (lib/database.ts)
    ↓
Supabase Client (lib/supabase.ts)
    ↓
Supabase Backend
    ↓
Database / Storage
```

## TypeScript Types

All TypeScript interfaces are defined in `types/index.ts`:
- `User` - User profile
- `Track` - Audio track
- `Comment` - Track comment
- `Like` - Like record
- `Follow` - Follow record
- `Playlist` - Playlist collection

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_NAME` - App name for display
- `NEXT_PUBLIC_MAX_FILE_SIZE` - Max upload file size

## Adding New Features

### Add a New Page
1. Create folder in `/app`: `app/new-page/`
2. Create `page.tsx` file
3. Add your content
4. Access at `/new-page`

### Add a New Component
1. Create file in `/components`: `MyComponent.tsx`
2. Create functional component
3. Add `'use client'` if using hooks
4. Import and use in pages

### Add Database Operation
1. Create function in `lib/database.ts`
2. Use `supabase` client
3. Handle errors properly
4. Return typed data

### Add API Route
1. Create folder in `/app/api`: `app/api/my-route/`
2. Create `route.ts` file
3. Export `GET`, `POST`, etc. functions
4. Access at `/api/my-route`

## Styling

- Uses **Tailwind CSS** for all styling
- Dark theme color palette in `tailwind.config.js`
- Global styles in `app/globals.css`
- Responsive design (mobile-first)
- No CSS modules or inline styles

## Build & Deploy

```bash
npm run dev      # Local development
npm run build    # Production build
npm start        # Run production build
npm run lint     # Check code quality
```

Built with Next.js on Vercel or any Node.js hosting.

## Security Notes

- `.env.local` is NOT committed (in .gitignore)
- Use Row Level Security in Supabase
- Validate all inputs
- Never expose service role key in frontend
- Always check `user` state before operations

---

For more details, see README.md and SETUP.md
