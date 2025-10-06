'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadComponent, UploadedFile } from '@/components/upload';
import { MediaDisplay } from '@/components/media-display';
import { Plus, Heart, Calendar, MapPin, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { CITIES } from '@/constants/cities';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Anılar';
}

interface MediaFile {
  id: string;
  file_name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
}

interface Memory {
  id: string;
  title: string;
  description?: string;
  date: string;
  city_code: string;
  created_at: string;
  media: MediaFile[];
}

export default function MemoriesPage() {
  const { theme } = useTheme();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isNewMemoryOpen, setIsNewMemoryOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    city_code: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMemory, setDeletingMemory] = useState<string | null>(null);
  const [addingMediaToMemory, setAddingMediaToMemory] = useState<string | null>(null);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [memoriesPerPage] = useState(5); // Her sayfada 5 memory göster
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching memories...');
      const response = await fetch('/api/memories');
      console.log('Fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Memories fetched successfully:', data.length, 'memories');
        setMemories(data);
      } else {
        console.error('Failed to fetch memories:', response.status);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMemory = async () => {
    if (!newMemory.title || !newMemory.city_code) {
      alert('Please fill in title and city');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create memory
      console.log('Creating memory with data:', newMemory);
      
      // Convert city_code to integer
      const memoryPayload = {
        ...newMemory,
        city_code: parseInt(newMemory.city_code)
      };
      
      console.log('Converted memory data:', memoryPayload);
      
      const memoryResponse = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryPayload),
      });

      console.log('Memory response status:', memoryResponse.status);
      console.log('Memory response ok:', memoryResponse.ok);

      if (!memoryResponse.ok) {
        console.error('Memory creation failed with status:', memoryResponse.status);
        console.error('Response headers:', Object.fromEntries(memoryResponse.headers.entries()));
        
        let errorData = {};
        try {
          errorData = await memoryResponse.json();
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { error: `HTTP ${memoryResponse.status}: ${memoryResponse.statusText}` };
        }
        
        console.error('Memory creation error:', errorData);
        throw new Error(`Failed to create memory: ${(errorData as any).error || 'Unknown error'}`);
      }

      const memoryData = await memoryResponse.json();
      console.log('Memory created successfully:', memoryData);

      // Media files are already uploaded by the UploadComponent
      // We just need to associate them with the memory
      if (uploadedFiles.length > 0) {
        console.log('Associating media files with memory:', uploadedFiles.length);
        const updatePromises = uploadedFiles.map(async (file) => {
          const response = await fetch('/api/upload', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mediaId: file.id,
              memoryId: memoryData.id
            }),
          });

          return response.json();
        });

        await Promise.all(updatePromises);
        console.log('Media files associated successfully');
      }

      // Reset form
      console.log('Resetting form and refreshing memories');
      setNewMemory({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        city_code: ''
      });
      setUploadedFiles([]);
      setIsNewMemoryOpen(false);
      
      // Refresh memories
      await fetchMemories();
      console.log('Memory creation process completed successfully');
    } catch (error) {
      console.error('Error creating memory:', error);
      alert('Failed to create memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (files: UploadedFile[]) => {
    // Convert UploadedFile to MediaFile format
    const mediaFiles: MediaFile[] = files.map(file => ({
      id: file.id,
      file_name: file.name,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      public_url: file.url,
      created_at: new Date().toISOString()
    }));
    setUploadedFiles(prev => [...prev, ...mediaFiles]);
  };

  const getCityName = (cityCode: string) => {
    const city = CITIES.find(c => c.code.toString() === cityCode);
    return city ? city.name : cityCode;
  };

  // Pagination logic
  const totalPages = Math.ceil(memories.length / memoriesPerPage);
  const startIndex = (currentPage - 1) * memoriesPerPage;
  const endIndex = startIndex + memoriesPerPage;
  const currentMemories = memories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('Bu anıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeletingMemory(memoryId);
    try {
      const response = await fetch(`/api/memories?id=${memoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh memories list
        fetchMemories();
      } else {
        alert('Anı silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Anı silinirken bir hata oluştu.');
    } finally {
      setDeletingMemory(null);
    }
  };

  const handleAddMediaToMemory = (memoryId: string) => {
    setSelectedMemoryId(memoryId);
    setIsAddMediaOpen(true);
  };

  const handleSubmitAddMedia = async () => {
    if (!selectedMemoryId || uploadedFiles.length === 0) {
      alert('Lütfen en az bir dosya seçin');
      return;
    }

    setAddingMediaToMemory(selectedMemoryId);
    
    try {
      const response = await fetch('/api/memories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memory_id: selectedMemoryId,
          media_files: uploadedFiles
        }),
      });

      if (response.ok) {
        // Refresh memories list
        fetchMemories();
        setIsAddMediaOpen(false);
        setSelectedMemoryId(null);
        setUploadedFiles([]);
      } else {
        alert('Medya dosyaları eklenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Error adding media to memory:', error);
      alert('Medya dosyaları eklenirken bir hata oluştu.');
    } finally {
      setAddingMediaToMemory(null);
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
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
            Anılarımız
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Birlikte Yaşadığımız Güzel Anlar
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Her anı, aşkımızın bir parçası
          </p>
        </div>

        {/* Add Memory Button */}
        <div className="text-center mb-8">
          <Dialog open={isNewMemoryOpen} onOpenChange={setIsNewMemoryOpen}>
            <DialogTrigger asChild>
              <Button className={`${
                theme === 'green-theme' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-pink-500 hover:bg-pink-600'
              } text-white px-6 py-3`}>
                <Plus className="h-5 w-5 mr-2" />
                Yeni Anı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Anı Ekle</DialogTitle>
                <DialogDescription>
                  Yeni bir anı oluşturun ve fotoğraf/video ekleyin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={newMemory.title}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Anınızın başlığını yazın..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={newMemory.description}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Anınız hakkında detaylar..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Tarih</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMemory.date}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="city">Şehir *</Label>
                  <Select value={newMemory.city_code} onValueChange={(value) => setNewMemory(prev => ({ ...prev, city_code: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city.code} value={city.code.toString()}>
                          {city.code} - {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fotoğraf/Video Yükle</Label>
                  <UploadComponent
                    onUploadComplete={handleUploadComplete}
                    multiple={true}
                    maxSize={50}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewMemoryOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleSubmitMemory}
                    disabled={isSubmitting}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Memories List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Heart className="h-12 w-12 text-green-500 animate-pulse" />
                <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-green-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-green-600 font-medium">Anılar yükleniyor...</p>
                <p className="text-gray-500 text-sm">Aşkın büyüsü hazırlanıyor ✨</p>
              </div>
            </div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz anı eklenmemiş. İlk anınızı ekleyin!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentMemories.map((memory) => (
                <Card key={memory.id} className={`bg-white/60 backdrop-blur-sm ${
                  theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{memory.title}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddMediaToMemory(memory.id)}
                          className={`hover:bg-blue-50 hover:text-blue-600 transition-colors`}
                        >
                          <ImagePlus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMemory(memory.id)}
                          disabled={deletingMemory === memory.id}
                          className={`hover:bg-red-50 hover:text-red-600 transition-colors`}
                        >
                          <Trash2 className={`h-4 w-4 ${
                            deletingMemory === memory.id ? 'animate-spin' : ''
                          }`} />
                        </Button>
                      </div>
                    </CardTitle>
                    {memory.description && (
                      <CardDescription>{memory.description}</CardDescription>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(memory.date).toLocaleDateString('tr-TR')}</span>
                      <MapPin className="h-4 w-4 ml-2" />
                      <span>{getCityName(memory.city_code)}</span>
                    </div>
                  </CardHeader>
                  {memory.media && memory.media.length > 0 && (
                    <CardContent>
                      <MediaDisplay media={memory.media} />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? 
                      (theme === 'green-theme' ? 'bg-green-500 hover:bg-green-600' : 'bg-pink-500 hover:bg-pink-600') 
                      : ''
                    }
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}

        {/* Add Media Dialog */}
        <Dialog open={isAddMediaOpen} onOpenChange={setIsAddMediaOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Anıya Medya Ekle</DialogTitle>
              <DialogDescription>
                Bu anıya yeni fotoğraf veya video ekleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Fotoğraf/Video Yükle</Label>
                <UploadComponent
                  onUploadComplete={handleUploadComplete}
                  multiple={true}
                  maxSize={50}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddMediaOpen(false);
                    setSelectedMemoryId(null);
                    setUploadedFiles([]);
                  }}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSubmitAddMedia}
                  disabled={addingMediaToMemory !== null || uploadedFiles.length === 0}
                  className={`${
                    theme === 'green-theme' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-pink-500 hover:bg-pink-600'
                  } text-white`}
                >
                  {addingMediaToMemory ? 'Ekleniyor...' : 'Medya Ekle'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
