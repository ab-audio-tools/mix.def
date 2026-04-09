import { NextRequest, NextResponse } from 'next/server';
import { getFilesInContainer } from '@/lib/database';
import { getUserFromToken } from '@/lib/serverAuth';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface RouteParams {
  id: string;
}

export const maxDuration = 300; // 5 minutes timeout for large file uploads

export async function POST(
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

    console.log('[API Upload File] 🚀 Uploading file');
    const resolvedParams = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[API Upload File] ❌ No file provided');
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Extract audio metadata if provided
    const metadata: any = {};
    if (formData.has('duration')) metadata.duration = parseInt(formData.get('duration') as string);
    if (formData.has('sample_rate')) metadata.sample_rate = parseInt(formData.get('sample_rate') as string);
    if (formData.has('bitrate')) metadata.bitrate = parseInt(formData.get('bitrate') as string);
    if (formData.has('lufs')) metadata.lufs = parseFloat(formData.get('lufs') as string);
    if (formData.has('true_peak')) metadata.true_peak = parseFloat(formData.get('true_peak') as string);
    if (formData.has('loudness_range')) metadata.loudness_range = parseFloat(formData.get('loudness_range') as string);
    if (formData.has('format')) metadata.format = formData.get('format') as string;

    console.log('[API Upload File] 📝 Metadata:', metadata);

    // Upload to local storage
    console.log('[DB Upload] 🚀 Starting upload for:', file.name);
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();

    // Save to local storage
    console.log('[DB Upload] 📤 Saving to local storage:', file.name, 'Size:', file.size);
    
    try {
      // Ensure upload directory exists with proper permissions
      const uploadDir = join(process.cwd(), 'public', 'uploads', resolvedParams.id);
      console.log('[DB Upload] 📁 Upload directory:', uploadDir);
      
      await mkdir(uploadDir, { recursive: true });
      console.log('[DB Upload] ✓ Directory created/verified');
      
      const filePath = join(uploadDir, `${timestamp}-${file.name}`);
      console.log('[DB Upload] 📝 File path:', filePath);
      
      const buffer = await file.arrayBuffer();
      console.log('[DB Upload] 📦 Buffer size:', buffer.byteLength);
      
      await writeFile(filePath, Buffer.from(buffer));
      console.log('[DB Upload] ✅ File saved successfully');
    } catch (writeError) {
      console.error('[DB Upload] ❌ Write error:', writeError);
      throw writeError;
    }

    // Generate public URL
    const publicUrl = `/uploads/${resolvedParams.id}/${timestamp}-${file.name}`;
    console.log('[DB Upload] 🔗 Public URL:', publicUrl);

    // Create file record in database
    console.log('[DB Upload] 💾 Creating file record in database...');
    const { data: fileData, error: dbError } = await supabase
      .from('files')
      .insert({
        container_id: resolvedParams.id,
        user_id: user.id,
        file_name: file.name,
        file_path: publicUrl,
        file_size: file.size,
        format: fileExt,
        ...metadata,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[DB Upload] ❌ Database insert failed:', dbError.message);
      throw dbError;
    }
    console.log('[DB Upload] ✅ File record created:', fileData.id);

    console.log('[API Upload File] ✅ File uploaded:', file.name);
    return NextResponse.json(
      { file: fileData, url: publicUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Upload File] ❌ Error uploading file:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      console.log('[API Files GET] ❌ No Authorization header found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[API Files GET] 🚀 Fetching files for container');
    const resolvedParams = await params;
    const { files } = await getFilesInContainer(resolvedParams.id);

    console.log('[API Files GET] ✅ Found', files?.length || 0, 'files');
    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('[API Files GET] ❌ Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
