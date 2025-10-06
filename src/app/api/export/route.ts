import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';
import JSZip from 'jszip';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data including media files
    const [memoriesResult, albumsResult, lettersResult, anniversariesResult, mediaResult] = await Promise.all([
      supabase.from('memories').select(`
        id,
        title,
        body,
        taken_at,
        city_code,
        album_id,
        created_at
      `).order('taken_at', { ascending: false }),
      
      supabase.from('albums').select(`
        id,
        title,
        cover_media_id,
        created_at
      `).order('created_at', { ascending: false }),
      
      supabase.from('letters').select(`
        id,
        title,
        body,
        created_at
      `).order('created_at', { ascending: false }),
      
      supabase.from('anniversaries').select(`
        id,
        title,
        date,
        repeat,
        created_at
      `).order('date', { ascending: true }),
      
      supabase.from('media').select(`
        id,
        file_name,
        original_name,
        file_type,
        file_size,
        public_url,
        created_at
      `).order('created_at', { ascending: false })
    ]);

    // Check for errors
    if (memoriesResult.error) {
      console.error('Error fetching memories:', memoriesResult.error);
      return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 });
    }
    if (albumsResult.error) {
      console.error('Error fetching albums:', albumsResult.error);
      return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }
    if (lettersResult.error) {
      console.error('Error fetching letters:', lettersResult.error);
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
    }
    if (anniversariesResult.error) {
      console.error('Error fetching anniversaries:', anniversariesResult.error);
      return NextResponse.json({ error: 'Failed to fetch anniversaries' }, { status: 500 });
    }
    if (mediaResult.error) {
      console.error('Error fetching media:', mediaResult.error);
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }

    // Create ZIP file
    const zip = new JSZip();
    
    // Add JSON data
    const exportData = {
      export_date: new Date().toISOString(),
      version: '1.0.0',
      data: {
        memories: memoriesResult.data || [],
        albums: albumsResult.data || [],
        letters: lettersResult.data || [],
        anniversaries: anniversariesResult.data || []
      }
    };
    
    zip.file('data.json', JSON.stringify(exportData, null, 2));
    
    // Add media files
    const mediaFiles = mediaResult.data || [];
    for (const media of mediaFiles) {
      try {
        // Download file from Supabase storage
        const response = await fetch(media.public_url);
        if (response.ok) {
          const fileBuffer = await response.arrayBuffer();
          const fileExtension = media.original_name.split('.').pop() || 'bin';
          zip.file(`media/${media.original_name}`, fileBuffer);
        }
      } catch (error) {
        console.error(`Error downloading media file ${media.original_name}:`, error);
      }
    }
    
    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    
    // Return ZIP file
    return new NextResponse(zipBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="egesu-memories-${new Date().toISOString().split('T')[0]}.zip"`
      }
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
