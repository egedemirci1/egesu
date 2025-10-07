'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Home, MapPin, Music, Mail, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

const navigation = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Anılar', href: '/memories', icon: Heart },
  { name: 'Şehirler', href: '/cities', icon: MapPin },
  { name: 'Şarkılar', href: '/songs', icon: Music },
  { name: 'Mektuplar', href: '/letters', icon: Mail },
  { name: 'Yıldönümleri', href: '/anniversaries', icon: Calendar },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      
      // "Beni hatırla" verilerini koruyoruz - logout yapsa da kullanıcı adı hatırlansın
      // localStorage temizlenmiyor, böylece "Beni hatırla" işaretliyse kullanıcı adı kalıyor
      
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50 ${
      theme === 'green-theme' ? 'border-green-100' : 'border-pink-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          {/* Logo - Sol tarafta */}
          <div className="absolute left-0">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className={`h-8 w-8 ${
                theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
              }`} />
              <span className="text-xl font-serif font-bold text-gray-800">
                EgEsu
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Ortada */}
          <div className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? theme === 'green-theme' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-pink-100 text-pink-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Sağ taraftaki butonlar */}
          <div className="absolute right-0 flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            {/* Settings Button */}
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-600 hover:text-gray-900 transition-colors ${
                  pathname === '/settings'
                    ? theme === 'green-theme' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ayarlar</span>
              </Button>
            </Link>
            
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? theme === 'green-theme' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
