'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Heart, MapPin, Mail, Image, Calendar, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface StatsProps {
  className?: string;
}

interface StatsData {
  totalMemories: number;
  totalLetters: number;
  totalAnniversaries: number;
  visitedCities: number;
  totalCities: number;
  recentMemories: number;
}

export function Stats({ className = '' }: StatsProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalMemories: 0,
    totalLetters: 0,
    totalAnniversaries: 0,
    visitedCities: 0,
    totalCities: 81,
    recentMemories: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const [memoriesRes, lettersRes, anniversariesRes] = await Promise.all([
        fetch('/api/memories'),
        fetch('/api/letters'),
        fetch('/api/anniversaries')
      ]);

      const [memories, letters, anniversaries] = await Promise.all([
        memoriesRes.ok ? memoriesRes.json() : [],
        lettersRes.ok ? lettersRes.json() : [],
        anniversariesRes.ok ? anniversariesRes.json() : []
      ]);

      // Ziyaret edilen şehirleri hesapla
      const visitedCityCodes = new Set(memories.map((memory: any) => memory.city_code));
      
      // Son 30 gün içindeki anıları hesapla
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentMemories = memories.filter((memory: any) => 
        new Date(memory.date) >= thirtyDaysAgo
      ).length;

      setStats({
        totalMemories: memories.length,
        totalLetters: letters.length,
        totalAnniversaries: anniversaries.length,
        visitedCities: visitedCityCodes.size,
        totalCities: 81,
        recentMemories
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  if (!isAuthenticated) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>İstatistikler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">İstatistikleri görmek için</p>
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
            <BarChart3 className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>İstatistikler</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
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
          <BarChart3 className={`h-5 w-5 ${
            theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
          }`} />
          <span>İstatistikler</span>
        </CardTitle>
        <CardDescription>
          Aşk hikayenizin sayıları
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="text-center p-3 rounded-lg bg-white/40">
            <div className="flex items-center justify-center mb-2">
              <Image className={`h-4 w-4 ${
                theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalMemories}</div>
            <div className="text-xs text-gray-600">Toplam Anı</div>
            {stats.recentMemories > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                +{stats.recentMemories} bu ay
              </Badge>
            )}
          </div>

          <div className="text-center p-3 rounded-lg bg-white/40">
            <div className="flex items-center justify-center mb-2">
              <Mail className={`h-4 w-4 ${
                theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalLetters}</div>
            <div className="text-xs text-gray-600">Mektup</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/40">
            <div className="flex items-center justify-center mb-2">
              <Heart className={`h-4 w-4 ${
                theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalAnniversaries}</div>
            <div className="text-xs text-gray-600">Yıldönümü</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-white/40">
            <div className="flex items-center justify-center mb-2">
              <MapPin className={`h-4 w-4 ${
                theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.visitedCities}</div>
            <div className="text-xs text-gray-600">Şehir</div>
            <div className="text-xs text-gray-500 mt-1">
              {getProgressPercentage(stats.visitedCities, stats.totalCities)}% tamamlandı
            </div>
          </div>
        </div>

        {/* Şehir ilerleme çubuğu */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Türkiye Keşfi</span>
            <span>{stats.visitedCities}/{stats.totalCities}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                theme === 'green-theme' ? 'bg-green-500' : 'bg-pink-500'
              }`}
              style={{ width: `${getProgressPercentage(stats.visitedCities, stats.totalCities)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
