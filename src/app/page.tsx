'use client';

import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Calendar } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Dashboard components
import { UpcomingAnniversaries } from '@/components/dashboard/upcoming-anniversaries';
import { RecentLetters } from '@/components/dashboard/recent-letters';
import { MemoryAnniversaries } from '@/components/dashboard/memory-anniversaries';
import { CitySuggestions } from '@/components/dashboard/city-suggestions';
import { Stats } from '@/components/dashboard/stats';
import { SongOfDay } from '@/components/dashboard/song-of-day';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Dashboard';
}

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'green-theme' 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'bg-gradient-to-br from-pink-50 to-purple-50'
    }`}>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            Hoş Geldin! EgEsu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Aşk Hikayenizin Merkezi
          </p>
        </div>


        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mobilde: Anı Yıldönümleri En Üstte */}
          <div className="lg:hidden">
            <MemoryAnniversaries />
          </div>

          {/* Sol Kolon */}
          <div className="space-y-6 flex flex-col">
            <div className="flex-1">
              <UpcomingAnniversaries />
            </div>
            <div className="flex-1">
              <RecentLetters />
            </div>
          </div>

          {/* Orta Kolon */}
          <div className="space-y-6 flex flex-col">
            {/* Desktop'ta Anı Yıldönümleri */}
            <div className="hidden lg:block flex-1">
              <MemoryAnniversaries />
            </div>
            <div className="flex-1">
              <CitySuggestions />
            </div>
          </div>

          {/* Sağ Kolon */}
          <div className="space-y-6 flex flex-col">
            <div className="flex-1">
              <SongOfDay />
            </div>
            <div className="flex-1">
              <Stats />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/letters'}
              className="px-6 py-3"
            >
              <Heart className="h-5 w-5 mr-2" />
              Mektup Yaz
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/anniversaries'}
              className="px-6 py-3"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Yıldönümü Ekle
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}