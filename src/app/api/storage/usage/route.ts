import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionServer } from '@/lib/auth-server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Session kontrolü
    const session = await verifySessionServer(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Önce database'den media dosyalarını al
    const { data: mediaFiles, error: dbError } = await supabase
      .from('media')
      .select('id, file_name, file_size, file_type')
      .not('file_size', 'is', null);

    if (dbError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Database error:', dbError);
      }
      return NextResponse.json({ error: 'Failed to get media info' }, { status: 500 });
    }

    // Debug için database sonuçlarını logla
    if (process.env.NODE_ENV === 'development') {
      console.log('Media files from database:', mediaFiles?.length || 0);
      if (mediaFiles && mediaFiles.length > 0) {
        console.log('Sample media file:', mediaFiles[0]);
      }
    }

    // Database'den toplam boyut hesapla
    let totalSize = 0;
    let fileCount = 0;

    if (mediaFiles && mediaFiles.length > 0) {
      for (const mediaFile of mediaFiles) {
        if (mediaFile.file_size && typeof mediaFile.file_size === 'number') {
          totalSize += mediaFile.file_size;
          fileCount++;
        }
      }
    }

    // Eğer database'de file_size yoksa, Storage API'sini dene
    if (totalSize === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No file_size in database, trying Storage API...');
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
      } else {
        fileCount = files?.length || 0;

        // Supabase Storage API'si dosya boyutlarını farklı şekillerde döndürebilir
        if (files && files.length > 0) {
          for (const file of files) {
            // Farklı metadata formatlarını dene
            let fileSize = null;
            
            // 1. Direkt size property (if exists)
            if ((file as any).size && typeof (file as any).size === 'number') {
              fileSize = (file as any).size;
            }
            // 2. Metadata içinde size
            else if (file.metadata?.size && typeof file.metadata.size === 'number') {
              fileSize = file.metadata.size;
            }
            // 3. Metadata içinde fileSize
            else if (file.metadata?.fileSize && typeof file.metadata.fileSize === 'number') {
              fileSize = file.metadata.fileSize;
            }
            // 4. Metadata içinde contentLength
            else if (file.metadata?.contentLength && typeof file.metadata.contentLength === 'number') {
              fileSize = file.metadata.contentLength;
            }

            if (fileSize) {
              totalSize += fileSize;
            } else {
              // Debug için dosya bilgilerini logla
              if (process.env.NODE_ENV === 'development') {
                console.log('File without size info:', file.name, file);
              }
            }
          }
        }

        // Eğer hala 0 ise ve dosyalar varsa, HEAD request yöntemi dene
        if (totalSize === 0 && files && files.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Trying HEAD request method for file sizes...');
          }
          
          for (const file of files) {
            try {
              const { data: fileInfo } = await supabase.storage
                .from('memories')
                .getPublicUrl(file.name);
              
              // HEAD request ile dosya boyutunu al
              const response = await fetch(fileInfo.publicUrl, { method: 'HEAD' });
              const contentLength = response.headers.get('content-length');
              
              if (contentLength) {
                const size = parseInt(contentLength);
                totalSize += size;
                if (process.env.NODE_ENV === 'development') {
                  console.log(`File ${file.name}: ${size} bytes`);
                }
              }
            } catch (err) {
              if (process.env.NODE_ENV === 'development') {
                console.error('Error getting file size for:', file.name, err);
              }
            }
          }
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
