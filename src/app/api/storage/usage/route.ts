import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySession } from '@/lib/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Session kontrolü
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Storage bucket'ından dosya listesi al
    const { data: files, error } = await supabase.storage
      .from('memories')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Storage list error:', error);
      }
      return NextResponse.json({ error: 'Failed to get storage info' }, { status: 500 });
    }

    // Toplam dosya boyutu hesapla
    let totalSize = 0;
    let fileCount = 0;

    if (files) {
      for (const file of files) {
        if (file.metadata?.size) {
          totalSize += file.metadata.size;
          fileCount++;
        }
      }
    }

    // GB cinsinden hesapla
    const totalSizeGB = totalSize / (1024 * 1024 * 1024);
    const limitGB = 1; // Supabase free tier limit
    const usagePercentage = (totalSizeGB / limitGB) * 100;

    return NextResponse.json({
      used: totalSize,
      usedGB: totalSizeGB,
      limit: limitGB * 1024 * 1024 * 1024, // bytes
      limitGB: limitGB,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      fileCount: fileCount,
      remaining: (limitGB * 1024 * 1024 * 1024) - totalSize,
      remainingGB: limitGB - totalSizeGB
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Storage usage error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
