import { NextRequest, NextResponse } from 'next/server';
import { createPublicShare, getUserShares, disableShare } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { containerId, fileId, expiresAt } = await request.json();

    if (!containerId && !fileId) {
      return NextResponse.json(
        { error: 'Either containerId or fileId is required' },
        { status: 400 }
      );
    }

    const { success, share, shareToken, error } = await createPublicShare(
      user.id,
      containerId,
      fileId,
      expiresAt ? new Date(expiresAt) : undefined
    );

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to create share link' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        share,
        shareLink: `/share/${shareToken}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { shares } = await getUserShares(user.id);

    return NextResponse.json({ shares }, { status: 200 });
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}
