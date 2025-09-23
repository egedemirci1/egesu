import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all memories grouped by album_id
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select(`
        album_id,
        id,
        title,
        taken_at,
        media(id, file_name, file_type, public_url)
      `)
      .not('album_id', 'is', null)
      .order('taken_at', { ascending: false });

    if (memoriesError) {
      console.error('Error fetching memories for albums:', memoriesError);
      return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }

    // Group memories by album_id
    const albumGroups = memories?.reduce((acc: Record<string, any>, memory: Record<string, any>) => {
      const albumId = memory.album_id;
      if (!acc[albumId]) {
        acc[albumId] = {
          id: albumId,
          title: `Albüm ${albumId.slice(0, 8)}`, // Generate a title from album_id
          memories: [],
          memory_count: 0,
          cover_media: null,
          created_at: memory.taken_at
        };
      }
      
      acc[albumId].memories.push(memory);
      acc[albumId].memory_count++;
      
      // Set cover media from first memory with media
      if (!acc[albumId].cover_media && memory.media && memory.media.length > 0) {
        acc[albumId].cover_media = memory.media[0];
      }
      
      return acc;
    }, {}) || {};

    // Convert to array and sort by creation date
    const albums = Object.values(albumGroups).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Get albums API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('id');

    if (!albumId) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 });
    }

    // First, get the album to check if it exists
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('id')
      .eq('id', albumId)
      .single();

    if (albumError) {
      console.error('Error fetching album:', albumError);
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    // Delete associated memories (which will cascade delete media files)
    const { error: memoriesError } = await supabase
      .from('memories')
      .delete()
      .eq('album_id', albumId);

    if (memoriesError) {
      console.error('Error deleting album memories:', memoriesError);
    }

    // Delete the album
    const { error: deleteError } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId);

    if (deleteError) {
      console.error('Error deleting album:', deleteError);
      return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete album API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}