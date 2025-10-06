import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionServer } from '@/lib/auth-server';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySessionServer(request);
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get category filter from query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Build query
    let query = supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply category filter if specified and not 'tumu' (all)
    if (category && category !== 'tumu') {
      query = query.eq('category', category);
    }

    const { data: songs, error: songsError } = await query;

    if (songsError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching songs:', songsError);
      }
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }

    return NextResponse.json(songs || []);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get songs API error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySessionServer(request);
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, artist, youtube_url, youtube_id, thumbnail_url, category = 'tumu' } = body;

    if (!title || !artist || !youtube_url || !youtube_id) {
      return NextResponse.json({ error: 'Title, artist, youtube_url, and youtube_id are required' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['tumu', 'hareketli', 'sakin', 'klasik', 'romantik', 'nostaljik'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Create the song
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        title,
        artist,
        youtube_url,
        youtube_id,
        thumbnail_url: thumbnail_url || `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`,
        category
      })
      .select()
      .single();

    if (songError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase error creating song:', songError);
      }
      return NextResponse.json({ error: 'Failed to create song', details: songError.message }, { status: 500 });
    }

    return NextResponse.json(song);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create song API error:', error);
    }
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySessionServer(request);
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('id');

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    // Delete the song
    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (deleteError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting song:', deleteError);
      }
      return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete song API error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
