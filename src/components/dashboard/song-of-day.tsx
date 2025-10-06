'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Eye, RefreshCw, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface Song {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string;
  category: string;
  created_at: string;
}

interface SongOfDayProps {
  className?: string;
}

export function SongOfDay({ className = '' }: SongOfDayProps) {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songOfDay, setSongOfDay] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchSongs();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
        
        // Günün şarkısını seç
        if (data.length > 0) {
          selectSongOfDay(data);
        }
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSongOfDay = (songList: Song[]) => {
    if (songList.length === 0) return;

    // Bugünün tarihini seed olarak kullanarak deterministik rastgele seçim
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD formatında
    const seed = dateString.split('-').join(''); // YYYYMMDD
    
    // Seed'i kullanarak rastgele indeks hesapla
    const randomIndex = parseInt(seed) % songList.length;
    setSongOfDay(songList[randomIndex]);
  };

  const handleRefreshSong = () => {
    if (songs.length > 0) {
      selectSongOfDay(songs);
    }
  };

  const handlePlaySong = () => {
    if (songOfDay) {
      window.open(songOfDay.youtube_url, '_blank');
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'tumu': 'Tümü',
      'hareketli': 'Hareketli',
      'sakin': 'Sakin',
      'klasik': 'Klasik',
      'romantik': 'Romantik',
      'nostaljik': 'Nostaljik'
    };
    return categoryMap[category] || category;
  };

  if (!isAuthenticated) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Şarkısı</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Şarkı önerilerini görmek için</p>
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
            <Music className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Şarkısı</span>
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
            <Music className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Şarkısı</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshSong}
              className="text-xs hover:bg-gray-100"
              title="Yeni şarkı seç"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/songs'}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Tümünü Gör
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Her gün farklı bir şarkı keşfedin
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!songOfDay ? (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Music className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Henüz şarkı eklenmemiş</p>
            <p className="text-gray-400 text-xs mt-1">İlk şarkınızı ekleyerek başlayın</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.href = '/songs'}
            >
              <Music className="h-3 w-3 mr-1" />
              Şarkı Ekle
            </Button>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {/* Şarkı Thumbnail */}
            <div className="relative">
              <img
                src={songOfDay.thumbnail_url}
                alt={`${songOfDay.title} - ${songOfDay.artist}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <Button
                  onClick={handlePlaySong}
                  size="sm"
                  className={`${
                    theme === 'green-theme' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-pink-500 hover:bg-pink-600'
                  } text-white`}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Dinle
                </Button>
              </div>
            </div>

            {/* Şarkı Bilgileri */}
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-gray-800 text-sm">{songOfDay.title}</h4>
                <p className="text-gray-600 text-xs">{songOfDay.artist}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  theme === 'green-theme' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {getCategoryDisplayName(songOfDay.category)}
                </span>
                <span className="text-xs text-gray-500">
                  Bugün seçildi
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
