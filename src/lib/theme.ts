'use client';

import { useEffect, useState } from 'react';

export type Theme = 'green-theme' | 'pink-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('green-theme');

  useEffect(() => {
    // LocalStorage'dan tema tercihini oku
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      // Default olarak yeşil tema
      setTheme('green-theme');
      document.documentElement.className = 'green-theme';
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme;
  };

  return { theme, changeTheme };
}
