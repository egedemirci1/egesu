import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test Supabase connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Buckets error:', bucketsError);
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: bucketsError 
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
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
