import { NextRequest, NextResponse } from 'next/server';
import { getFileById, updateFile, deleteFile } from '@/lib/database';
import { getUserFromToken } from '@/lib/serverAuth';

interface RouteParams {
  id: string;
  fileId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const file = await getFileById(resolvedParams.fileId);

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ file }, { status: 200 });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const file = await getFileById(resolvedParams.fileId);

    if (!file || file.user_id !== user.id) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('[API File PATCH] 🔄 Updating file:', resolvedParams.fileId);
    const metadata = await request.json();
    const { success, error } = await updateFile(resolvedParams.fileId, metadata);

    if (!success) {
      console.error('[API File PATCH] ❌ Update failed:', error?.message);
      return NextResponse.json(
        { error: error?.message || 'Failed to update file' },
        { status: 400 }
      );
    }

    console.log('[API File PATCH] ✅ File updated');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API File PATCH] ❌ Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const file = await getFileById(resolvedParams.fileId);

    if (!file || file.user_id !== user.id) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('[API File DELETE] 🗑️ Deleting file:', resolvedParams.fileId);
    const { success, error } = await deleteFile(resolvedParams.fileId, file.file_path);

    if (!success) {
      console.error('[API File DELETE] ❌ Delete failed:', error?.message);
      return NextResponse.json(
        { error: error?.message || 'Failed to delete file' },
        { status: 400 }
      );
    }

    console.log('[API File DELETE] ✅ File deleted');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[API File DELETE] ❌ Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
