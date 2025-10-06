'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, Plus, Eye, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface Letter {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

interface RecentLettersProps {
  className?: string;
}

export function RecentLetters({ className = '' }: RecentLettersProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLetters();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchLetters = async () => {
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentLetters = () => {
    return letters
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Az önce';
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} gün önce`;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const recentLetters = getRecentLetters();

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
            <span>Yeni Mektuplar</span>
          </CardTitle>
          <CardDescription>
            Son yazılan mektuplar
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Mektupları görüntülemek için giriş yapın</p>
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
            <Mail className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Yeni Mektuplar</span>
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
            <Mail className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Yeni Mektuplar</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/letters'}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Tümünü Gör
          </Button>
        </CardTitle>
        <CardDescription>
          Son yazılan mektuplar
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {recentLetters.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Henüz mektup yazılmamış</p>
            <p className="text-gray-400 text-xs mt-1">İlk mektubunuzu yazarak başlayın</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.location.href = '/letters'}
            >
              <Plus className="h-3 w-3 mr-1" />
              Mektup Yaz
            </Button>
          </div>
        ) : (
          <div className="space-y-3 flex-1">
            {recentLetters.map((letter) => (
              <div key={letter.id} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors cursor-pointer"
                   onClick={() => window.location.href = '/letters'}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 text-sm">{letter.title}</h4>
                  <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(letter.created_at)}</span>
                  </Badge>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {truncateText(letter.body, 80)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
