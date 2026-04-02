import { supabase } from './supabase';
import { Track, User, Playlist } from '@/types';

// User functions
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  try {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
}

// Track functions
export async function getTracks(limit = 20, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('tracks')
      .select('*, user:user_id(id, username, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { tracks: data || [], total: count || 0 };
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return { tracks: [], total: 0 };
  }
}

export async function getTrackById(trackId: string) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, user:user_id(*), comments(*, user:user_id(id, username, avatar_url))')
      .eq('id', trackId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching track:', error);
    return null;
  }
}

export async function getUserTracks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user tracks:', error);
    return [];
  }
}

export async function searchTracks(query: string) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, user:user_id(id, username, avatar_url)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

export async function getTracksByTags(tags: string[]) {
  try {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, user:user_id(id, username, avatar_url)')
      .contains('tags', tags)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tracks by tags:', error);
    return [];
  }
}

// Like functions
export async function toggleLike(userId: string, trackId: string) {
  try {
    const { data: existingLike, error: fetchError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('track_id', trackId);

      if (error) throw error;
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase.from('likes').insert({
        user_id: userId,
        track_id: trackId,
      });

      if (error && error.code !== 'PGRST116') throw error; // Ignore unique constraint errors from checking
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return null;
  }
}

// Follow functions
export async function toggleFollow(followerUserId: string, followingUserId: string) {
  try {
    const { data: existingFollow, error: fetchError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerUserId)
      .eq('following_id', followingUserId)
      .single();

    if (existingFollow) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerUserId)
        .eq('following_id', followingUserId);

      if (error) throw error;
      return { following: false };
    } else {
      // Follow
      const { error } = await supabase.from('follows').insert({
        follower_id: followerUserId,
        following_id: followingUserId,
      });

      if (error && error.code !== 'PGRST116') throw error;
      return { following: true };
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    return null;
  }
}

// Upload functions
export async function uploadAudioFile(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading audio file:', error);
    return { success: false, error };
  }
}

export async function uploadCoverImage(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('cover-images')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('cover-images')
      .getPublicUrl(fileName);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading cover image:', error);
    return { success: false, error };
  }
}

export async function uploadAvatar(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error };
  }
}

// Container functions
export async function createContainer(userId: string, name: string, description: string = '') {
  try {
    console.log('[DB] 💾 Inserting container into Supabase');
    console.log('[DB] ├─ User ID:', userId);
    console.log('[DB] ├─ Name:', name);
    console.log('[DB] └─ Description:', description);

    const { data, error } = await supabase
      .from('containers')
      .insert({
        user_id: userId,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      console.log('[DB] ❌ Supabase Error:', error.message);
      console.log('[DB] ├─ Error Code:', error.code);
      console.log('[DB] ├─ Hint:', error.hint);
      console.log('[DB] └─ Details:', error.details);
      throw error;
    }

    console.log('[DB] ✅ Container created successfully');
    console.log('[DB] ├─ ID:', data?.id);
    console.log('[DB] ├─ Created at:', data?.created_at);
    console.log('[DB] └─ Full Data:', data);
    return { success: true, container: data };
  } catch (error) {
    console.error('[DB] 🔴 Error creating container:', error);
    return { success: false, error };
  }
}

export async function getContainers(userId: string) {
  try {
    console.log('[DB] 🔍 Querying containers for user:', userId);
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('[DB] ❌ Query Error:', error.message);
      throw error;
    }

    console.log('[DB] ✅ Found', data?.length || 0, 'containers');
    return { containers: data || [] };
  } catch (error) {
    console.error('[DB] 🔴 Error fetching containers:', error);
    return { containers: [] };
  }
}

export async function getContainerById(containerId: string) {
  try {
    const { data, error } = await supabase
      .from('containers')
      .select('*')
      .eq('id', containerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching container:', error);
    return null;
  }
}

export async function updateContainer(containerId: string, updates: { name?: string; description?: string }) {
  try {
    const { error } = await supabase
      .from('containers')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', containerId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating container:', error);
    return { success: false, error };
  }
}

export async function deleteContainer(containerId: string) {
  try {
    const { error } = await supabase
      .from('containers')
      .delete()
      .eq('id', containerId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting container:', error);
    return { success: false, error };
  }
}

// File functions
export async function getFilesInContainer(containerId: string) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('container_id', containerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { files: data || [] };
  } catch (error) {
    console.error('Error fetching files:', error);
    return { files: [] };
  }
}

export async function getFileById(fileId: string) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

export async function updateFile(fileId: string, metadata: any) {
  try {
    const { error } = await supabase
      .from('files')
      .update({ ...metadata, updated_at: new Date() })
      .eq('id', fileId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating file:', error);
    return { success: false, error };
  }
}

export async function deleteFile(fileId: string, filePath: string) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('audio-files')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete database record
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
}

// Public Share functions
export async function createPublicShare(
  userId: string,
  containerId?: string,
  fileId?: string,
  expiresAt?: Date
) {
  try {
    const shareToken = `share_${Math.random().toString(36).substr(2, 32)}`;

    const { data, error } = await supabase
      .from('public_shares')
      .insert({
        user_id: userId,
        container_id: containerId,
        file_id: fileId,
        share_token: shareToken,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, share: data, shareToken };
  } catch (error) {
    console.error('Error creating share link:', error);
    return { success: false, error };
  }
}

export async function getPublicShare(shareToken: string) {
  try {
    const { data, error } = await supabase
      .from('public_shares')
      .select('*')
      .eq('share_token', shareToken)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching share link:', error);
    return null;
  }
}

export async function getUserShares(userId: string) {
  try {
    const { data, error } = await supabase
      .from('public_shares')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { shares: data || [] };
  } catch (error) {
    console.error('Error fetching user shares:', error);
    return { shares: [] };
  }
}

export async function disableShare(shareId: string) {
  try {
    const { error } = await supabase
      .from('public_shares')
      .update({ is_active: false })
      .eq('id', shareId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error disabling share:', error);
    return { success: false, error };
  }
}
