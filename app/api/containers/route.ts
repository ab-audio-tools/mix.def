import { NextRequest, NextResponse } from 'next/server';
import { createContainer, getContainers } from '@/lib/database';
import { getUserFromToken } from '@/lib/serverAuth';

export async function GET(request: NextRequest) {
  try {
    console.log('[API Containers GET] 🔍 Fetching containers');
    const user = await getUserFromToken(request);

    if (!user) {
      console.log('[API Containers GET] ❌ No user authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API Containers GET] ✓ User:', user.id);
    const { containers } = await getContainers(user.id);

    console.log('[API Containers GET] ✅ Found', containers.length, 'containers');
    return NextResponse.json({ containers }, { status: 200 });
  } catch (error) {
    console.error('[API Containers GET] 🔴 Error fetching containers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API Containers POST] 🚀 Creating new container');

    const user = await getUserFromToken(request);

    if (!user) {
      console.log('[API Containers POST] ❌ No user authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API Containers POST] ✓ User authenticated:', user.id);

    const { name, description } = await request.json();

    console.log('[API Containers POST] 📦 Payload received:');
    console.log('[API Containers POST] ├─ Name:', name);
    console.log('[API Containers POST] └─ Description:', description);

    if (!name) {
      console.log('[API Containers POST] ❌ Name is required');
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { success, container, error } = await createContainer(user.id, name, description);

    console.log('[API Containers POST] 🔄 DB Response:');
    console.log('[API Containers POST] ├─ Success:', success);
    console.log('[API Containers POST] ├─ Container ID:', container?.id);
    console.log('[API Containers POST] └─ Error:', error?.message);

    if (!success) {
      console.log('[API Containers POST] ❌ Failed to create container in DB');
      return NextResponse.json(
        { error: error?.message || 'Failed to create container' },
        { status: 400 }
      );
    }

    console.log('[API Containers POST] ✅ Container created successfully');
    return NextResponse.json({ container }, { status: 201 });
  } catch (error) {
    console.error('[API Containers POST] 🔴 Server Error:', error);
    return NextResponse.json(
      { error: 'Failed to create container' },
      { status: 500 }
    );
  }
}
