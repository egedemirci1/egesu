'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Heart, Sparkles } from 'lucide-react';

interface ThemeSelectorProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

const themes = [
  {
    id: 'green',
    name: 'Yeşil Aşk',
    colors: {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-green-100 to-emerald-100',
      accent: 'text-green-600',
      bg: 'from-green-100 via-emerald-50 to-teal-100'
    },
    icon: <Heart className="h-4 w-4" />
  },
  {
    id: 'pink',
    name: 'Pembe Tutku',
    colors: {
      primary: 'from-pink-500 to-rose-500',
      secondary: 'from-pink-100 to-rose-100',
      accent: 'text-pink-600',
      bg: 'from-pink-100 via-rose-50 to-purple-100'
    },
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    id: 'purple',
    name: 'Mor Büyü',
    colors: {
      primary: 'from-purple-500 to-violet-500',
      secondary: 'from-purple-100 to-violet-100',
      accent: 'text-purple-600',
      bg: 'from-purple-100 via-violet-50 to-indigo-100'
    },
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    id: 'blue',
    name: 'Mavi Huzur',
    colors: {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-blue-100 to-cyan-100',
      accent: 'text-blue-600',
      bg: 'from-blue-100 via-cyan-50 to-teal-100'
    },
    icon: <Heart className="h-4 w-4" />
  }
];

export function ThemeSelector({ onThemeChange, currentTheme }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeData = themes.find(theme => theme.id === currentTheme) || themes[0];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 px-2 py-1"
      >
        <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline text-xs sm:text-sm">{currentThemeData.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 p-1 sm:p-2 min-w-[150px] sm:min-w-[200px] z-50">
          <div className="space-y-1">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all duration-300 hover:bg-white/50 ${
                  currentTheme === theme.id ? 'bg-white/70' : ''
                }`}
              >
                <div className={`p-0.5 sm:p-1 rounded-full bg-gradient-to-r ${theme.colors.primary}`}>
                  <div className="text-white">
                    {theme.icon}
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">{theme.name}</span>
                {currentTheme === theme.id && (
                  <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
