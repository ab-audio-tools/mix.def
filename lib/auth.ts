import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();

          if (authUser) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single();

            set({ user: userData, loading: false, initialized: true });
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ loading: false, initialized: true });
        }
      },

      signUp: async (email, password, username) => {
        set({ loading: true });
        try {
          // Call our API route which uses service role key
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Signup failed');
          }

          const { user } = await response.json();
          set({ user, loading: false });
        } catch (error) {
          console.error('Signup error:', error);
          set({ loading: false });
          throw error;
        }
      },

      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({ user: userData, loading: false });
          }
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
