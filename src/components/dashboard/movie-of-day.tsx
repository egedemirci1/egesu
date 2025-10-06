'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Clock } from 'lucide-react';

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

export function MovieOfDay() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovieOfDay();
  }, []);

  const fetchMovieOfDay = async () => {
    try {
      setLoading(true);
      setError('');

      // OMDb API'den günün filmi için rastgele bir film al
      const response = await fetch('/api/movie-of-day');
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

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-600" />
            Günün Film Önerisi
          </CardTitle>
          <CardDescription>Bugün için özel film önerisi</CardDescription>
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
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-600" />
            Günün Film Önerisi
          </CardTitle>
          <CardDescription>Bugün için özel film önerisi</CardDescription>
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-600" />
          Günün Film Önerisi
        </CardTitle>
        <CardDescription>Bugün için özel film önerisi</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4">
          {/* Film Posteri ve Temel Bilgiler */}
          <div className="flex gap-4">
            <img
              src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.jpg'}
              alt={movie.Title}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight mb-1">{movie.Title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {movie.Year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {movie.Runtime}
                </span>
                <span className="flex items-center gap-1">
                  <Star className={`h-3 w-3 ${getRatingColor(movie.imdbRating)}`} />
                  {movie.imdbRating}/10
                </span>
              </div>
              <p className="text-sm text-gray-500">{movie.Genre}</p>
            </div>
          </div>

          {/* Film Açıklaması */}
          <div>
            <p className="text-sm text-gray-700 line-clamp-3">{movie.Plot}</p>
          </div>

          {/* Yönetmen ve Oyuncular */}
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Yönetmen:</span>
              <span className="ml-1 text-gray-700">{movie.Director}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Oyuncular:</span>
              <span className="ml-1 text-gray-700">{movie.Actors}</span>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => window.open(`https://www.imdb.com/title/${movie.imdbID}`, '_blank')}
            >
              <Play className="h-3 w-3 mr-1" />
              IMDb'de İncele
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={fetchMovieOfDay}
            >
              Yeni Film
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
