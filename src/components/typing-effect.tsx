'use client';

import { useState, useEffect, useRef } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypingEffect({ text, speed = 50, className = '' }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Önceki timeout'ları temizle
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    // Text değiştiğinde state'leri sıfırla
    setDisplayedText('');
    setCurrentIndex(0);
    setIsDeleting(false);

    const typeText = () => {
      if (!isDeleting) {
        // Yazma modu
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
          timeoutRef.current = setTimeout(typeText, speed);
        } else {
          // Metin tamamlandı, 2 saniye bekle sonra silmeye başla
          pauseTimeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
            timeoutRef.current = setTimeout(typeText, speed / 2);
          }, 2000);
        }
      } else {
        // Silme modu
        if (currentIndex > 0) {
          setDisplayedText(text.slice(0, currentIndex - 1));
          setCurrentIndex(prev => prev - 1);
          timeoutRef.current = setTimeout(typeText, speed / 2);
        } else {
          // Metin silindi, yeni metin için hazırlan
          setIsDeleting(false);
          timeoutRef.current = setTimeout(typeText, speed);
        }
      }
    };

    // İlk çalıştırma
    timeoutRef.current = setTimeout(typeText, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [text, speed, currentIndex, isDeleting]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}