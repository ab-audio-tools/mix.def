# mix.def - Modern Audio Sharing Platform

A modern, full-stack web application for music producers and sound designers to share their work, build their portfolio, and connect with other creators.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-2.43-3ECF8E?logo=supabase)

## Features

### Core Features
- **User Authentication**: Sign up, login, and logout with email/password
- **User Profiles**: Customizable profiles with avatar, bio, and social links
- **Audio Upload**: Upload MP3, WAV, and other audio formats with cover images
- **Audio Player**: Full-featured player with waveform visualization
- **Social Features**:
  - Like and unlike tracks
  - Comment on tracks
  - Follow/unfollow users
  - Share tracks
- **Discovery**: 
  - Browse and explore all tracks
  - Search tracks by title and description
  - Filter by tags
- **Dashboard**: Personal dashboard showing uploaded tracks and stats

### Additional Features
- **Waveform Visualization**: Interactive waveform with wavesurfer.js
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Dark Mode**: Modern dark theme optimized for audio platforms
- **Cloud Storage**: Audio and image files stored in Supabase Storage
- **Real-time Updates**: Live user activity and notifications

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: React Icons
- **Audio Visualization**: wavesurfer.js
- **Notifications**: React Hot Toast
- **Date Utilities**: date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage

### Infrastructure
- **Deployment**: Vercel (recommended) or any Node.js hosting
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage or AWS S3

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- A Supabase account (https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mix.def.git
   cd mix.def
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Supabase**
   - Create a new project on https://supabase.com
   - Get your project URL and API keys from project settings
   - Add them to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Set up Supabase Database**
   Create the following tables in your Supabase database:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email VARCHAR NOT NULL,
     username VARCHAR UNIQUE NOT NULL,
     avatar_url TEXT,
     bio TEXT,
     website TEXT,
     twitter VARCHAR,
     instagram VARCHAR,
     soundcloud VARCHAR,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Tracks table
   CREATE TABLE tracks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR NOT NULL,
     description TEXT,
     duration INTEGER,
     file_url TEXT NOT NULL,
     cover_url TEXT,
     tags TEXT[] DEFAULT '{}',
     plays_count INTEGER DEFAULT 0,
     likes_count INTEGER DEFAULT 0,
     comments_count INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Likes table
   CREATE TABLE likes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, track_id)
   );

   -- Comments table
   CREATE TABLE comments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Follows table
   CREATE TABLE follows (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(follower_id, following_id)
   );

   -- Playlists table
   CREATE TABLE playlists (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR NOT NULL,
     description TEXT,
     cover_url TEXT,
     is_public BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Playlist tracks table
   CREATE TABLE playlist_tracks (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
     track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

6. **Set up Supabase Storage**
   Create the following storage buckets:
   - `audio-files` (for audio uploads)
   - `cover-images` (for track covers)
   - `avatars` (for user avatars)

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to http://localhost:3000

## Project Structure

```
mix.def/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   │   ├── signin/          # Sign in page
│   │   └── signup/          # Sign up page
│   ├── api/                 # API routes
│   ├── explore/             # Tracks exploration page
│   ├── upload/              # Track upload page
│   ├── profile/             # User profile pages
│   ├── track/               # Track detail page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── AuthProvider.tsx     # Auth context provider
│   ├── Navbar.tsx           # Navigation bar
│   ├── Footer.tsx           # Footer
│   ├── TrackCard.tsx        # Track card component
│   └── AudioPlayer.tsx      # Audio player with waveform
├── lib/                     # Utility functions
│   ├── supabase.ts          # Supabase client
│   ├── database.ts          # Database operations
│   ├── auth.ts              # Auth store (Zustand)
├── types/                   # TypeScript type definitions
│   └── index.ts             # Type definitions
├── styles/                  # Additional styles
├── public/                  # Static assets
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
└── package.json             # Dependencies
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/user` - Get current user

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/[id]` - Get track details
- `POST /api/tracks` - Upload new track
- `PUT /api/tracks/[id]` - Update track
- `DELETE /api/tracks/[id]` - Delete track

### Search & Filter
- `GET /api/tracks/search?q=query` - Search tracks
- `GET /api/tracks/tags?tags=tag1,tag2` - Filter by tags

### Social Features
- `POST /api/likes` - Like a track
- `DELETE /api/likes/[id]` - Unlike a track
- `POST /api/comments` - Add comment
- `POST /api/follow` - Follow user
- `DELETE /api/follow/[id]` - Unfollow user

## Usage

### Sign Up
1. Click "Sign Up" on the home page
2. Enter email, username, and password
3. Verify your email
4. Complete your profile

### Upload a Track
1. Sign in to your account
2. Click "Upload" in the navigation
3. Upload your audio file (MP3, WAV, etc.)
4. Add cover image (optional)
5. Add title, description, and tags
6. Click "Upload Track"

### Explore Tracks
1. Click "Explore" in the navigation
2. Browse all tracks or use search/filters
3. Click on a track to play it
4. Like, comment, or share tracks

### Follow Users
1. Visit a user's profile
2. Click "Follow" button
3. Track their new uploads

## Environment Variables

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=mix.def
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

## Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Type checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Deployment

### ⚠️ SECURITY WARNING

**NEVER commit your `.env.local` file to GitHub!** This file contains sensitive credentials that could compromise your application.

The `.gitignore` file is already configured to prevent this, but always verify:
- `.env.local` is listed in `.gitignore` ✓
- `.env.*.local` is listed in `.gitignore` ✓
- Never add secret keys to `.env.example` (only public variables and placeholder values)

To check if any `.env` files are tracked:
```bash
git status
```

If accidentally committed:
```bash
git rm --cached .env.local
git commit -m "Remove .env.local"
git push
# Then rotate all keys in Supabase dashboard!
```

### Deploy to Vercel (Recommended)

1. **Prepare your repository**
   ```bash
   # Ensure .env.local is in .gitignore (already configured)
   git status  # Verify .env.local is NOT listed
   
   # Make initial commit
   git add .
   git commit -m "Initial commit: mix.def audio sharing platform"
   ```

2. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Sign in to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Add environment variables in "Environment Variables":
     ```
     NEXT_PUBLIC_SUPABASE_URL = your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
     SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
     NEXT_PUBLIC_APP_NAME = mix.def
     NEXT_PUBLIC_MAX_FILE_SIZE = 104857600
     ```
   - Click "Deploy"
   - Wait for deployment to complete

4. **Post-Deployment**
   - Update Supabase CORS settings to allow your Vercel domain
   - Test auth flow and file uploads on production

### Deploy to Other Platforms

This is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- DigitalOcean App Platform
- Or any Node.js hosting

### First Commit Checklist

Before pushing to GitHub for the first time, verify:

- [ ] `.env.local` is **NOT** in git staging area (`git status`)
- [ ] `.gitignore` contains all environment file patterns
- [ ] Build passes locally (`npm run build`)
- [ ] No `console.log()` statements in production code (review)
- [ ] All API keys are rotated if previously exposed
- [ ] `.env.example` contains only placeholder values
- [ ] `package-lock.json` or `yarn.lock` is included
- [ ] `next.config.js` and `tsconfig.json` are configured correctly
- [ ] `.vercelignore` is configured for Vercel deployments

**Quick validation:**
```bash
# Verify no secrets are staged
git diff --cached | grep -E "SUPABASE_|JWT_|SECRET" || echo "✓ No secrets found"

# Verify build succeeds
npm run build

# Check git status
git status
```

## Best Practices

1. **Performance**
   - Use Next.js Image component for image optimization (future)
   - Implement pagination for track lists
   - Use React.lazy for code splitting

2. **Security**
   - Never commit `.env.local` file
   - Validate all user inputs on backend
   - Use Supabase Row Level Security (RLS) policies
   - Sanitize user-generated content

3. **Database**
   - Use database indexes for frequently queried columns
   - Implement proper foreign key constraints
   - Set up backups regularly

4. **Storage**
   - Validate file types and sizes
   - Generate unique filenames
   - Clean up unused files

## Future Enhancements

- [ ] Playlist creation and management
- [ ] Audio waveform editing
- [ ] Notifications system
- [ ] Direct messaging between users
- [ ] Advanced analytics
- [ ] Collaboration features
- [ ] API for third-party apps
- [ ] Mobile app (React Native)
- [ ] Live streaming
- [ ] Audio effects and processing

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email hello@mix.def.io or open an issue on GitHub.

## Acknowledgments

- Inspired by SoundCloud, BeatStars, and other music platforms
- Built with Next.js, React, and Tailwind CSS
- Audio visualization powered by wavesurfer.js
- Backend and auth powered by Supabase

## Roadmap

- Q2 2024: Beta launch with core features
- Q3 2024: Notification system and playlists
- Q4 2024: Advanced analytics and monetization
- 2025: Mobile apps and expanded features

---

**Happy music sharing! 🎵**
