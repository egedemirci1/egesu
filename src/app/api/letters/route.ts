import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';
import { checkContentRateLimit, recordContentCreation, getClientIP, sanitizeContent, detectSpamPatterns } from '@/lib/spam-protection';

export async function GET() {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching letters:', error);
      }
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
    }

    return NextResponse.json(letters);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get letters API error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check spam protection
    const ip = getClientIP(request);
    if (!checkContentRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Sanitize and validate content
    const sanitizedTitle = sanitizeContent(title);
    const sanitizedBody = sanitizeContent(body);

    // Check for spam patterns
    if (detectSpamPatterns(sanitizedBody)) {
      return NextResponse.json({ error: 'Content appears to be spam' }, { status: 400 });
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert([{ title: sanitizedTitle, body: sanitizedBody }])
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating letter:', error);
      }
      return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 });
    }

    // Record successful content creation
    recordContentCreation(ip);

    return NextResponse.json(letter);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create letter API error:', error);
    }
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
    const letterId = searchParams.get('id');

    if (!letterId) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    // First, get the letter to check if it exists
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .select('id')
      .eq('id', letterId)
      .single();

    if (letterError) {
      console.error('Error fetching letter:', letterError);
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Delete the letter
    const { error: deleteError } = await supabase
      .from('letters')
      .delete()
      .eq('id', letterId);

    if (deleteError) {
      console.error('Error deleting letter:', deleteError);
      return NextResponse.json({ error: 'Failed to delete letter' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete letter API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}