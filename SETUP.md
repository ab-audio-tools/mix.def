# mix.def Setup Guide

This guide will walk you through setting up mix.def on your local machine.

## Prerequisites

Before you begin, make sure you have:
- Node.js 16.x or higher
- npm or yarn
- A Supabase account (free tier is fine)
- A code editor (VS Code recommended)

## Step 1: Clone or Download the Project

```bash
# If you have the project folder, navigate to it
cd /path/to/mix.def
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Tailwind CSS
- Supabase
- And more...

## Step 3: Set Up Supabase

### Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - Project Name: mix.def
   - Database Password: Choose a strong password
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### Get Your Credentials

1. Go to Project Settings (bottom left)
2. Click "API" in the sidebar
3. Copy these values:
   - **Project URL** - This is your NEXT_PUBLIC_SUPABASE_URL
   - **anon public key** - This is your NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service role key** - This is your SUPABASE_SERVICE_ROLE_KEY

### Configure Environment Variables

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Create Database Tables

1. In your Supabase project, go to "SQL Editor"
2. Create a new query (click "New query")
3. Copy and paste the following SQL:

```sql
-- Create users table
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

-- Create tracks table
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

-- Create likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create playlists table
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

-- Create playlist_tracks table
CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_track_id ON likes(track_id);
CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

4. Click "Run" to execute the SQL
5. You should see "Success" message and the tables will be created

## Step 5: Create Storage Buckets

1. In your Supabase project, go to "Storage"
2. Create three new buckets:

   **Bucket 1: audio-files**
   - Name: audio-files
   - Visibility: Private
   - Click "Create bucket"

   **Bucket 2: cover-images**
   - Name: cover-images
   - Visibility: Private
   - Click "Create bucket"

   **Bucket 3: avatars**
   - Name: avatars
   - Visibility: Private
   - Click "Create bucket"

## Step 6: Set Up Authentication

1. In your Supabase project, go to "Authentication"
2. Click "Providers"
3. Make sure "Email" is enabled (it should be by default)
4. Go to "URL Configuration"
5. Add your local development URL:
   - Site URL: `http://localhost:3000`

## Step 7: Run the Development Server

```bash
npm run dev
```

You should see:
```
> mix.def@1.0.0 dev
> next dev

  ▲ Next.js 15.5.14
  - Local:        http://localhost:3000
```

## Step 8: Open in Browser

Open http://localhost:3000 in your web browser. You should see the mix.def home page!

## Test the App

1. **Sign Up**: Click "Sign Up" and create an account
2. **Upload a Track**: Use a test audio file (download one if needed)
3. **Explore**: Browse the tracks
4. **Profile**: Visit your profile page

## Troubleshooting

### "supabaseUrl is required" error
- Make sure you've added the environment variables correctly in `.env.local`
- The variables must start with `NEXT_PUBLIC_` to be available in the browser
- Restart the development server after changing `.env.local`

### "Table does not exist" error
- Make sure you ran all the SQL queries to create the tables
- Verify tables exist in your Supabase "Table Editor"

### Audio upload not working
- Verify storage buckets are created
- Check bucket permissions (should be private)
- Ensure file size is under 100MB

### Auth not working
- Make sure "Email" provider is enabled in Authentication > Providers
- Check URL Configuration has correct site URL

### Styling issues
- Make sure Tailwind CSS is built correctly
- Try `npm run build` to rebuild
- Clear browser cache (Ctrl+Shift+Del)

## Next Steps

1. Customize the app with your branding
2. Add more features (playlists, notifications, etc.)
3. Deploy to Vercel or your hosting provider
4. Add more users and test with real data

## Need Help?

- Check README.md for more information
- Review the code examples in the components folder
- Visit Supabase docs: https://supabase.com/docs
- Visit Next.js docs: https://nextjs.org/docs

---

Happy music sharing! 🎵
