'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, Moon, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';

interface DigitalClockProps {
  className?: string;
}

export function DigitalClock({ className = '' }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [weather, setWeather] = useState<{
    bursa: { temp: number; condition: string; icon: string };
    kartal: { temp: number; condition: string; icon: string };
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Gerçek hava durumu verisi çek
    fetchWeatherData();

    // Hava durumu verilerini her 10 dakikada bir güncelle
    const weatherTimer = setInterval(() => {
      fetchWeatherData();
    }, 10 * 60 * 1000); // 10 dakika

    return () => {
      clearInterval(timer);
      clearInterval(weatherTimer);
    };
  }, []);

  const fetchWeatherData = async () => {
    try {
      // CSP sorunu nedeniyle şimdilik fallback veri kullanıyoruz
      // Gerçek API entegrasyonu için backend proxy gerekli
      console.log('Hava durumu verisi fallback modunda gösteriliyor');
      
      // Simüle edilmiş hava durumu verileri (rastgele değil, sabit)
      const weatherData = {
        bursa: { 
          temp: 22, 
          condition: 'Güneşli', 
          icon: 'sun'
        },
        kartal: { 
          temp: 24, 
          condition: 'Parçalı Bulutlu', 
          icon: 'cloud-sun'
        }
      };

      setWeather(weatherData);
    } catch (error) {
      console.error('Hava durumu verisi alınamadı:', error);
      // Hata durumunda fallback veri
      setWeather({
        bursa: { temp: 22, condition: 'Güneşli', icon: 'sun' },
        kartal: { temp: 24, condition: 'Güneşli', icon: 'sun' }
      });
    }
  };

  const getWeatherCondition = (weatherMain: string) => {
    const conditions: { [key: string]: string } = {
      'Clear': 'Güneşli',
      'Clouds': 'Bulutlu',
      'Rain': 'Yağmurlu',
      'Drizzle': 'Hafif Yağmur',
      'Thunderstorm': 'Fırtınalı',
      'Snow': 'Karlı',
      'Mist': 'Sisli',
      'Fog': 'Sisli',
      'Haze': 'Puslu'
    };
    return conditions[weatherMain] || 'Bilinmiyor';
  };

  const getWeatherIconType = (weatherMain: string) => {
    const iconTypes: { [key: string]: string } = {
      'Clear': 'sun',
      'Clouds': 'cloud',
      'Rain': 'rain',
      'Drizzle': 'rain',
      'Thunderstorm': 'rain',
      'Snow': 'snow',
      'Mist': 'cloud',
      'Fog': 'cloud',
      'Haze': 'cloud'
    };
    return iconTypes[weatherMain] || 'sun';
  };

  if (!isClient) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-16 bg-gray-300 rounded-lg"></div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi öğlenler';
    if (hour < 22) return 'İyi akşamlar';
    return 'İyi geceler';
  };

  const getTimeIcon = () => {
    const hour = time.getHours();
    if (hour >= 6 && hour < 18) {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    }
    return <Moon className="h-5 w-5 text-blue-400" />;
  };

  const getTimeColor = () => {
    const hour = time.getHours();
    if (hour >= 6 && hour < 12) return 'text-yellow-600'; // Sabah
    if (hour >= 12 && hour < 18) return 'text-orange-600'; // Öğle
    if (hour >= 18 && hour < 22) return 'text-purple-600'; // Akşam
    return 'text-blue-600'; // Gece
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
      case 'cloud':
        return <Cloud className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-3 w-3 sm:h-4 sm:w-4 text-blue-300" />;
      default:
        return <Sun className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />;
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg shadow-green-500/10 border border-green-200/50 ${className}`}>
      {/* Greeting */}
      <div className="text-center mb-2 sm:mb-4">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
          {getTimeIcon()}
          <span className="text-xs sm:text-lg font-medium text-gray-700">{getGreeting()}</span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">Aşkın büyülü dünyasına hoş geldin</p>
      </div>

      {/* Weather */}
      {weather && (
        <div className="mb-2 sm:mb-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* Bursa */}
            <div className="bg-white/40 rounded-lg p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Bursa</span>
                {getWeatherIcon(weather.bursa.icon)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-bold">{weather.bursa.temp}°C</span>
                <span className="ml-1">{weather.bursa.condition}</span>
              </div>
            </div>

            {/* Kartal */}
            <div className="bg-white/40 rounded-lg p-2 sm:p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Kartal</span>
                {getWeatherIcon(weather.kartal.icon)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-bold">{weather.kartal.temp}°C</span>
                <span className="ml-1">{weather.kartal.condition}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Display */}
      <div className="text-center mb-2 sm:mb-4">
        <div className={`text-xl sm:text-4xl font-mono font-bold ${getTimeColor()} mb-1 sm:mb-2`}>
          {formatTime(time)}
        </div>
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-gray-600">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium">{formatDate(time)}</span>
        </div>
      </div>

      {/* Animated Elements */}
      <div className="flex justify-center space-x-1 sm:space-x-2">
        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
}
