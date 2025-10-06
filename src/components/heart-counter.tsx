'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface HeartCounterProps {
  className?: string;
  theme?: string;
}

export function HeartCounter({ className = '', theme = 'green' }: HeartCounterProps) {
  const [loginCount, setLoginCount] = useState(0);

  useEffect(() => {
    // localStorage'dan login sayısını al
    const savedCount = localStorage.getItem('egesu_login_count');
    if (savedCount) {
      setLoginCount(parseInt(savedCount));
    }
  }, []);

  const incrementCounter = () => {
    const newCount = loginCount + 1;
    setLoginCount(newCount);
    localStorage.setItem('egesu_login_count', newCount.toString());
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'pink':
        return {
          gradient: 'from-pink-500 to-rose-500',
          bg: 'bg-pink-100',
          text: 'text-pink-700'
        };
      case 'purple':
        return {
          gradient: 'from-purple-500 to-violet-500',
          bg: 'bg-purple-100',
          text: 'text-purple-700'
        };
      case 'blue':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-100',
          text: 'text-blue-700'
        };
      default:
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-100',
          text: 'text-green-700'
        };
    }
  };

  const colors = getThemeColors();

  const getMessage = () => {
    if (loginCount === 0) return 'İlk girişiniz! 💕';
    if (loginCount < 10) return 'Aşkınız büyüyor! 🌱';
    if (loginCount < 50) return 'Güçlü bir bağ! 💪';
    if (loginCount < 100) return 'Sarsılmaz aşk! 💎';
    if (loginCount < 500) return 'Efsanevi aşk! 👑';
    return 'Sonsuz aşk! ♾️';
  };

  return (
    <div className={`${className} ${colors.bg} rounded-lg p-2 sm:p-3 backdrop-blur-sm border border-white/20`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className={`p-0.5 sm:p-1 rounded-full bg-gradient-to-r ${colors.gradient}`}>
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <div>
            <div className={`text-xs sm:text-sm font-semibold ${colors.text}`}>
              {loginCount} Giriş
            </div>
            <div className="text-xs text-gray-600 hidden sm:block">
              {getMessage()}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-1000`}
            style={{ 
              width: `${Math.min((loginCount % 100) * 1, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Achievement Badges - Desktop Only */}
      {loginCount >= 10 && (
        <div className="mt-2 flex space-x-1 hidden sm:flex">
          {loginCount >= 10 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🥉</span>}
          {loginCount >= 50 && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">🥈</span>}
          {loginCount >= 100 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🥇</span>}
          {loginCount >= 500 && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">💎</span>}
        </div>
      )}
    </div>
  );
}

// Login sayısını artırmak için kullanılacak hook
export function useHeartCounter() {
  const incrementLoginCount = () => {
    const currentCount = parseInt(localStorage.getItem('egesu_login_count') || '0');
    localStorage.setItem('egesu_login_count', (currentCount + 1).toString());
  };

  return { incrementLoginCount };
}
