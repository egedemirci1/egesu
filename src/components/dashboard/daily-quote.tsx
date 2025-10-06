'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, RefreshCw, Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface DailyQuoteProps {
  className?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export function DailyQuote({ className = '' }: DailyQuoteProps) {
  const { theme } = useTheme();
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const quotes = [
    { text: "Aşk, iki kişinin birlikte büyümesidir.", author: "EgEsu" },
    { text: "Her anı, gelecekteki mutluluğunuzun tohumudur.", author: "EgEsu" },
    { text: "Birlikte yaşanan her gün, yeni bir maceradır.", author: "EgEsu" },
    { text: "Sevgi, en güzel anıları yaratır.", author: "EgEsu" },
    { text: "Birlikte geçirilen zaman, en değerli hazinedir.", author: "EgEsu" },
    { text: "Her fotoğraf, bir hikayenin başlangıcıdır.", author: "EgEsu" },
    { text: "Aşk, iki kalbin tek bir ritimde atmasıdır.", author: "EgEsu" },
    { text: "Birlikte gülmek, en güzel müzikdir.", author: "EgEsu" },
    { text: "Her şehir, yeni bir anı demektir.", author: "EgEsu" },
    { text: "Sevgi, en güzel yolculuğun adıdır.", author: "EgEsu" }
  ];

  useEffect(() => {
    loadDailyContent();
  }, []);

  const loadDailyContent = () => {
    setIsLoading(true);
    
    // Günlük söz seçimi (tarihe göre sabit)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const selectedQuote = quotes[dayOfYear % quotes.length];
    
    setQuote(selectedQuote.text);
    setAuthor(selectedQuote.author);
    
    // Mock hava durumu (gerçek API entegrasyonu için OpenWeatherMap kullanılabilir)
    const mockWeather = {
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30 arası
      condition: ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Karlı'][Math.floor(Math.random() * 4)],
      icon: ['sun', 'cloud', 'rain', 'snow'][Math.floor(Math.random() * 4)]
    };
    
    setWeather(mockWeather);
    setIsLoading(false);
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloud':
        return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-4 w-4 text-blue-300" />;
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Quote className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günlük Söz</span>
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
    <Card className={`bg-white/60 backdrop-blur-sm ${
      theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
    } ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Quote className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Günlük Söz</span>
          </div>
          <div className="flex items-center space-x-2">
            {weather && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                {getWeatherIcon(weather.icon)}
                <span>{weather.temperature}°C</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadDailyContent}
              className="p-1 h-6 w-6"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Bugün için özel bir söz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <blockquote className="text-gray-700 italic text-sm leading-relaxed mb-3">
            "{quote}"
          </blockquote>
          <cite className="text-gray-500 text-xs">
            — {author}
          </cite>
        </div>
        
        {weather && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Bugün</span>
              {getWeatherIcon(weather.icon)}
              <span>{weather.condition}</span>
              <Badge variant="outline" className="text-xs">
                {weather.temperature}°C
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
