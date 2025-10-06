'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function Carousel({ items, autoPlay = true, autoPlayInterval = 3000, className = '' }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  if (items.length === 0) {
    return <div className={className} />;
  }

  if (items.length === 1) {
    return <div className={className}>{items[0]}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Content */}
      <div className="overflow-hidden">
        <div 
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="h-full">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center space-x-1 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        
        {/* Dots indicator */}
        <div className="flex items-center space-x-1">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-gray-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
