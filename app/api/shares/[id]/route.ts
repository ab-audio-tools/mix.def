import { NextRequest, NextResponse } from 'next/server';
import { disableShare } from '@/lib/database';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  id: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { success, error } = await disableShare(resolvedParams.id);

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to disable share' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error disabling share:', error);
    return NextResponse.json(
      { error: 'Failed to disable share' },
      { status: 500 }
    );
  }
}
