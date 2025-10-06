'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Clock, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface Anniversary {
  id: string;
  title: string;
  date: string;
  repeat: boolean;
  created_at: string;
}

interface UpcomingAnniversariesProps {
  className?: string;
}

export function UpcomingAnniversaries({ className = '' }: UpcomingAnniversariesProps) {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchAnniversaries();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchAnniversaries = async () => {
    try {
      const response = await fetch('/api/anniversaries');
      if (response.ok) {
        const data = await response.json();
        setAnniversaries(data);
      }
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUpcomingAnniversaries = () => {
    const today = new Date();
    const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return anniversaries
      .filter(anniversary => {
        const anniversaryDate = new Date(anniversary.date);
        const currentYear = today.getFullYear();
        
        // Set to current year
        anniversaryDate.setFullYear(currentYear);
        
        // If anniversary date has passed this year, check next year
        if (anniversaryDate < today) {
          anniversaryDate.setFullYear(currentYear + 1);
        }
        
        return anniversaryDate >= today && anniversaryDate <= next90Days;
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

  const upcomingAnniversaries = getUpcomingAnniversaries();

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
            <span>Yaklaşan Yıldönümleri</span>
          </CardTitle>
          <CardDescription>
            Önümüzdeki 90 gün içindeki özel günler
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Yıldönümlerini görüntülemek için giriş yapın</p>
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
            <Calendar className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Yaklaşan Yıldönümleri</span>
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
        <CardTitle className="flex items-center space-x-2">
          <Calendar className={`h-5 w-5 ${
            theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
          }`} />
          <span>Yaklaşan Yıldönümleri</span>
        </CardTitle>
        <CardDescription>
          Önümüzdeki 90 gün içindeki özel günler
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {upcomingAnniversaries.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Yaklaşan yıldönümü bulunmuyor</p>
            <p className="text-gray-400 text-xs mt-1">Yeni yıldönümü ekleyerek başlayın</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {upcomingAnniversaries.map((anniversary) => {
              const daysUntil = getDaysUntilAnniversary(anniversary.date);
              const anniversaryDate = new Date(anniversary.date);
              const currentYear = new Date().getFullYear();
              anniversaryDate.setFullYear(currentYear);
              
              if (anniversaryDate < new Date()) {
                anniversaryDate.setFullYear(currentYear + 1);
              }
              
              return (
                <div key={anniversary.id} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      theme === 'green-theme' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{anniversary.title}</p>
                      <p className="text-sm text-gray-600">
                        {anniversaryDate.toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{daysUntil} gün</span>
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
