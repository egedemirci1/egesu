'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, Compass, Star, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CITIES } from '@/constants/cities';
import { Carousel } from '@/components/ui/carousel';
import { useAuth } from '@/lib/auth';

interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  city_code: string;
  created_at: string;
  media: any[];
}

interface CitySuggestionsProps {
  className?: string;
}

export function CitySuggestions({ className = '' }: CitySuggestionsProps) {
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

  const getVisitedCities = () => {
    const visitedCityCodes = new Set(memories.map(memory => memory.city_code));
    return Array.from(visitedCityCodes);
  };

  const getUnvisitedCities = () => {
    const visitedCityCodes = getVisitedCities();
    const unvisitedCities = CITIES.filter(city => 
      !visitedCityCodes.includes(city.code.toString())
    );
    
    // Rastgele 3 şehir seç
    const shuffled = unvisitedCities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const getCitySuggestions = () => {
    const unvisitedCities = getUnvisitedCities();
    
    // Her şehir için özel öneriler ekle
    return unvisitedCities.map(city => {
      let suggestion = '';
      let icon = <MapPin className="h-4 w-4" />;
      
      // Şehir bazlı öneriler
      switch (city.name) {
        case 'İstanbul':
          suggestion = 'Boğaz manzarası ve tarihi yarımada';
          icon = <Star className="h-4 w-4" />;
          break;
        case 'Antalya':
          suggestion = 'Turkuaz deniz ve antik şehirler';
          icon = <Compass className="h-4 w-4" />;
          break;
        case 'Kapadokya':
          suggestion = 'Peri bacaları ve balon turu';
          icon = <Plane className="h-4 w-4" />;
          break;
        case 'Pamukkale':
          suggestion = 'Beyaz travertenler ve termal sular';
          icon = <Compass className="h-4 w-4" />;
          break;
        case 'Bodrum':
          suggestion = 'Mavi yolculuk ve antik tiyatro';
          icon = <Compass className="h-4 w-4" />;
          break;
        case 'Çanakkale':
          suggestion = 'Tarihi savaş alanları ve Truva';
          icon = <Star className="h-4 w-4" />;
          break;
        case 'Safranbolu':
          suggestion = 'Osmanlı evleri ve geleneksel mimari';
          icon = <Star className="h-4 w-4" />;
          break;
        case 'Amasra':
          suggestion = 'Karadeniz\'in incisi ve tarihi kale';
          icon = <Compass className="h-4 w-4" />;
          break;
        default:
          suggestion = 'Keşfedilmeyi bekleyen güzellikler';
          icon = <MapPin className="h-4 w-4" />;
      }
      
      return {
        ...city,
        suggestion,
        icon
      };
    });
  };

  const citySuggestions = getCitySuggestions();

  if (!isAuthenticated) {
    return (
      <Card className={`bg-white/60 backdrop-blur-sm h-full flex flex-col ${
        theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
      } ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Şehir Önerileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Giriş yapın</p>
            <p className="text-gray-400 text-xs mt-1">Şehir önerilerini görmek için</p>
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
            <MapPin className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Şehir Önerileri</span>
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
            <MapPin className={`h-5 w-5 ${
              theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
            }`} />
            <span>Şehir Önerileri</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/cities'}
            className="text-xs"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Tüm Şehirler
          </Button>
        </CardTitle>
        <CardDescription>
          Henüz gezmediğiniz şehirler
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {citySuggestions.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col justify-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Tüm şehirleri gezmişsiniz!</p>
            <p className="text-gray-400 text-xs mt-1">Tebrikler, Türkiye\'yi keşfetmişsiniz</p>
            <Badge variant="secondary" className="mt-2">
              <Star className="h-3 w-3 mr-1" />
              Tamamlandı!
            </Badge>
          </div>
        ) : (
          <div className="flex-1">
            <Carousel
              items={citySuggestions.map((city) => (
                <div key={city.code} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors cursor-pointer h-full"
                     onClick={() => window.location.href = '/cities'}>
                  <div className="flex items-start space-x-3 h-full">
                    <div className={`p-2 rounded-full ${
                      theme === 'green-theme' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      {city.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800 text-sm">{city.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {city.code}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        {city.suggestion}
                      </p>
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Şehir için anı ekleme sayfasına yönlendir
                            window.location.href = `/?city=${city.code}`;
                          }}
                        >
                          <Plane className="h-3 w-3 mr-1" />
                          Anı Ekle
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              autoPlay={true}
              autoPlayInterval={5000}
              className="h-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
