import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication first
    const session = await verifySession();
    
    if (!session?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test Supabase connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Buckets error:', bucketsError);
      }
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: process.env.NODE_ENV === 'development' ? bucketsError : 'Internal server error'
      }, { status: 500 });
    }

    // Check if media bucket exists
    const mediaBucket = buckets?.find(bucket => bucket.id === 'media');
    
    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
      mediaBucketExists: !!mediaBucket,
      mediaBucket: mediaBucket
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Test error:', error);
    }
    return NextResponse.json({ 
      error: 'Test failed', 
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
    }, { status: 500 });
  }
}
