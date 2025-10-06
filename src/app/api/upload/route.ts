import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-static';
import { optimizeImage, getOptimalFormat, getOptimalQuality } from '@/lib/image-optimizer';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Upload API called');
    }
    
    // Check authentication
    const session = await verifySession();
    if (!session) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Authentication failed');
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Authentication successful');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const memoryId = formData.get('memoryId') as string;

    if (process.env.NODE_ENV === 'development') {
      console.log('File received:', file?.name, file?.size, file?.type);
      console.log('Memory ID:', memoryId);
    }

    if (!file) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No file provided');
      }
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let finalBuffer = buffer;
    let optimizedFileName = file.name;
    let finalFileSize = file.size;
    let optimizationStats = null;
    
    // Optimize image if it's an image file
    if (file.type.startsWith('image/')) {
      try {
        const optimalFormat = getOptimalFormat(file.type);
        const optimalQuality = getOptimalQuality(file.size);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Optimizing image:', file.name, 'Format:', optimalFormat, 'Quality:', optimalQuality);
        }
        
        const { optimizedBuffer, stats } = await optimizeImage(buffer, {
          quality: optimalQuality,
          maxWidth: 1920,
          maxHeight: 1080,
          format: optimalFormat
        });
        
        finalBuffer = Buffer.from(optimizedBuffer);
        finalFileSize = optimizedBuffer.length;
        optimizationStats = stats;
        
        // Update filename with optimized extension
        const baseName = file.name.split('.')[0];
        optimizedFileName = `${baseName}.${optimalFormat}`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Image optimization complete:', {
            originalSize: stats.originalSize,
            optimizedSize: stats.optimizedSize,
            savings: `${stats.savingsPercentage}%`,
            format: stats.format
          });
        }
      } catch (optimizationError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Image optimization failed:', optimizationError);
        }
        // Continue with original file if optimization fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = optimizedFileName.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    if (process.env.NODE_ENV === 'development') {
      console.log('Uploading to Supabase Storage:', fileName, 'Size:', finalFileSize);
    }
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, finalBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
    }
    
    console.log('Supabase Storage upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    // Save media record to database
    const { data: mediaData, error: dbError } = await supabase
      .from('media')
      .insert({
        memory_id: memoryId || null,
        file_name: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: finalFileSize, // Use optimized size
        storage_path: data.path,
        public_url: urlData.publicUrl
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: mediaData,
      url: urlData.publicUrl,
      optimization: optimizationStats ? {
        wasOptimized: true,
        originalSize: optimizationStats.originalSize,
        optimizedSize: optimizationStats.optimizedSize,
        savingsPercentage: optimizationStats.savingsPercentage,
        format: optimizationStats.format
      } : { wasOptimized: false }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mediaId, memoryId } = await request.json();

    if (!mediaId || !memoryId) {
      return NextResponse.json({ error: 'Media ID and Memory ID are required' }, { status: 400 });
    }

    // Update media record to associate with memory
    const { data: mediaData, error: dbError } = await supabase
      .from('media')
      .update({ memory_id: memoryId })
      .eq('id', mediaId)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      media: mediaData
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
    }

    // Get media record
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([media.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media')
      .delete()
      .eq('id', mediaId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
