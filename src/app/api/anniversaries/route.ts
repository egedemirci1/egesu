import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySessionServer } from '@/lib/auth-server';

import { checkContentRateLimit, recordContentCreation, getClientIP, sanitizeContent, detectSpamPatterns } from '@/lib/spam-protection';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySessionServer(request);
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: anniversaries, error } = await supabase
      .from('anniversaries')
      .select(`
        id,
        title,
        date,
        repeat,
        created_at
      `)
      .order('date', { ascending: true });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching anniversaries:', error);
      }
      return NextResponse.json({ error: 'Failed to fetch anniversaries' }, { status: 500 });
    }

    return NextResponse.json(anniversaries || []);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Anniversaries API error:', error);
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

    // Check spam protection
    const ip = getClientIP(request);
    if (!checkContentRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const requestBody = await request.json();
    const { title, date, repeat } = requestBody;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    // Sanitize and validate content
    const sanitizedTitle = sanitizeContent(title);

    // Check for spam patterns
    if (detectSpamPatterns(sanitizedTitle)) {
      return NextResponse.json({ error: 'Content appears to be spam' }, { status: 400 });
    }

    const { data: anniversary, error } = await supabase
      .from('anniversaries')
      .insert({
        title: sanitizedTitle,
        date,
        repeat: repeat !== false, // Default to true
      })
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating anniversary:', error);
      }
      return NextResponse.json({ error: 'Failed to create anniversary' }, { status: 500 });
    }

    // Record successful content creation
    recordContentCreation(ip);

    return NextResponse.json(anniversary);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create anniversary API error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
