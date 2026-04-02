# Development Guide

Quick reference for developing with mix.def.

## Getting Started

```bash
# Install dependencies
npm install

# Configure .env.local with Supabase credentials

# Run development server
npm run dev
```

Visit http://localhost:3000

## Project Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Code Style

### Components
```typescript
'use client';  // Add if component uses hooks

import { useState } from 'react';
import Link from 'next/link';

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: ComponentProps) {
  const [state, setState] = useState('');

  return (
    <div className="p-4 bg-dark-900 rounded-lg">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
```

### Database Operations
```typescript
async function getUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

## Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserProfile()`)
- **Constants**: UPPER_CASE (`MAX_FILE_SIZE`)
- **Variables**: camelCase (`userName`)
- **CSS Classes**: kebab-case (`py-4 bg-dark-900`)

## Color Palette

Dark theme colors defined in `tailwind.config.js`:

```
Dark backgrounds:   dark-950, dark-900, dark-850, dark-800
Light text:         dark-50, dark-100, dark-200, dark-300
Primary accent:     primary-500, primary-600, primary-700
Secondary accent:   accent-500, accent-600
```

## Common Patterns

### Protected Route
```typescript
export default function ProtectedPage() {
  const { user, initialized } = useAuthStore();

  if (!initialized) return <Loading />;
  if (!user) return <Redirect to="/auth/signin" />;

  return <PageContent />;
}
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Do something
    toast.success('Success!');
  } catch (error) {
    toast.error('Error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Database Query
```typescript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDatabaseData();
      setData(data);
    } catch (error) {
      toast.error('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [dependency]);
```

## API Routes

Routes are in `app/api/` and follow Next.js conventions:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Handle GET request
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Handle POST request
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

## Using Hooks

### useAuthStore
```typescript
import { useAuthStore } from '@/lib/auth';

const { user, loading, signIn, signOut } = useAuthStore();

if (loading) return <Spinner />;
if (!user) return <LoginPrompt />;
```

### useRouter & useParams
```typescript
import { useRouter, useParams } from 'next/navigation';

const router = useRouter();
const params = useParams();
const id = params.id as string;

router.push('/path');
router.back();
```

## Tailwind Classes

Commonly used classes:

```
Layout:     flex, grid, block, hidden
Spacing:    p-4, m-2, gap-3
Text:       text-lg, font-bold, text-center
Colors:     bg-dark-900, text-dark-50
Borders:    border, border-dark-800
Rounded:    rounded, rounded-lg, rounded-full
Hover:      hover:bg-dark-700, hover:text-primary-400
Responsive: md:flex, lg:grid
```

## Testing Locally

### Sign Up & Sign In
1. Use a test email (e.g., test@example.com)
2. Password must be at least 6 characters
3. Check email for verification link (usually instant with Supabase)

### Upload Audio
- Use .mp3 or .wav files
- Max 100MB in size
- Test with library music (royalty-free)

### Test Features
- Upload track
- View on Explore page
- Like/unlike track
- Add comment (if implemented)
- Follow/unfollow users
- View profile

## Debugging

### Enable Console Logs
All database errors are logged to console:
```
console.error('Error:', error)
```

### Check Supabase Realtime
Open Supabase Dashboard > Table Editor to see live updates

### React DevTools
Install "React Developer Tools" browser extension

### Next.js DevTools
Server errors appear in terminal, frontend errors in browser console

## Performance Tips

1. **Lazy Load Components**
   ```typescript
   const HeavyComponent = dynamic(() => import('./Heavy'), {
     loading: () => <Spinner />,
   });
   ```

2. **Memoize Components**
   ```typescript
   const Card = React.memo(({ data }) => <div>{data}</div>);
   ```

3. **Use useCallback**
   ```typescript
   const handleClick = useCallback(() => {
     // expensive operation
   }, [dependencies]);
   ```

4. **Image Optimization**
   Use `<Image />` from next/image instead of `<img />`

## Common Issues

### "Hydration mismatch"
- Make sure client code matches server rendering
- Avoid using different data on client vs server

### "Cannot read property of undefined"
- Check that data is loaded before accessing properties
- Use optional chaining: `data?.property`

### "Styling not applying"
- Rebuild CSS: `npm run build`
- Check Tailwind config
- Clear browser cache

### "Auth not persisting"
- Check localStorage is enabled
- Verify .env.local has correct credentials
- Restart dev server after env changes

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## Git Workflow

```bash
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
# Open pull request
```

Never commit:
- `.env.local`
- `.next/` build folder
- `node_modules/`
- `.DS_Store`

---

Happy coding! 🚀
