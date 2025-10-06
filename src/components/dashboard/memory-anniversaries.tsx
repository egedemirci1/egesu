'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, Calendar, Clock, Eye, MapPin, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';
import { CITIES } from '@/constants/cities';
import { Carousel } from '@/components/ui/carousel';

interface MediaFile {
  id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
}

interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  city_code: string;
  created_at: string;
  media: MediaFile[];
}

interface MemoryAnniversariesProps {
  className?: string;
}

export function MemoryAnniversaries({ className = '' }: MemoryAnniversariesProps) {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMemories();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchMemories = async () => {
    try {
      const response = await fetch('/api/memories');
      if (response.ok) {
        const data = await response.json();
        setMemories(data);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemoryAnniversaries = () => {
    const today = new Date();
    const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return memories
      .filter(memory => {
        const memoryDate = new Date(memory.date);
        const currentYear = today.getFullYear();
        
        // Set to current year
        memoryDate.setFullYear(currentYear);
        
        // If memory date has passed this year, check next year
        if (memoryDate < today) {
          memoryDate.setFullYear(currentYear + 1);
        }
        
        return memoryDate >= today && memoryDate <= next90Days && memory.media && memory.media.length > 0;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        dateA.setFullYear(today.getFullYear());
        dateB.setFullYear(today.getFullYear());
        
        if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
        if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);
        
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  };

  const getDaysUntilAnniversary = (date: string) => {
    const today = new Date();
    const anniversaryDate = new Date(date);
    const currentYear = today.getFullYear();
    
    anniversaryDate.setFullYear(currentYear);
    
    if (anniversaryDate < today) {
      anniversaryDate.setFullYear(currentYear + 1);
    }
    
    const diffTime = anniversaryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getCityName = (cityCode: string) => {
    const city = CITIES.find(c => c.code.toString() === cityCode);
    return city ? city.name : cityCode;
  };

  const getYearsAgo = (date: string) => {
    const today = new Date();
    const memoryDate = new Date(date);
    const yearsDiff = today.getFullYear() - memoryDate.getFullYear();
    return yearsDiff;
  };

  const memoryAnniversaries = getMemoryAnniversaries();

  if (!isAuthenticated) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Anı Yıldönümleri</span>
          </CardTitle>
          <CardDescription>
            Fotoğraflı anıların yaklaşan yıldönümleri (90 gün)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Anıları görüntülemek için giriş yapın</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Anı Yıldönümleri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 h-8 w-8"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
      theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
    } ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Anı Yıldönümleri</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Tümünü Gör
          </Button>
        </CardTitle>
        <CardDescription>
          Fotoğraflı anıların yaklaşan yıldönümleri (90 gün)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {memoryAnniversaries.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Yaklaşan anı yıldönümü bulunmuyor</p>
            <p className="text-gray-400 text-xs mt-1">Fotoğraflı anılarınızın yıldönümlerini takip edin</p>
          </div>
        ) : (
          <div className="flex-1">
            <Carousel
              items={memoryAnniversaries.map((memory) => {
                const daysUntil = getDaysUntilAnniversary(memory.date);
                const yearsAgo = getYearsAgo(memory.date);
                const anniversaryDate = new Date(memory.date);
                const currentYear = new Date().getFullYear();
                anniversaryDate.setFullYear(currentYear);
                
                if (anniversaryDate < new Date()) {
                  anniversaryDate.setFullYear(currentYear + 1);
                }
                
                return (
                  <div key={memory.id} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors cursor-pointer h-full"
                       onClick={() => window.location.href = '/'}>
                    <div className="flex items-start space-x-3 h-full">
                      <div className="flex-shrink-0">
                        {memory.media && memory.media.length > 0 ? (
                          <img
                            src={memory.media[0].public_url}
                            alt={memory.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            theme === 'green-theme' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-pink-100 text-pink-600'
                          }`}>
                            <Image className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-800 text-sm truncate">{memory.title}</h4>
                          <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{daysUntil} gün</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{anniversaryDate.toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long'
                            })}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{getCityName(memory.city_code)}</span>
                          </div>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {yearsAgo} yıl önce
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              autoPlay={true}
              autoPlayInterval={4000}
              className="h-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
