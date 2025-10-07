'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaFile {
  id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size?: number;
  public_url: string;
  created_at?: string;
}

interface MediaDisplayProps {
  media: MediaFile[];
  onDelete?: (mediaId: string) => void;
  showDelete?: boolean;
  className?: string;
}

// Lazy Loading Image Component with Performance Optimization
function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-transform group-hover:scale-105 transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
            decoding="async"
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Yükleniyor...</div>
            </div>
          )}
        </>
      )}
      {!isInView && (
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Hazırlanıyor...</div>
        </div>
      )}
    </div>
  );
}

export function MediaDisplay({ 
  media, 
  onDelete, 
  showDelete = false,
  className 
}: MediaDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2; // Her seferinde 2 görsel göster
  const totalPages = Math.ceil(media.length / itemsPerPage);

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return 'Bilinmiyor';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Bilinmiyor';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (mediaId: string) => {
    if (!onDelete) return;
    
    try {
      const response = await fetch(`/api/upload?id=${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        onDelete(mediaId);
      } else {
        console.error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No media files yet</p>
      </div>
    );
  }

  // Sadece mevcut sayfadaki medyaları göster
  const startIndex = currentIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedia = media.slice(startIndex, endIndex);

  return (
    <div className={className}>
      <div className="relative">
        {/* Slider Container */}
        <div className="grid grid-cols-2 gap-4">
          {currentMedia.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-0">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative aspect-square cursor-pointer group overflow-hidden">
                    {(() => {
                      // Determine if it's an image based on file_type or file extension
                      const fileName = file.original_name || file.file_name || file.public_url || '';
                      const isImage = file.file_type?.startsWith('image/') || 
                                    fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
                      
                      // Debug log only if there are issues
                      if (!file.public_url || !file.original_name) {
                        console.log('Media file debug:', {
                          file_type: file.file_type,
                          original_name: file.original_name,
                          file_name: file.file_name,
                          public_url: file.public_url,
                          fileName,
                          isImage,
                          match: fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)
                        });
                      }
                      
                      return isImage ? (
                        <LazyImage
                          src={file.public_url}
                          alt={file.original_name}
                          className="relative aspect-square"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-muted flex items-center justify-center">
                          <video
                            src={file.public_url}
                            className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                      );
                    })()}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {showDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.public_url, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-5xl max-h-[95vh] p-0 flex flex-col">
                  <DialogTitle className="sr-only">{file.original_name}</DialogTitle>
                  <div className="flex-1 flex items-center justify-center p-4">
                    {file.file_type.startsWith('image/') ? (
                      <img
                        src={file.public_url}
                        alt={file.original_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <video
                        src={file.public_url}
                        controls
                        className="max-w-full max-h-full"
                        autoPlay
                      />
                    )}
                  </div>
                  
                  {/* Media Info */}
                  <div className="p-4 border-t">
                    <div className="space-y-2">
                      <h3 className="font-medium">{file.original_name}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>{formatDate(file.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <>
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-md"
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-md"
              onClick={nextSlide}
              disabled={currentIndex === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Page Indicator */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>
        )}

        {/* Media Count */}
        {media.length > itemsPerPage && (
          <div className="text-center mt-2 text-sm text-gray-500">
            {startIndex + 1}-{Math.min(endIndex, media.length)} / {media.length} görsel
          </div>
        )}
      </div>
    </div>
  );
}
