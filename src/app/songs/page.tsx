'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, Plus, Heart, Trash2, Play } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Şarkılar';
}

interface SongData {
  id: string;
  title: string;
  artist: string;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string;
  created_at: string;
}

export default function SongsPage() {
  const { theme } = useTheme();
  const [songs, setSongs] = useState<SongData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingSong, setDeletingSong] = useState<string | null>(null);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    youtube_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmitSong = async () => {
    if (!newSong.title || !newSong.artist || !newSong.youtube_url) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const youtubeId = extractYouTubeId(newSong.youtube_url);
    if (!youtubeId) {
      alert('Geçerli bir YouTube URL\'si girin');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSong,
          youtube_id: youtubeId,
          thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        }),
      });

      if (response.ok) {
        fetchSongs();
        setIsAddSongOpen(false);
        setNewSong({ title: '', artist: '', youtube_url: '' });
      } else {
        alert('Şarkı eklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Şarkı eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Bu şarkıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingSong(songId);
    try {
      const response = await fetch(`/api/songs?id=${songId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSongs();
      } else {
        alert('Şarkı silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Şarkı silinirken bir hata oluştu.');
    } finally {
      setDeletingSong(null);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === 'green-theme' 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
        : 'bg-gradient-to-br from-pink-50 to-purple-50'
    }`}>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            Şarkılarımız
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Aşkımızın Müzikli Hikayesi
          </p>
          
          <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
            <DialogTrigger asChild>
              <Button className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white`}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Şarkı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Şarkı Ekle</DialogTitle>
                <DialogDescription>
                  YouTube Music&apos;den şarkı linkini ekleyin
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Şarkı Adı</Label>
                  <Input
                    id="title"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    placeholder="Şarkı adını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="artist">Sanatçı</Label>
                  <Input
                    id="artist"
                    value={newSong.artist}
                    onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                    placeholder="Sanatçı adını girin"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={newSong.youtube_url}
                    onChange={(e) => setNewSong({ ...newSong, youtube_url: e.target.value })}
                    placeholder="https://music.youtube.com/watch?v=..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddSongOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleSubmitSong}
                    disabled={isSubmitting}
                    className={`${
                      theme === 'green-theme' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-pink-500 hover:bg-pink-600'
                    } text-white`}
                  >
                    {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/60 backdrop-blur-sm border-pink-200">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : songs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Card 
                key={song.id} 
                className={`bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow ${
                  theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Music className={`h-5 w-5 ${
                        theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                      }`} />
                      <span className="truncate">{song.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSong(song.id)}
                      disabled={deletingSong === song.id}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className={`h-4 w-4 ${
                        deletingSong === song.id ? 'animate-spin' : ''
                      }`} />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {song.artist}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <img
                        src={song.thumbnail_url}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(song.youtube_url, '_blank')}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(song.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Henüz şarkı yok
            </h3>
            <p className="text-gray-500 mb-6">
              İlk şarkınızı ekleyerek başlayın
            </p>
            <Button 
              onClick={() => setIsAddSongOpen(true)}
              className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Şarkı Ekle
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
