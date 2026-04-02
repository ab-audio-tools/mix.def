import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Signup API called');
    const { email, password, username } = await request.json();
    console.log('📝 Received:', { email, username });

    // Create public client for auth
    const supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('📝 Creating auth user...');
    const { data: authData, error: authError } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error('❌ No user returned from signup');
      return NextResponse.json(
        { error: 'Signup failed - no user created' },
        { status: 400 }
      );
    }

    console.log('✅ Auth user created:', authData.user.id);
    console.log('✅ Signup successful - user profile will be created by database trigger');

    return NextResponse.json(
      { 
        user: authData.user,
        message: 'Signup successful! Please check your email to verify your account.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Signup error (catch):', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + String(error) },
      { status: 500 }
    );
  }
}
