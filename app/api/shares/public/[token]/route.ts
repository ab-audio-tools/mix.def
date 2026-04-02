import { NextRequest, NextResponse } from 'next/server';
import { getPublicShare, getFileById, getContainerById, getFilesInContainer } from '@/lib/database';

interface RouteParams {
  token: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    // Get the public share
    const share = await getPublicShare(resolvedParams.token);

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }

    let file = null;
    let container = null;

    // If it's a file share
    if (share.file_id) {
      file = await getFileById(share.file_id);

      if (!file) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }

    // If it's a container share
    if (share.container_id) {
      container = await getContainerById(share.container_id);

      if (!container) {
        return NextResponse.json(
          { error: 'Container not found' },
          { status: 404 }
        );
      }

      // Get all files in the container
      const { files } = await getFilesInContainer(share.container_id);
      container.files = files;
    }

    return NextResponse.json(
      {
        share,
        file,
        container,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public share:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}
