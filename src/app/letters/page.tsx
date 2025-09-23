'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Plus, Heart, Trash2, Lock } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Mektuplar';
}

interface Letter {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function LettersPage() {
  const { theme } = useTheme();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingLetter, setDeletingLetter] = useState<string | null>(null);
  const [newLetter, setNewLetter] = useState({ title: '', body: '' });
  const [unlockedLetters, setUnlockedLetters] = useState<Set<string>>(new Set());
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!confirm('Bu mektubu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeletingLetter(letterId);
    try {
      const response = await fetch(`/api/letters?id=${letterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh letters list
        fetchLetters();
      } else {
        alert('Mektup silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting letter:', error);
      alert('Mektup silinirken bir hata oluştu.');
    } finally {
      setDeletingLetter(null);
    }
  };

  const handleCreateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLetter.title || !newLetter.body) {
      return;
    }

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLetter),
      });

      if (response.ok) {
        const letter = await response.json();
        setLetters([letter, ...letters]);
        setNewLetter({ title: '', body: '' });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating letter:', error);
    }
  };

  const unlockLetter = (letterId: string) => {
    if (password === 'pırt') { // Basit şifre
      setUnlockedLetters(prev => new Set(prev).add(letterId));
      setPassword('');
    } else {
      alert('Yanlış şifre!');
    }
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
            Mektuplarımız
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Arkadaşlar Bu Mektuplar Çok Gizli!
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Mektup Yaz
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Yeni Mektup</DialogTitle>
                <DialogDescription>
                  Birbirimize yazdığımız özel bir mektup ekleyin
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLetter} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={newLetter.title}
                    onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
                    placeholder="Mektubun başlığı..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">İçerik</Label>
                  <Textarea
                    id="body"
                    value={newLetter.body}
                    onChange={(e) => setNewLetter({ ...newLetter, body: e.target.value })}
                    placeholder="Mektubun içeriği..."
                    rows={6}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className={`${
                    theme === 'green-theme' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-pink-500 hover:bg-pink-600'
                  } text-white`}>
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
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : letters.length > 0 ? (
          <div className="space-y-6">
            {letters.map((letter) => (
              <Card key={letter.id} className={`bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow ${
                theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className={`h-5 w-5 ${
                        theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                      }`} />
                      <span>{letter.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLetter(letter.id)}
                      disabled={deletingLetter === letter.id}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className={`h-4 w-4 ${
                        deletingLetter === letter.id ? 'animate-spin' : ''
                      }`} />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {new Date(letter.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {unlockedLetters.has(letter.id) ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {letter.body}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <Lock className={`h-12 w-12 mx-auto mb-3 ${
                          theme === 'green-theme' ? 'text-green-400' : 'text-pink-400'
                        }`} />
                        <p className="text-gray-500 text-sm font-medium">
                          Bu Mektup Gizli
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Şifre ile açılır
                        </p>
                        <div className="mt-4 flex items-center space-x-2">
                          <Input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-32 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => unlockLetter(letter.id)}
                            className={`${
                              theme === 'green-theme' 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-pink-500 hover:bg-pink-600'
                            } text-white`}
                          >
                            Aç
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Henüz mektup yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk mektubunuzu yazarak başlayın
            </p>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Mektup Yaz
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
