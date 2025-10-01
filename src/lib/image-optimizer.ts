import sharp from 'sharp';

export interface OptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
  width?: number;
  height?: number;
  format: string;
}

/**
 * Resim optimizasyonu yapar
 * @param buffer - Orijinal resim buffer'ı
 * @param options - Optimizasyon seçenekleri
 * @returns Optimize edilmiş buffer ve istatistikler
 */
export async function optimizeImage(
  buffer: Buffer,
  options: OptimizationOptions = {}
): Promise<{ optimizedBuffer: Buffer; stats: OptimizationResult }> {
  const {
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg'
  } = options;

  const originalSize = buffer.length;
  
  // Sharp ile resim işleme
  let sharpInstance = sharp(buffer);
  
  // Metadata al
  const metadata = await sharpInstance.metadata();
  
  // Boyut kontrolü ve resize
  if (metadata.width && metadata.height) {
    // Sadece gerekirse resize yap
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: false
      });
    }
  }
  
  // Format ve kalite ayarları
  let optimizedBuffer: Buffer;
  
  switch (format) {
    case 'jpeg':
      optimizedBuffer = await sharpInstance
        .jpeg({ 
          quality,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();
      break;
      
    case 'png':
      optimizedBuffer = await sharpInstance
        .png({ 
          quality: Math.round(quality * 0.9), // PNG için biraz daha düşük
          progressive: true,
          compressionLevel: 8
        })
        .toBuffer();
      break;
      
    case 'webp':
      optimizedBuffer = await sharpInstance
        .webp({ 
          quality,
          effort: 6
        })
        .toBuffer();
      break;
      
    default:
      optimizedBuffer = await sharpInstance
        .jpeg({ quality, progressive: true })
        .toBuffer();
  }
  
  // İstatistikler hesapla
  const optimizedSize = optimizedBuffer.length;
  const savings = originalSize - optimizedSize;
  const savingsPercentage = Math.round((savings / originalSize) * 100);
  
  const stats: OptimizationResult = {
    originalSize,
    optimizedSize,
    savings,
    savingsPercentage,
    width: metadata.width,
    height: metadata.height,
    format
  };
  
  return { optimizedBuffer, stats };
}

/**
 * Dosya tipine göre otomatik format seçer
 * @param mimeType - MIME type
 * @returns Optimize edilmiş format
 */
export function getOptimalFormat(mimeType: string): 'jpeg' | 'png' | 'webp' {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpeg'; // Default ve en uyumlu format
}

/**
 * Dosya boyutuna göre kalite seviyesi belirler
 * @param originalSize - Orijinal dosya boyutu (bytes)
 * @returns Kalite seviyesi (60-90)
 */
export function getOptimalQuality(originalSize: number): number {
  // Büyük dosyalar için daha agresif optimizasyon
  if (originalSize > 5 * 1024 * 1024) return 75; // 5MB+
  if (originalSize > 2 * 1024 * 1024) return 80; // 2MB+
  if (originalSize > 1 * 1024 * 1024) return 85; // 1MB+
  return 90; // 1MB altı için yüksek kalite
}

/**
 * Batch optimizasyon için
 * @param buffers - Resim buffer'ları
 * @param options - Optimizasyon seçenekleri
 * @returns Optimize edilmiş buffer'lar ve toplam istatistikler
 */
export async function optimizeImages(
  buffers: Buffer[],
  options: OptimizationOptions = {}
): Promise<{
  optimizedBuffers: Buffer[];
  totalStats: {
    totalOriginalSize: number;
    totalOptimizedSize: number;
    totalSavings: number;
    totalSavingsPercentage: number;
    fileCount: number;
  };
}> {
  const optimizedBuffers: Buffer[] = [];
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const buffer of buffers) {
    const { optimizedBuffer, stats } = await optimizeImage(buffer, options);
    optimizedBuffers.push(optimizedBuffer);
    totalOriginalSize += stats.originalSize;
    totalOptimizedSize += stats.optimizedSize;
  }
  
  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const totalSavingsPercentage = Math.round((totalSavings / totalOriginalSize) * 100);
  
  return {
    optimizedBuffers,
    totalStats: {
      totalOriginalSize,
      totalOptimizedSize,
      totalSavings,
      totalSavingsPercentage,
      fileCount: buffers.length
    }
  };
}

/**
 * Resim boyutunu kontrol eder ve gerekirse optimize eder
 * @param buffer - Resim buffer'ı
 * @param maxSize - Maksimum dosya boyutu (bytes)
 * @returns Optimize edilmiş buffer ve bilgiler
 */
export async function optimizeIfNeeded(
  buffer: Buffer,
  maxSize: number = 2 * 1024 * 1024 // 2MB default
): Promise<{ buffer: Buffer; wasOptimized: boolean; stats?: OptimizationResult }> {
  if (buffer.length <= maxSize) {
    return { buffer, wasOptimized: false };
  }
  
  // Dosya boyutuna göre kalite belirle
  const quality = getOptimalQuality(buffer.length);
  
  const { optimizedBuffer, stats } = await optimizeImage(buffer, {
    quality,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg'
  });
  
  return { buffer: optimizedBuffer, wasOptimized: true, stats };
}
