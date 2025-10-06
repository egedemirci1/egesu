import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';
import { PerformanceMonitor } from '@/lib/performance';
import { cache, CacheKeys, cached } from '@/lib/cache';

export const dynamic = 'force-static';

// Cached function for fetching memories
const fetchMemoriesCached = cached(
  async () => {
    const stopTimer = PerformanceMonitor.startTimer('memories-fetch');
    
    // Fetch memories without media first to avoid join issues
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .order('taken_at', { ascending: false });

    if (memoriesError) {
      throw memoriesError;
    }

    // Fetch media files separately for each memory (batch processing)
    const memoriesWithMedia = await Promise.all(
      (memories || []).map(async (memory) => {
        const { data: mediaFiles, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('memory_id', memory.id);

        if (mediaError) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Error fetching media for memory ${memory.id}:`, mediaError);
          }
          return {
            ...memory,
            media: []
          };
        }

        return {
          ...memory,
          media: mediaFiles || []
        };
      })
    );

    stopTimer();
    return memoriesWithMedia;
  },
  () => CacheKeys.memories(),
  2 * 60 * 1000 // 2 minutes cache
);

export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('GET /api/memories called');
    }
    
    const session = await verifySession();
    if (process.env.NODE_ENV === 'development') {
      console.log('Session verified:', !!session?.isLoggedIn);
    }
    
    if (!session?.isLoggedIn) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Unauthorized request');
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test Supabase connection first
    const { data: testData, error: testError } = await supabase
      .from('memories')
      .select('count')
      .limit(1);

    if (testError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase test error:', testError);
      }
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: process.env.NODE_ENV === 'development' ? testError.message : 'Internal server error'
      }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase connection test successful');
    }

    // First, let's check the media table structure
    const { data: mediaTest, error: mediaTestError } = await supabase
      .from('media')
      .select('*')
      .limit(1);

    if (mediaTestError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Media table test error:', mediaTestError);
      }
      return NextResponse.json({ 
        error: 'Media table access failed', 
        details: process.env.NODE_ENV === 'development' ? mediaTestError.message : 'Internal server error'
      }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Media table structure test successful, sample data:', mediaTest);

      // Also log the actual media data structure
      if (mediaTest && mediaTest.length > 0) {
        console.log('Sample media record:', JSON.stringify(mediaTest[0], null, 2));
      }
    }

    // Fetch memories without media first to avoid join issues
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('*')
      .order('taken_at', { ascending: false });

    if (memoriesError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching memories:', memoriesError);
      }
      return NextResponse.json({ 
        error: 'Failed to fetch memories', 
        details: process.env.NODE_ENV === 'development' ? memoriesError.message : 'Internal server error'
      }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Memories fetched successfully:', memories?.length || 0);
    }

    // Fetch media files separately for each memory
    const memoriesWithMedia = await Promise.all(
      (memories || []).map(async (memory) => {
        const { data: mediaFiles, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('memory_id', memory.id);

        if (mediaError) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Error fetching media for memory ${memory.id}:`, mediaError);
          }
          return {
            ...memory,
            media: []
          };
        }

        // Log the raw media data to debug the structure
        if (mediaFiles && mediaFiles.length > 0 && process.env.NODE_ENV === 'development') {
          console.log(`Media files for memory ${memory.id}:`, JSON.stringify(mediaFiles[0], null, 2));
        }

        return {
          ...memory,
          media: mediaFiles || []
        };
      })
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('Memories with media processed:', memoriesWithMedia.length);
    }
    
    // Log a sample memory with media to debug the structure
    if (memoriesWithMedia.length > 0 && process.env.NODE_ENV === 'development') {
      const sampleMemory = memoriesWithMedia[0];
      console.log('Sample memory with media:', {
        id: sampleMemory.id,
        title: sampleMemory.title,
        mediaCount: sampleMemory.media?.length || 0,
        sampleMedia: sampleMemory.media?.[0] ? {
          id: sampleMemory.media[0].id,
          file_name: sampleMemory.media[0].file_name,
          file_type: sampleMemory.media[0].file_type,
          public_url: sampleMemory.media[0].public_url
        } : null
      });
    }

    // Transform the data to match frontend expectations
    const transformedMemories = memoriesWithMedia.map(memory => {
      const transformedMedia = memory.media?.map((media: any) => {
        const transformed = {
          id: media.id,
          file_name: media.file_name || '',
          original_name: media.original_name || '',
          file_type: media.file_type || 'application/octet-stream',
          public_url: media.public_url || '',
          width: media.width,
          height: media.height
        };
        
        // Log the transformation for debugging
        console.log('Media transformation:', {
          original: {
            id: media.id,
            file_name: media.file_name,
            original_name: media.original_name,
            file_type: media.file_type,
            public_url: media.public_url
          },
          transformed: transformed
        });
        
        return transformed;
      }) || [];
      
      return {
        id: memory.id,
        title: memory.title,
        description: memory.body,  // body -> description
        date: memory.taken_at,    // taken_at -> date
        city_code: memory.city_code,
        album_id: memory.album_id,
        created_at: memory.created_at,
        media: transformedMedia
      };
    });

    console.log('Transformed memories:', transformedMemories.length);
    return NextResponse.json(transformedMemories);
  } catch (error) {
    console.error('Fetch memories API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/memories called');
    
    const session = await verifySession();
    console.log('Session verified:', !!session?.isLoggedIn);
    
    if (!session?.isLoggedIn) {
      console.log('Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, description, date, city_code, album_id, media_files } = body;

    if (!title || !date || !city_code) {
      console.log('Missing required fields:', { title: !!title, date: !!date, city_code: !!city_code });
      return NextResponse.json({ error: 'Title, date, and city are required' }, { status: 400 });
    }

    console.log('Creating memory with data:', { title, description, date, city_code, album_id });

    // Create the memory
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert({
        title,
        body: description || null,  // description -> body
        taken_at: date,             // date -> taken_at
        city_code,
        album_id: album_id || null
      })
      .select()
      .single();

    if (memoryError) {
      console.error('Supabase error creating memory:', memoryError);
      return NextResponse.json({ error: 'Failed to create memory', details: memoryError.message }, { status: 500 });
    }

    console.log('Memory created successfully:', memory);

    // Handle media files if provided
    if (media_files && media_files.length > 0) {
      console.log('Processing media files:', media_files.length);
      
      const mediaInserts = media_files.map((file: Record<string, any>) => ({
        memory_id: memory.id,
        file_name: file.file_name || '',
        original_name: file.original_name || '',
        file_type: file.file_type || 'application/octet-stream',
        public_url: file.public_url || '',
        storage_path: file.storage_path || file.file_name || '',
        file_size: file.file_size || 0
      }));

      const { error: mediaError } = await supabase
        .from('media')
        .insert(mediaInserts);

      if (mediaError) {
        console.error('Error creating media records:', mediaError);
        // Don't fail the entire request if media creation fails
      } else {
        console.log('Media files associated successfully');
      }
    }

    console.log('Returning memory data:', memory);
    return NextResponse.json(memory);
  } catch (error) {
    console.error('Create memory API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/memories called');
    
    const session = await verifySession();
    console.log('Session verified:', !!session?.isLoggedIn);
    
    if (!session?.isLoggedIn) {
      console.log('Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { memory_id, media_files } = body;

    if (!memory_id || !media_files || media_files.length === 0) {
      console.log('Missing required fields:', { memory_id: !!memory_id, media_files: media_files?.length || 0 });
      return NextResponse.json({ error: 'Memory ID and media files are required' }, { status: 400 });
    }

    console.log('Adding media to memory:', memory_id, 'with', media_files.length, 'files');

    // Check if memory exists
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .select('id')
      .eq('id', memory_id)
      .single();

    if (memoryError || !memory) {
      console.error('Memory not found:', memoryError);
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Insert media files
    const mediaInserts = media_files.map((file: Record<string, any>) => ({
      memory_id: memory_id,
      file_name: file.file_name || '',
      original_name: file.original_name || '',
      file_type: file.file_type || 'application/octet-stream',
      public_url: file.public_url || '',
      storage_path: file.storage_path || file.file_name || '',
      file_size: file.file_size || 0
    }));

    const { error: mediaError } = await supabase
      .from('media')
      .insert(mediaInserts);

    if (mediaError) {
      console.error('Error adding media to memory:', mediaError);
      return NextResponse.json({ error: 'Failed to add media to memory', details: mediaError.message }, { status: 500 });
    }

    console.log('Media added successfully to memory:', memory_id);
    return NextResponse.json({ success: true, message: 'Media added successfully' });
  } catch (error) {
    console.error('Add media to memory API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get('id');

    if (!memoryId) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    // First, get the memory to find associated media files
    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .select('id')
      .eq('id', memoryId)
      .single();

    if (memoryError) {
      console.error('Error fetching memory:', memoryError);
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    // Delete associated media files from storage and database
    const { data: mediaFiles, error: mediaError } = await supabase
      .from('media')
      .select('file_name')
      .eq('memory_id', memoryId);

    if (!mediaError && mediaFiles) {
      // Delete files from storage
      for (const media of mediaFiles) {
        const { error: deleteError } = await supabase.storage
          .from('media')
          .remove([media.file_name]);
        
        if (deleteError) {
          console.error('Error deleting media file:', deleteError);
        }
      }

      // Delete media records from database
      await supabase
        .from('media')
        .delete()
        .eq('memory_id', memoryId);
    }

    // Delete the memory
    const { error: deleteError } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (deleteError) {
      console.error('Error deleting memory:', deleteError);
      return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete memory API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}