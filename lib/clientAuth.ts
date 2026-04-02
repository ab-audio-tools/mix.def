import { supabase } from './supabase';

/**
 * Helper per fare fetch autenticati
 * Legge il token dalla sessione Supabase e lo aggiunge come header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  try {
    console.log('[ClientAuth] 🔐 Getting session token...');

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log('[ClientAuth] ❌ No session found');
      throw new Error('No active session');
    }

    console.log('[ClientAuth] ✅ Session found, token length:', session.access_token.length);

    // Add token to headers
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);
    
    // Only set Content-Type for JSON if body is not FormData
    if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    console.log('[ClientAuth] 📤 Sending request with token to:', url);

    // Make request with token
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('[ClientAuth] 📥 Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[ClientAuth] 🔴 Error in authenticated fetch:', error);
    throw error;
  }
}
