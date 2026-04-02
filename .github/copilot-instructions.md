# mix.def - Project Guidelines

## Project Overview
mix.def is a modern full-stack audio sharing platform for music producers and sound designers. Built with Next.js, React, Tailwind CSS, and Supabase.

## Codebase Overview

### Frontend Architecture
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: Zustand for auth state
- **UI Components**: Custom components with React Icons

### Backend Architecture
- **Runtime**: Node.js / Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for files

### Key Features to Maintain
1. User authentication and profiles
2. Audio track uploads with metadata
3. Waveform visualization for playback
4. Social features (likes, comments, follows)
5. Track discovery with search/filters
6. Responsive dark-themed UI

## Code Organization

- `/app` - Next.js pages and routes
- `/components` - Reusable React components
- `/lib` - Utilities, database operations, auth store
- `/types` - TypeScript type definitions
- `/styles` - Global CSS styles
- `/public` - Static assets

## Development Guidelines

### Component Development
- Create reusable, functional components
- Use TypeScript for type safety
- Keep components in `/components` directory
- Use Tailwind classes for styling
- Follow the existing dark theme color palette

### Database Operations
- All database queries in `/lib/database.ts`
- Use Supabase client from `/lib/supabase.ts`
- Always handle errors gracefully
- Return consistent data structures

### Authentication
- Auth state managed in `/lib/auth.ts` using Zustand
- Use `useAuthStore()` hook in components
- Protect routes by checking `user` state
- Implement proper loading states

### Styling
- Use Tailwind CSS exclusively
- Color palette: dark-950 to dark-50, primary-500, accent-500
- Responsive design: mobile-first approach
- Custom styles in `/app/globals.css`

## Setup Instructions

### First Time Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Add Supabase credentials to `.env.local`
4. Create required database tables (see README.md)
5. Create storage buckets in Supabase

### Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Production: `npm start`

## Common Tasks

### Adding a New Page
1. Create directory in `/app`
2. Create `page.tsx` with content
3. Export default React component
4. Access via `/your-path` route

### Adding a New Component
1. Create `.tsx` file in `/components`
2. Export functional component
3. Add 'use client' if using hooks
4. Import and use in pages

### Adding a Database Operation
1. Add function to `/lib/database.ts`
2. Use `supabase` client
3. Handle errors with try/catch
4. Return typed data

### Styling
- Use Tailwind classes (no CSS modules or inline styles)
- Follow the dark theme (dark-950 backgrounds, dark-50 text)
- Ensure mobile responsiveness
- Use custom CSS in globals.css for animations only

## Important Notes

### Security
- Never commit `.env.local`
- Validate all user inputs
- Use Supabase Row Level Security
- Handle errors without exposing sensitive info

### Performance
- Use React.lazy for code splitting
- Optimize images (use Supabase Storage)
- Implement pagination for lists
- Cache API responses appropriately

### Database
- Keep migrations documented
- Use proper indexes
- Set up cascading deletes
- Regular backups for production

## Troubleshooting

### Common Issues
- **Auth not persisting**: Check localStorage in `.env.local`
- **File uploads failing**: Verify Supabase storage buckets exist
- **Waveform not showing**: Check audio file format compatibility
- **Styling issues**: Ensure Tailwind CSS is built correctly

## Future Development

Priority areas for enhancement:
1. Playlist system
2. Notification system
3. Advanced search/filtering
4. User analytics
5. Monetization features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [wavesurfer.js Documentation](https://wavesurfer.xyz)

## Getting Help

For questions or issues:
1. Check the README.md for general info
2. Review existing code patterns
3. Check documentation links above
4. Create an issue with detailed description
