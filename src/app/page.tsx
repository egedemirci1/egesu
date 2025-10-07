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
import { MovieOfDay } from '@/components/dashboard/movie-of-day';

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


        {/* Dashboard Grid - 2 satır 3 sütun + 3. sütun 3 satır */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mobilde: Tek sütun */}
          <div className="lg:hidden space-y-6">
            <MovieOfDay />
            <MemoryAnniversaries />
            <SongOfDay />
            <UpcomingAnniversaries />
            <RecentLetters />
            <CitySuggestions />
            <Stats />
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:contents">
            {/* Sol Kolon - 2 satır */}
            <div className="flex flex-col gap-6 h-[680px]">
              <div className="flex-1">
                <SongOfDay />
              </div>
              <div className="flex-1">
                <MemoryAnniversaries />
              </div>
            </div>

            {/* Orta Kolon - 2 satır */}
            <div className="flex flex-col gap-6 h-[680px]">
              <div className="flex-1">
                <MovieOfDay />
              </div>
              <div className="flex-1">
                <UpcomingAnniversaries />
              </div>
            </div>

            {/* Sağ Kolon - 3 satır */}
            <div className="flex flex-col gap-6 h-[680px]">
              <div className="flex-1">
                <CitySuggestions />
              </div>
              <div className="flex-1">
                <RecentLetters />
              </div>
              <div className="flex-1">
                <Stats />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}