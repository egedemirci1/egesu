'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles, Lock, User, Eye, EyeOff } from 'lucide-react';
import { DigitalClock } from '@/components/digital-clock';
import { ThemeSelector } from '@/components/theme-selector';
import { TypingEffect } from '@/components/typing-effect';
import { MorphingLogo } from '@/components/morphing-logo';
import { HeartCounter, useHeartCounter } from '@/components/heart-counter';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Giriş';
}

// Floating Hearts Component
const FloatingHearts = () => {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const generateHearts = () => {
      const newHearts = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
      }));
      setHearts(newHearts);
    };

    generateHearts();
    const interval = setInterval(generateHearts, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          <Heart className="h-6 w-6 text-green-400/60 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

// Particle Background Component
const ParticleBackground = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 10,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-green-300/30 to-emerald-300/30 animate-twinkle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [randomQuote, setRandomQuote] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('green');
  const router = useRouter();
  const { incrementLoginCount } = useHeartCounter();

  const quotes = [
    "İyi geçinmek iki kişinin kusursuz olmasıyla değil, birbirlerinin kusurlarını hoş görmesiyle olur…",
    "Nedensiz ve sebepsiz sevdim seni. Çünkü bir sebebi olsa, aşk olmazdı bunun ismi.",
    "Hayatımın başı ve sonu belliydi; hiç olmazsa ortasını kaçırmamalıydım.",
    "Onunla ne zaman lades oynasak hep o kazandı. Kalbimdeyken nasıl aklımda derdim.",
    "Hayat kısa, kuşlar uçuyor.",
    "Seni bir kere öpsem ikinin hatırı kalıyordu.",
    "Aşk, iki kişinin birbirini deli etmesidir.",
    "Seni sevmek, hayatın en güzel deliliği.",
    "İki çılgının tek dünyası burada başlıyor.",
    "Burada mantık yok, sadece aşk var.",
    "Seninle olmak, hayatın en güzel saçmalığı.",
    "İki delinin tek hikayesi burada yazılıyor.",
    "Aşk, akıllı insanların yaptığı en büyük aptallık.",
    "Seni sevmek, hayatın en güzel çılgınlığı.",
    "Burada sadece bizim deliliklerimiz var.",
    "İki çılgının tek evi burası.",
    "Aşk, iki kişinin birbirini kaybetmesidir.",
    "Seninle olmak, hayatın en güzel kayboluşu.",
    "Burada normal olmak yasak.",
    "İki delinin tek dünyası burada.",
    "Aşk, iki kişinin birbirini bulmasıdır.",
    "Seni sevmek, hayatın en güzel buluşu.",
    "Burada sadece bizim saçmalıklarımız var.",
    "İki çılgının tek hikayesi burada.",
    "Aşk, iki kişinin birbirini anlamasıdır.",
    "Seninle olmak, hayatın en güzel anlaşması.",
    "Burada mantık yok, sadece sevgi var.",
    "İki delinin tek dünyası burada başlıyor.",
    "Aşk, iki kişinin birbirini kaybetmesidir.",
    "Seni sevmek, hayatın en güzel kayboluşu."
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // İlk alıntıyı seç
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomIndex]);
    
    // Her 5-6 saniyede bir alıntıyı değiştir
    const interval = setInterval(() => {
      const newRandomIndex = Math.floor(Math.random() * quotes.length);
      setRandomQuote(quotes[newRandomIndex]);
    }, 5000 + Math.random() * 1000); // 5-6 saniye arası rastgele
    
    // "Beni hatırla" özelliği - localStorage'dan kullanıcı adını yükle
    const savedUsername = localStorage.getItem('egesu_remembered_username');
    const rememberMeStatus = localStorage.getItem('egesu_remember_me') === 'true';
    
    if (savedUsername && rememberMeStatus) {
      setUsername(savedUsername);
      setRememberMe(true);
    }

    // Tema yükle
    const savedTheme = localStorage.getItem('egesu_login_theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Kalp sayacını artır
        incrementLoginCount();
        
        // Token is now set by the server in an HTTP-only cookie
        // We just need to store it in localStorage for client-side checks
        if (data.token) {
          localStorage.setItem('egesu_session_token', data.token);
        }
        
        // "Beni hatırla" özelliği - localStorage'a kaydet
        if (rememberMe) {
          localStorage.setItem('egesu_remembered_username', username);
          localStorage.setItem('egesu_remember_me', 'true');
        } else {
          // Eğer "Beni hatırla" işaretli değilse, sadece remember_me flag'ini kaldır
          // Ama kullanıcı adını koruyoruz (kullanıcı manuel olarak işaretini kaldırmadığı sürece)
          localStorage.removeItem('egesu_remember_me');
        }
        
        router.push('/');
        router.refresh();
      } else {
        setError('Hey Uzak Dur!');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('egesu_login_theme', theme);
  };

  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'pink':
        return {
          bg: 'from-pink-100 via-rose-50 to-purple-100',
          overlay: 'from-pink-200/20 via-rose-200/20 to-purple-200/20',
          cardBorder: 'border-pink-200',
          inputBorder: 'border-pink-200 focus:border-pink-400 focus:ring-pink-400/20',
          buttonGradient: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
          buttonShadow: 'shadow-pink-500/25 hover:shadow-pink-500/40',
          accent: 'text-pink-500'
        };
      case 'purple':
        return {
          bg: 'from-purple-100 via-violet-50 to-indigo-100',
          overlay: 'from-purple-200/20 via-violet-200/20 to-indigo-200/20',
          cardBorder: 'border-purple-200',
          inputBorder: 'border-purple-200 focus:border-purple-400 focus:ring-purple-400/20',
          buttonGradient: 'from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600',
          buttonShadow: 'shadow-purple-500/25 hover:shadow-purple-500/40',
          accent: 'text-purple-500'
        };
      case 'blue':
        return {
          bg: 'from-blue-100 via-cyan-50 to-teal-100',
          overlay: 'from-blue-200/20 via-cyan-200/20 to-teal-200/20',
          cardBorder: 'border-blue-200',
          inputBorder: 'border-blue-200 focus:border-blue-400 focus:ring-blue-400/20',
          buttonGradient: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
          buttonShadow: 'shadow-blue-500/25 hover:shadow-blue-500/40',
          accent: 'text-blue-500'
        };
      default:
        return {
          bg: 'from-green-100 via-emerald-50 to-teal-100',
          overlay: 'from-green-200/20 via-emerald-200/20 to-teal-200/20',
          cardBorder: 'border-green-200',
          inputBorder: 'border-green-200 focus:border-green-400 focus:ring-green-400/20',
          buttonGradient: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
          buttonShadow: 'shadow-green-500/25 hover:shadow-green-500/40',
          accent: 'text-green-500'
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${themeStyles.bg}`}>
      {/* Animated Background Elements */}
      <ParticleBackground />
      <FloatingHearts />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${themeStyles.overlay}`} />
      
      {/* Digital Clock - Responsive Position */}
      <div className="absolute top-4 right-4 z-20 hidden sm:block">
        <DigitalClock className="w-64" />
      </div>

      {/* Heart Counter - Desktop */}
      <div className="absolute top-8 left-4 z-20 hidden sm:block">
        <HeartCounter theme={currentTheme} />
      </div>

      {/* Theme Selector - Desktop */}
      <div className="absolute top-24 left-4 z-20 hidden sm:block">
        <ThemeSelector 
          onThemeChange={handleThemeChange} 
          currentTheme={currentTheme} 
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Mobile Theme Selector and Heart Counter */}
        <div className="flex items-center justify-between w-full max-w-sm sm:hidden mb-4">
          <ThemeSelector 
            onThemeChange={handleThemeChange} 
            currentTheme={currentTheme} 
          />
          <HeartCounter theme={currentTheme} />
        </div>

        <div className={`transform transition-all duration-1000 w-full max-w-2xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${isLoading ? 'scale-105' : 'scale-100'}`}>
          <Card className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white/80 backdrop-blur-xl border-0 shadow-2xl ${themeStyles.buttonShadow}`}>
            <CardHeader className="text-center pb-8">
              {/* Animated Logo */}
              <div className="flex justify-center mb-6">
                <MorphingLogo 
                  isLoading={isLoading} 
                  className="h-20 w-20" 
                  theme={currentTheme}
                />
              </div>
              
              <CardTitle className={`text-3xl font-bold bg-gradient-to-r ${themeStyles.buttonGradient} bg-clip-text text-transparent mb-2`}>
                Aşkın Sihirli Dünyası
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg italic text-center px-4 transition-all duration-1000 ease-in-out h-16 flex items-center justify-center">
                <TypingEffect text={randomQuote} className="text-gray-600 text-lg italic" speed={30} />
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-8 md:px-12 pb-8 sm:pb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-gray-700 font-medium flex items-center gap-2">
                    <User className={`h-4 w-4 ${themeStyles.accent}`} />
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-12 bg-white/70 backdrop-blur-sm ${themeStyles.inputBorder} transition-all duration-300 hover:bg-white/80`}
                    placeholder="Kullanıcı adınızı girin"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                    <Lock className={`h-4 w-4 ${themeStyles.accent}`} />
                    Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`h-12 bg-white/70 backdrop-blur-sm ${themeStyles.inputBorder} transition-all duration-300 hover:bg-white/80 pr-12`}
                      placeholder="Şifrenizi girin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:${themeStyles.accent} transition-colors duration-200`}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Beni Hatırla Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`h-4 w-4 ${themeStyles.inputBorder} focus:ring-2 border-2 rounded transition-all duration-200`}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember-me" className={`text-sm ${themeStyles.accent} font-medium cursor-pointer select-none hover:opacity-80 transition-colors duration-200`}>
                    Beni Hatırla
                  </Label>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg animate-shake">
                    ❌ {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${themeStyles.buttonGradient} text-white font-semibold text-lg shadow-lg ${themeStyles.buttonShadow} transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white animate-pulse" />
                      </div>
                      <span className="animate-pulse">Aşkın büyüsü hazırlanıyor...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Giriş Yap
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Digital Clock - Mobile Bottom */}
        <div className="mt-6 w-full max-w-sm sm:hidden">
          <DigitalClock className="w-full" />
        </div>
      </div>
    </div>
  );
}
