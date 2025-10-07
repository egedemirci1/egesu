'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CITIES } from '@/constants/cities';
import { MapPin, Heart, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Şehirler';
}

interface Memory {
  id: string;
  title: string;
  date: string;
  city_code: number;
}

export default function CitiesPage() {
  const { theme } = useTheme();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/memories', { credentials: 'include' });
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

  const visitedCities = new Set(memories.map(memory => memory.city_code).filter(Boolean));
  const visitedCount = visitedCities.size;

  const getCityMemories = (cityCode: number) => {
    return memories.filter(memory => memory.city_code === cityCode);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'green-theme' 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'bg-gradient-to-br from-pink-50 to-purple-50'
    }`}>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            Şehirlerimiz
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Aşkımla Gezdiğimiz Şehirler
          </p>
          
          <div className={`bg-white/60 backdrop-blur-sm rounded-lg p-6 inline-block border ${
            theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
          }`}>
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <MapPin className={`h-6 w-6 ${
                  theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                }`} />
                <div className="flex items-center space-x-2">
                  <Loader2 className={`h-5 w-5 animate-spin ${
                    theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                  }`} />
                  <span className="text-lg font-medium text-gray-600">Şehirler hesaplanıyor...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <MapPin className={`h-6 w-6 ${
                  theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                }`} />
                <span className="text-2xl font-bold text-gray-800">
                  {visitedCount}/81
                </span>
                <span className="text-gray-600">şehir ziyaret edildi</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Card key={i} className="bg-white/60 border-gray-200 animate-pulse">
                <CardHeader className="p-3">
                  <CardTitle className="text-center text-sm font-medium">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CITIES.map((city) => {
              const isVisited = visitedCities.has(city.code);
              const cityMemories = getCityMemories(city.code);
              
              return (
              <Sheet key={city.code}>
                <SheetTrigger asChild>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isVisited 
                        ? theme === 'green-theme'
                          ? 'bg-green-100 border-green-300 hover:bg-green-200'
                          : 'bg-pink-100 border-pink-300 hover:bg-pink-200'
                        : 'bg-white/60 border-gray-200 hover:bg-white/80'
                    }`}
                    onClick={() => {}}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-center text-sm font-medium">
                        <div className="text-lg font-bold text-gray-600">
                          {city.code.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-700 mt-1">
                          {city.name}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 pt-0">
                      {isVisited && (
                        <div className="flex justify-center">
                          <Badge variant="secondary" className={`text-xs ${
                            theme === 'green-theme' 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-pink-200 text-pink-800'
                          }`}>
                            <Heart className="h-3 w-3 mr-1" />
                            Ziyaret Edildi
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </SheetTrigger>
                
                <SheetContent className="w-[800px] sm:w-[1000px] max-w-[95vw] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <MapPin className={`h-5 w-5 ${
                        theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                      }`} />
                      <span>{city.name}</span>
                    </SheetTitle>
                    <SheetDescription>
                      Bu şehirde yaşadığımız anılar
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6">
                    {cityMemories.length > 0 ? (
                      <div className="space-y-4">
                        {cityMemories.map((memory) => (
                          <Card key={memory.id} className="bg-white/60 backdrop-blur-sm">
                            <CardContent className="p-4">
                              <h3 className="font-medium text-gray-800 mb-2">
                                {memory.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(memory.date).toLocaleDateString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Bu şehirde henüz anı yok
                        </p>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
