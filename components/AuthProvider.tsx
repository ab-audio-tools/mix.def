'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = useAuthStore((state) => state.initialize);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize, setUser]);

  return <>{children}</>;
}
