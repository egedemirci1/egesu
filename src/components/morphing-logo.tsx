'use client';

import { useState, useEffect } from 'react';
import { Heart, Sparkles, Star, Flower2 } from 'lucide-react';

interface MorphingLogoProps {
  isLoading?: boolean;
  className?: string;
  theme?: string;
}

const icons = [
  { component: Heart, name: 'heart' },
  { component: Sparkles, name: 'sparkles' },
  { component: Star, name: 'star' },
  { component: Flower2, name: 'flower' }
];

export function MorphingLogo({ isLoading = false, className = '', theme = 'green' }: MorphingLogoProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isLoading) {
      // Loading sırasında hızlı morphing
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIconIndex((prev) => (prev + 1) % icons.length);
          setIsAnimating(false);
        }, 150);
      }, 800);
      return () => clearInterval(interval);
    } else {
      // Normal durumda yavaş morphing
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIconIndex((prev) => (prev + 1) % icons.length);
          setIsAnimating(false);
        }, 200);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const CurrentIcon = icons[currentIconIndex].component;

  const getThemeColors = () => {
    switch (theme) {
      case 'pink':
        return {
          gradient: 'from-pink-500 to-rose-500',
          glow: 'shadow-pink-500/50',
          accent: 'text-pink-400'
        };
      case 'purple':
        return {
          gradient: 'from-purple-500 to-violet-500',
          glow: 'shadow-purple-500/50',
          accent: 'text-purple-400'
        };
      case 'blue':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          glow: 'shadow-blue-500/50',
          accent: 'text-blue-400'
        };
      default:
        return {
          gradient: 'from-green-500 to-emerald-500',
          glow: 'shadow-green-500/50',
          accent: 'text-green-400'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className={`relative ${className}`}>
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full blur-lg opacity-60 ${isLoading ? 'animate-ping' : 'animate-pulse'}`} />
      
      {/* Main Icon Container */}
      <div className={`relative bg-gradient-to-r ${colors.gradient} p-4 rounded-full transition-all duration-500 ${isAnimating ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}`}>
        <CurrentIcon 
          className={`h-12 w-12 text-white transition-all duration-500 ${isLoading ? 'animate-pulse' : 'animate-bounce'} ${isAnimating ? 'scale-125' : 'scale-100'}`} 
        />
      </div>

      {/* Floating Accent Icons */}
      <Sparkles 
        className={`absolute -top-2 -right-2 h-6 w-6 ${colors.accent} ${isLoading ? 'animate-bounce' : 'animate-spin'}`} 
      />
      
      {isLoading && (
        <>
          <Heart 
            className="absolute -top-1 -left-1 h-4 w-4 text-pink-400 animate-bounce" 
            style={{ animationDelay: '0.5s' }} 
          />
          <Heart 
            className="absolute -bottom-1 -right-1 h-3 w-3 text-red-400 animate-bounce" 
            style={{ animationDelay: '1s' }} 
          />
        </>
      )}

      {/* Morphing Indicator */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} animate-pulse`}></div>
      </div>
    </div>
  );
}
