'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Clock, Film, Eye, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

interface Movie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

interface MovieOfDayProps {
  className?: string;
}

export function MovieOfDay({ className = '' }: MovieOfDayProps) {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMovieOfDay();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchMovieOfDay = async () => {
    try {
      setLoading(true);
      setError('');

      // OMDb API'den günün filmi için rastgele bir film al
      const response = await fetch('/api/movie-of-day', { credentials: 'include' });
      const data = await response.json();

      if (response.ok) {
        setMovie(data);
      } else {
        setError(data.error || 'Film yüklenemedi');
      }
    } catch (err) {
      setError('Film yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return 'text-green-600';
    if (numRating >= 7) return 'text-yellow-600';
    if (numRating >= 6) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isAuthenticated) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Film Önerisi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Film className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Film önerilerini görmek için</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Film Önerisi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Film yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Film Önerisi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchMovieOfDay} variant="outline" size="sm">
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!movie) return null;

  return (
    <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
      theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
    } ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günün Film Önerisi</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMovieOfDay}
              className="text-xs hover:bg-gray-100"
              title="Yeni film seç"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`, '_blank')}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              IMDb'de İncele
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Bugün bunu izleyelim
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-3 h-full flex flex-col">
          {/* Film Posteri - Daha küçük */}
          <div className="relative flex-shrink-0">
            <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <Image
                  src={movie.Poster}
                  alt={movie.Title}
                  width={200}
                  height={96}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center text-gray-500" style={{ display: movie.Poster && movie.Poster !== 'N/A' ? 'none' : 'flex' }}>
                <Film className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
              <Button
                onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`, '_blank')}
                size="sm"
                className={`${
                  theme === 'green-theme' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-pink-500 hover:bg-pink-600'
                } text-white text-xs px-2 py-1`}
              >
                <Play className="h-3 w-3 mr-1" />
                İncele
              </Button>
            </div>
          </div>

          {/* Film Bilgileri - Kompakt */}
          <div className="space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-medium text-gray-800 text-sm leading-tight">{movie.Title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <span>{movie.Year}</span>
                <span>•</span>
                <span>{movie.Runtime}</span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${getRatingColor(movie.imdbRating)}`}>
                  <Star className="h-3 w-3" />
                  {movie.imdbRating}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                theme === 'green-theme' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                {movie.Genre.split(',')[0]}
              </span>
              <span className="text-xs text-gray-500">
                Bugün
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
