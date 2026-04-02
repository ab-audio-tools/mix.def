export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  soundcloud?: string;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration: number;
  file_url: string;
  cover_url?: string;
  tags: string[];
  plays_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  is_liked?: boolean;
  is_added_to_playlist?: boolean;
}

export interface Comment {
  id: string;
  track_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  tracks_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tracks?: Track[];
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  track_id: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
