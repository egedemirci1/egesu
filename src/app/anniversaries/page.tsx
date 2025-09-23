'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Heart } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Yıldönümleri';
}

interface Anniversary {
  id: string;
  title: string;
  date: string;
  repeat: boolean;
  created_at: string;
}

export default function AnniversariesPage() {
  const { theme } = useTheme();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnniversary, setNewAnniversary] = useState({ 
    title: '', 
    date: '', 
    repeat: true 
  });

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  const fetchAnniversaries = async () => {
    try {
      const response = await fetch('/api/anniversaries');
      if (response.ok) {
        const data = await response.json();
        setAnniversaries(data);
      }
    } catch (error) {
      console.error('Error fetching anniversaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnniversary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnniversary.title || !newAnniversary.date) {
      return;
    }

    try {
      const response = await fetch('/api/anniversaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnniversary),
      });

      if (response.ok) {
        const anniversary = await response.json();
        setAnniversaries([anniversary, ...anniversaries]);
        setNewAnniversary({ title: '', date: '', repeat: true });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating anniversary:', error);
    }
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const anniversaryDate = new Date(date);
    
    // Set to this year
    anniversaryDate.setFullYear(today.getFullYear());
    
    // If the date has passed this year, set to next year
    if (anniversaryDate < today) {
      anniversaryDate.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = anniversaryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className={`min-h-screen ${
      theme === 'green-theme' 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'bg-gradient-to-br from-pink-50 to-purple-50'
    }`}>
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            Yıldönümlerimiz
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Özel günlerimizi hatırlayalım
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Yıldönümü Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Yıldönümü</DialogTitle>
                <DialogDescription>
                  Özel bir günü hatırlamak için ekleyin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAnniversary} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={newAnniversary.title}
                    onChange={(e) => setNewAnniversary({ ...newAnniversary, title: e.target.value })}
                    placeholder="Yıldönümünün adı..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tarih</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAnniversary.date}
                    onChange={(e) => setNewAnniversary({ ...newAnniversary, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="repeat"
                    type="checkbox"
                    checked={newAnniversary.repeat}
                    onChange={(e) => setNewAnniversary({ ...newAnniversary, repeat: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="repeat">Her yıl tekrarla</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    className={`${
                      theme === 'green-theme' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-pink-500 hover:bg-pink-600'
                    } text-white`}
                  >
                    Kaydet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className={`bg-white/60 backdrop-blur-sm ${
                theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
              }`}>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : anniversaries.length > 0 ? (
          <div className="space-y-6">
            {anniversaries.map((anniversary) => {
              const daysUntil = getDaysUntil(anniversary.date);
              
              return (
                <Card key={anniversary.id} className={`bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow ${
                  theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className={`h-5 w-5 ${
                        theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                      }`} />
                      <span>{anniversary.title}</span>
                    </CardTitle>
                    <CardDescription>
                      {new Date(anniversary.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {anniversary.repeat && ' (Her yıl)'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${
                        theme === 'green-theme' ? 'text-green-600' : 'text-pink-600'
                      }`}>
                        {daysUntil}
                      </div>
                      <div className="text-sm text-gray-600">
                        {daysUntil === 0 ? 'Bugün!' : daysUntil === 1 ? 'Yarın!' : 'gün kaldı'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Henüz yıldönümü yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk yıldönümünüzü ekleyerek başlayın
            </p>
            <Button 
              className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white`}
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yıldönümü Ekle
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
