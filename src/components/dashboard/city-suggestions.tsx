'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Plane, Compass, Star, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { CITIES } from '@/constants/cities';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchMemories();
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  // Otomatik slider
  useEffect(() => {
    const citySuggestions = getCitySuggestions();
    if (citySuggestions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % citySuggestions.length);
      }, 3000); // 3 saniyede bir değiştir
      return () => clearInterval(interval);
    }
  }, [memories]);

  const fetchMemories = async () => {
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
    
    // Sadece 3 şehir seç
    const selectedCities = unvisitedCities.slice(0, 3);
    
    // Her şehir için özel öneriler ekle
    return selectedCities.map(city => {
      let suggestion = '';
      let icon = <MapPin className="h-4 w-4" />;
      
      // Şehir bazlı öneriler
      switch (city.name) {
        case 'Adana': suggestion = 'Kebap ve Taş Köprü'; icon = <Star className="h-4 w-4" />; break;
        case 'Adıyaman': suggestion = 'Nemrut Dağı'; icon = <Star className="h-4 w-4" />; break;
        case 'Afyonkarahisar': suggestion = 'Termal kaynaklar ve sucuk'; icon = <Compass className="h-4 w-4" />; break;
        case 'Ağrı': suggestion = 'Ağrı Dağı ve İshak Paşa'; icon = <Star className="h-4 w-4" />; break;
        case 'Amasya': suggestion = 'Kral kaya mezarları'; icon = <Star className="h-4 w-4" />; break;
        case 'Ankara': suggestion = 'Başkent ve Anıtkabir'; icon = <Star className="h-4 w-4" />; break;
        case 'Antalya': suggestion = 'Turkuaz deniz'; icon = <Compass className="h-4 w-4" />; break;
        case 'Artvin': suggestion = 'Yeşil doğa'; icon = <Compass className="h-4 w-4" />; break;
        case 'Aydın': suggestion = 'Efes Antik Kenti'; icon = <Star className="h-4 w-4" />; break;
        case 'Balıkesir': suggestion = 'Ayvalık ve Cunda'; icon = <Compass className="h-4 w-4" />; break;
        case 'Bilecik': suggestion = 'Osmanlı\'nın doğuşu'; icon = <Star className="h-4 w-4" />; break;
        case 'Bingöl': suggestion = 'Karlıova ve doğa'; icon = <Compass className="h-4 w-4" />; break;
        case 'Bitlis': suggestion = 'Nemrut Krater Gölü'; icon = <Star className="h-4 w-4" />; break;
        case 'Bolu': suggestion = 'Abant Gölü'; icon = <Compass className="h-4 w-4" />; break;
        case 'Burdur': suggestion = 'Salda Gölü'; icon = <Compass className="h-4 w-4" />; break;
        case 'Bursa': suggestion = 'Uludağ ve İskender'; icon = <Star className="h-4 w-4" />; break;
        case 'Çanakkale': suggestion = 'Şehitler Abidesi'; icon = <Star className="h-4 w-4" />; break;
        case 'Çankırı': suggestion = 'Tuz Mağarası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Çorum': suggestion = 'Hitit başkenti'; icon = <Star className="h-4 w-4" />; break;
        case 'Denizli': suggestion = 'Pamukkale travertenleri'; icon = <Star className="h-4 w-4" />; break;
        case 'Diyarbakır': suggestion = 'Surlar ve karpuz'; icon = <Star className="h-4 w-4" />; break;
        case 'Edirne': suggestion = 'Selimiye Camii'; icon = <Star className="h-4 w-4" />; break;
        case 'Elazığ': suggestion = 'Harput Kalesi'; icon = <Star className="h-4 w-4" />; break;
        case 'Erzincan': suggestion = 'Girlevik Şelalesi'; icon = <Compass className="h-4 w-4" />; break;
        case 'Erzurum': suggestion = 'Çifte Minareler'; icon = <Star className="h-4 w-4" />; break;
        case 'Eskişehir': suggestion = 'Odunpazarı evleri'; icon = <Star className="h-4 w-4" />; break;
        case 'Gaziantep': suggestion = 'Baklava ve kebap'; icon = <Star className="h-4 w-4" />; break;
        case 'Giresun': suggestion = 'Fındık ve Adası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Gümüşhane': suggestion = 'Karaca Mağarası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Hakkari': suggestion = 'Cilo Dağları'; icon = <Compass className="h-4 w-4" />; break;
        case 'Hatay': suggestion = 'Künefe ve mozaik'; icon = <Star className="h-4 w-4" />; break;
        case 'Isparta': suggestion = 'Gül ve lavanta'; icon = <Compass className="h-4 w-4" />; break;
        case 'Mersin': suggestion = 'Kızkalesi'; icon = <Compass className="h-4 w-4" />; break;
        case 'İstanbul': suggestion = 'Boğaz ve tarihi yarımada'; icon = <Star className="h-4 w-4" />; break;
        case 'İzmir': suggestion = 'Kordon ve Efes'; icon = <Star className="h-4 w-4" />; break;
        case 'Kars': suggestion = 'Ani Harabeleri'; icon = <Star className="h-4 w-4" />; break;
        case 'Kastamonu': suggestion = 'Tarihi evler'; icon = <Star className="h-4 w-4" />; break;
        case 'Kayseri': suggestion = 'Erciyes ve mantı'; icon = <Star className="h-4 w-4" />; break;
        case 'Kırklareli': suggestion = 'Dupnisa Mağarası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Kırşehir': suggestion = 'Cacabey Camii'; icon = <Star className="h-4 w-4" />; break;
        case 'Kocaeli': suggestion = 'Kartepe'; icon = <Compass className="h-4 w-4" />; break;
        case 'Konya': suggestion = 'Mevlana ve Sema'; icon = <Star className="h-4 w-4" />; break;
        case 'Kütahya': suggestion = 'Çini sanatı'; icon = <Star className="h-4 w-4" />; break;
        case 'Malatya': suggestion = 'Kayısı'; icon = <Compass className="h-4 w-4" />; break;
        case 'Manisa': suggestion = 'Sardes Antik Kenti'; icon = <Star className="h-4 w-4" />; break;
        case 'Kahramanmaraş': suggestion = 'Dondurma'; icon = <Compass className="h-4 w-4" />; break;
        case 'Mardin': suggestion = 'Taş evler'; icon = <Star className="h-4 w-4" />; break;
        case 'Muğla': suggestion = 'Bodrum ve Marmaris'; icon = <Compass className="h-4 w-4" />; break;
        case 'Muş': suggestion = 'Malazgirt'; icon = <Star className="h-4 w-4" />; break;
        case 'Nevşehir': suggestion = 'Kapadokya peri bacaları'; icon = <Star className="h-4 w-4" />; break;
        case 'Niğde': suggestion = 'Aladağlar'; icon = <Compass className="h-4 w-4" />; break;
        case 'Ordu': suggestion = 'Fındık'; icon = <Compass className="h-4 w-4" />; break;
        case 'Rize': suggestion = 'Çay'; icon = <Compass className="h-4 w-4" />; break;
        case 'Sakarya': suggestion = 'Sapanca Gölü'; icon = <Compass className="h-4 w-4" />; break;
        case 'Samsun': suggestion = 'Atatürk\'ün çıkartma yeri'; icon = <Star className="h-4 w-4" />; break;
        case 'Siirt': suggestion = 'Büryan kebap'; icon = <Compass className="h-4 w-4" />; break;
        case 'Sinop': suggestion = 'Tarihi liman'; icon = <Compass className="h-4 w-4" />; break;
        case 'Sivas': suggestion = 'Divriği Camii'; icon = <Star className="h-4 w-4" />; break;
        case 'Tekirdağ': suggestion = 'Rakı ve köfte'; icon = <Compass className="h-4 w-4" />; break;
        case 'Tokat': suggestion = 'Ballıca Mağarası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Trabzon': suggestion = 'Sümela Manastırı'; icon = <Star className="h-4 w-4" />; break;
        case 'Tunceli': suggestion = 'Munzur Vadisi'; icon = <Compass className="h-4 w-4" />; break;
        case 'Şanlıurfa': suggestion = 'Göbeklitepe'; icon = <Star className="h-4 w-4" />; break;
        case 'Uşak': suggestion = 'Karun Hazinesi'; icon = <Star className="h-4 w-4" />; break;
        case 'Van': suggestion = 'Van Gölü'; icon = <Compass className="h-4 w-4" />; break;
        case 'Yozgat': suggestion = 'Çapanoğlu Camii'; icon = <Star className="h-4 w-4" />; break;
        case 'Zonguldak': suggestion = 'Kömür madenleri'; icon = <Compass className="h-4 w-4" />; break;
        case 'Aksaray': suggestion = 'İhlara Vadisi'; icon = <Compass className="h-4 w-4" />; break;
        case 'Bayburt': suggestion = 'Baksı Müzesi'; icon = <Star className="h-4 w-4" />; break;
        case 'Karaman': suggestion = 'Karamanoğlu Camii'; icon = <Star className="h-4 w-4" />; break;
        case 'Kırıkkale': suggestion = 'Kızılırmak'; icon = <Compass className="h-4 w-4" />; break;
        case 'Batman': suggestion = 'Hasankeyf'; icon = <Star className="h-4 w-4" />; break;
        case 'Şırnak': suggestion = 'Cudi Dağı'; icon = <Compass className="h-4 w-4" />; break;
        case 'Bartın': suggestion = 'Amasra'; icon = <Compass className="h-4 w-4" />; break;
        case 'Ardahan': suggestion = 'Çıldır Gölü'; icon = <Compass className="h-4 w-4" />; break;
        case 'Iğdır': suggestion = 'Ağrı Dağı manzarası'; icon = <Compass className="h-4 w-4" />; break;
        case 'Yalova': suggestion = 'Termal kaplıcalar'; icon = <Compass className="h-4 w-4" />; break;
        case 'Karabük': suggestion = 'Safranbolu'; icon = <Star className="h-4 w-4" />; break;
        case 'Kilis': suggestion = 'Katmer'; icon = <Compass className="h-4 w-4" />; break;
        case 'Osmaniye': suggestion = 'Karatepe'; icon = <Star className="h-4 w-4" />; break;
        case 'Düzce': suggestion = 'Efteni Gölü'; icon = <Compass className="h-4 w-4" />; break;
        default: suggestion = 'Güzel şehir'; icon = <MapPin className="h-4 w-4" />; break;
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
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex items-center">
              {citySuggestions.length > 0 && (
                <div className="w-full p-2 rounded bg-white/40 hover:bg-white/60 transition-all duration-500 cursor-pointer"
                     onClick={() => window.location.href = '/cities'}>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-full ${
                      theme === 'green-theme' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-pink-100 text-pink-600'
                    }`}>
                      {citySuggestions[currentIndex].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 text-xs">{citySuggestions[currentIndex].name}</h4>
                        <Badge variant="outline" className="text-xs px-1 py-0.5">
                          {citySuggestions[currentIndex].code}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs leading-tight mt-0.5">
                        {citySuggestions[currentIndex].suggestion}
                      </p>
                    </div>
                  </div>
                  {citySuggestions.length > 1 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {citySuggestions.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentIndex 
                              ? `w-4 ${theme === 'green-theme' ? 'bg-green-600' : 'bg-pink-600'}`
                              : 'w-1 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
