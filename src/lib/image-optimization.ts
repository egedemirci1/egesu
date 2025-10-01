// Image optimization utilities for better performance

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageOptimizer {
  private static readonly SUPPORTED_FORMATS = ['webp', 'jpeg', 'png'];
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly DEFAULT_WIDTH = 800;

  /**
   * Generate optimized image URL for Supabase Storage
   */
  static getOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl || !originalUrl.includes('supabase')) {
      return originalUrl;
    }

    const {
      width = this.DEFAULT_WIDTH,
      height,
      quality = this.DEFAULT_QUALITY,
      format = 'webp'
    } = options;

    // Parse the URL to get the bucket and file path
    const urlParts = originalUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      return originalUrl;
    }

    const [baseUrl, filePath] = urlParts;
    const [bucket, ...pathParts] = filePath.split('/');
    const fileName = pathParts.join('/');

    // Generate optimized URL
    const params = new URLSearchParams({
      width: width.toString(),
      quality: quality.toString(),
      format
    });

    if (height) {
      params.set('height', height.toString());
    }

    return `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}?${params.toString()}`;
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  static getResponsiveUrls(originalUrl: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.getOptimizedUrl(originalUrl, { width: 150, height: 150 }),
      small: this.getOptimizedUrl(originalUrl, { width: 300, height: 300 }),
      medium: this.getOptimizedUrl(originalUrl, { width: 600, height: 600 }),
      large: this.getOptimizedUrl(originalUrl, { width: 1200, height: 1200 }),
      original: originalUrl
    };
  }

  /**
   * Check if WebP is supported by the browser
   */
  static async isWebPSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Get the best format for the current browser
   */
  static async getBestFormat(): Promise<'webp' | 'jpeg' | 'png'> {
    if (typeof window === 'undefined') return 'jpeg';
    
    const isWebPSupported = await this.isWebPSupported();
    return isWebPSupported ? 'webp' : 'jpeg';
  }

  /**
   * Preload critical images
   */
  static preloadImages(urls: string[]): void {
    if (typeof window === 'undefined') return;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Lazy load images with intersection observer
   */
  static createLazyLoader(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  }
}

// React hook removed to fix build issues - can be added later as separate file
