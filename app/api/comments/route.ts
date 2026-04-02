import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { track_id, content } = await request.json();

    if (!track_id || !content) {
      return NextResponse.json(
        { error: 'track_id and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        track_id,
        user_id: user.id,
        content,
      })
      .select('*, user:user_id(id, username, avatar_url)');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment track comments count
    await supabase.rpc('increment_comments_count', { track_id });

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
