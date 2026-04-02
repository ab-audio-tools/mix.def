import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './supabase';

/**
 * Get user from Authorization header token
 * Usage in API routes: const user = await getUserFromToken(request)
 */
export async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    console.log('[ServerAuth] 🔐 Reading Authorization header');

    if (!authHeader) {
      console.log('[ServerAuth] ❌ No Authorization header found');
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[ServerAuth] 🔑 Token found, length:', token.length);

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('[ServerAuth] ❌ Token verification failed:', error?.message);
      return null;
    }

    console.log('[ServerAuth] ✅ User authenticated:', user.id);
    return user;
  } catch (error) {
    console.error('[ServerAuth] 🔴 Error getting user from token:', error);
    return null;
  }
}
