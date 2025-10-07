'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { StorageUsage } from '@/components/storage-usage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Palette, Check } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// Set page title
if (typeof document !== 'undefined') {
  document.title = 'EgEsu - Ayarlar';
}

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { theme, changeTheme } = useTheme();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export', { credentials: 'include' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `egesu-memories-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
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
            Ayarlar
          </h1>
          <p className="text-lg text-gray-600">
            Uygulamanızı kişiselleştirin
          </p>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Görünüm</TabsTrigger>
            <TabsTrigger value="storage">Depolama</TabsTrigger>
            <TabsTrigger value="data">Veri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card className={`bg-white/60 backdrop-blur-sm ${
              theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className={`h-5 w-5 ${
                    theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                  }`} />
                  <span>Görünüm Ayarları</span>
                </CardTitle>
                <CardDescription>
                  Tema ve görsel tercihleriniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Tema Seçimi</h3>
                  <p className="text-sm text-gray-600">
                    Uygulamanızın görünümünü kişiselleştirin
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Green Theme */}
                    <div 
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'green-theme' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                      onClick={() => changeTheme('green-theme')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="font-medium text-gray-800">Yeşil Tema</span>
                        </div>
                        {theme === 'green-theme' && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded bg-green-400"></div>
                          <div className="w-3 h-3 rounded bg-green-500"></div>
                          <div className="w-3 h-3 rounded bg-green-600"></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          Doğal ve sakin bir görünüm
                        </p>
                      </div>
                    </div>

                    {/* Pink Theme */}
                    <div 
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        theme === 'pink-theme' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 bg-white hover:border-pink-300'
                      }`}
                      onClick={() => changeTheme('pink-theme')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                          <span className="font-medium text-gray-800">Pembe Tema</span>
                        </div>
                        {theme === 'pink-theme' && (
                          <Check className="h-5 w-5 text-pink-500" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 rounded bg-pink-400"></div>
                          <div className="w-3 h-3 rounded bg-pink-500"></div>
                          <div className="w-3 h-3 rounded bg-pink-600"></div>
                        </div>
                        <p className="text-xs text-gray-600">
                          Romantik ve sıcak bir görünüm
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-6">
            <StorageUsage />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <Card className={`bg-white/60 backdrop-blur-sm ${
              theme === 'green-theme' ? 'border-green-200' : 'border-pink-200'
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className={`h-5 w-5 ${
                    theme === 'green-theme' ? 'text-green-500' : 'text-pink-500'
                  }`} />
                  <span>Veri Yönetimi</span>
                </CardTitle>
                <CardDescription>
                  Verilerinizi yedekleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    theme === 'green-theme' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-pink-50 border-pink-200'
                  }`}>
                    <h3 className="font-medium text-gray-800 mb-2">Veri Dışa Aktarma</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Tüm anılarınızı, fotoğraflarınızı ve verilerinizi ZIP formatında indirin. Dosyalar orijinal formatlarında korunur.
                    </p>
                    <Button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className={`${
                        theme === 'green-theme' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-pink-500 hover:bg-pink-600'
                      } text-white`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isExporting ? 'Dışa Aktarılıyor...' : 'Verileri İndir'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
