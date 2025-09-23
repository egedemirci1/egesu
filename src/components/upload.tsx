'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image, Video, File } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  progress: number;
}

interface UploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadStart?: () => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function UploadComponent({
  onUploadComplete,
  onUploadStart,
  multiple = true,
  accept = 'image/*,video/*',
  maxSize = 50,
  className
}: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= maxSize * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('Please select valid image or video files under 50MB');
      return;
    }

    setUploading(true);
    onUploadStart?.();

    const uploadPromises = validFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Upload failed - Status:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Upload API error:', errorData);
          throw new Error(`Upload failed: ${errorData.error || response.statusText} (Status: ${response.status})`);
        }

        const result = await response.json();
        
        return {
          id: result.media.id,
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.url,
          progress: 100
        };
      } catch (error) {
        console.error('Upload error:', error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result): result is UploadedFile => result !== null);
    
    setUploadedFiles(prev => [...prev, ...successfulUploads]);
    setUploading(false);
    onUploadComplete?.(successfulUploads);
  }, [maxSize, onUploadStart, onUploadComplete]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground">
              Images and videos up to {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>Please wait</span>
          </div>
          <Progress value={50} className="w-full" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
