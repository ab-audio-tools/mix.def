import { NextRequest, NextResponse } from 'next/server';
import { getContainerById, updateContainer, deleteContainer } from '@/lib/database';
import { getUserFromToken } from '@/lib/serverAuth';

interface RouteParams {
  id: string;
}

export async function GET(
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
    const container = await getContainerById(resolvedParams.id);

    if (!container || container.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ container }, { status: 200 });
  } catch (error) {
    console.error('Error fetching container:', error);
    return NextResponse.json(
      { error: 'Failed to fetch container' },
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
    const container = await getContainerById(resolvedParams.id);

    if (!container || container.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }

    const { name, description } = await request.json();

    const { success, error } = await updateContainer(resolvedParams.id, { name, description });

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to update container' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating container:', error);
    return NextResponse.json(
      { error: 'Failed to update container' },
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
    const container = await getContainerById(resolvedParams.id);

    if (!container || container.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Container not found' },
        { status: 404 }
      );
    }

    const { success, error } = await deleteContainer(resolvedParams.id);

    if (!success) {
      return NextResponse.json(
        { error: error?.message || 'Failed to delete container' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting container:', error);
    return NextResponse.json(
      { error: 'Failed to delete container' },
      { status: 500 }
    );
  }
}
