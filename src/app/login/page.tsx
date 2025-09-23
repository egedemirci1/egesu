'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles, Lock, User } from 'lucide-react';

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
  const router = useRouter();

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
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100">
      {/* Animated Background Elements */}
      <ParticleBackground />
      <FloatingHearts />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200/20 via-emerald-200/20 to-teal-200/20" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-green-500/20">
            <CardHeader className="text-center pb-8">
              {/* Animated Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-60 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full">
                    <Heart className="h-12 w-12 text-white animate-bounce" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Aşkın Sihirli Dünyası
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg italic text-center px-4 transition-all duration-1000 ease-in-out">
                "{randomQuote}"
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-8 md:px-12 pb-8 sm:pb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-gray-700 font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-white/70 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400/20 transition-all duration-300 hover:bg-white/80"
                    placeholder="Kullanıcı adınızı girin"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-white/70 backdrop-blur-sm border-green-200 focus:border-green-400 focus:ring-green-400/20 transition-all duration-300 hover:bg-white/80"
                    placeholder="Şifrenizi girin"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-lg animate-shake">
                    ❌ {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Giriş yapılıyor...
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
      </div>
    </div>
  );
}
