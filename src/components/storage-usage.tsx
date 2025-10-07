'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, HardDrive, FileText, Image, Video } from 'lucide-react';

interface StorageUsage {
  used: number;
  usedGB: number;
  limit: number;
  limitGB: number;
  usagePercentage: number;
  fileCount: number;
  remaining: number;
  remainingGB: number;
}

export function StorageUsage() {
  const [storageData, setStorageData] = useState<StorageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStorageUsage();
  }, []);

  const fetchStorageUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/storage/usage', { credentials: 'include' });
      const data = await response.json();

      if (response.ok) {
        setStorageData(data);
      } else {
        setError(data.error || 'Depolama bilgileri alınamadı');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'Kritik';
    if (percentage >= 75) return 'Dikkat';
    return 'Normal';
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (percentage >= 75) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <HardDrive className="h-5 w-5 text-green-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Depolama Kullanımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !storageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Depolama Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error || 'Bilgi alınamadı'}</p>
          <button 
            onClick={fetchStorageUsage}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Tekrar Dene
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getUsageIcon(storageData.usagePercentage)}
          Depolama Kullanımı
        </CardTitle>
        <CardDescription>
          Supabase Free Tier - 1 GB limit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {formatBytes(storageData.used)} / {formatBytes(storageData.limit)}
            </span>
            <span className={`text-sm font-medium ${
              storageData.usagePercentage >= 90 ? 'text-red-600' :
              storageData.usagePercentage >= 75 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              %{storageData.usagePercentage} - {getUsageStatus(storageData.usagePercentage)}
            </span>
          </div>
          <Progress 
            value={storageData.usagePercentage} 
            className="h-2"
          />
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{storageData.fileCount} dosya</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-gray-500" />
            <span>{formatBytes(storageData.remaining)} kalan</span>
          </div>
        </div>

        {/* Warning Messages */}
        {storageData.usagePercentage >= 90 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Kritik: Depolama alanı neredeyse dolu!
              </span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              Yeni dosya yükleyemezsiniz. Eski dosyaları silin veya pro plana geçin.
            </p>
          </div>
        )}

        {storageData.usagePercentage >= 75 && storageData.usagePercentage < 90 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700 font-medium">
                Dikkat: Depolama alanı doluyor
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Kalan alan: {formatBytes(storageData.remaining)}
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <button 
          onClick={fetchStorageUsage}
          className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 border-t border-gray-100"
        >
          Bilgileri Yenile
        </button>
      </CardContent>
    </Card>
  );
}
