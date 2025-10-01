# EgeSu Memories - Deployed to Vercel ✅

EgeSu Memories, birlikte yaşadığınız güzel anıları saklamak için özel olarak tasarlanmış bir Next.js uygulamasıdır. Tek hesaplı güvenli giriş, Türkiye şehirleri işaretleme, foto/video yükleme ve özel mektuplar gibi özellikler sunar.

## Özellikler

- 🔐 **Tek Hesaplı Güvenli Giriş**: Sadece belirlenen kullanıcı adı ve şifre ile giriş
- 🏙️ **Şehir İşaretleme**: Türkiye'nin 81 ilini grid görünümünde işaretleme
- 📸 **Foto/Video Yükleme**: Anılarınızı fotoğraf ve videolarla zenginleştirme
- 📝 **Özel Mektuplar**: Birbirinize yazdığınız mektupları saklama
- 📅 **Yıldönümleri**: Özel günlerinizi takip etme
- 🎵 **Şarkılar**: Kategorilere ayrılmış müzik koleksiyonu
- 🎨 **Modern UI**: Pastel renkler ve yumuşak tasarım
- 📱 **Responsive**: Mobil ve masaüstü uyumlu
- 🔒 **Güvenli**: Tüm veriler server-side işlenir

## Teknolojiler

- **Next.js 14+** (App Router, TypeScript)
- **TailwindCSS** + **shadcn/ui**
- **Supabase** (PostgreSQL + Storage)
- **JWT Authentication** (jose)
- **bcrypt** (şifre hashleme)

## Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd egesu-memories
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# Authentication
APP_USERNAME=your-username
APP_PASSWORD_HASH=your-bcrypt-hash
APP_SESSION_SECRET=your-super-secret-session-key-32-chars-long

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Supabase Veritabanını Kurun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın
4. Storage bucket'ı oluşturun (memories)

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresinde uygulamayı görüntüleyin.

## Giriş Bilgileri

- **Kullanıcı Adı**: `egesu`
- **Şifre**: `[Çevre değişkenlerinden alınır]`

## Şifre Hash'i Oluşturma

Yeni bir şifre hash'i oluşturmak için:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password',10))"
```

## Vercel'e Deploy

### 1. Vercel'e Bağlayın

```bash
npm install -g vercel
vercel
```

### 2. Çevre Değişkenlerini Ayarlayın

Vercel dashboard'da aşağıdaki çevre değişkenlerini ekleyin:

- `APP_USERNAME`
- `APP_PASSWORD_HASH`
- `APP_SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy Edin

```bash
vercel --prod
```

## Proje Yapısı

```
egesu-memories/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── cities/        # Şehirler sayfası
│   │   ├── albums/        # Albümler sayfası
│   │   ├── letters/       # Mektuplar sayfası
│   │   ├── anniversaries/ # Yıldönümleri sayfası
│   │   ├── settings/      # Ayarlar sayfası
│   │   └── login/         # Giriş sayfası
│   ├── components/        # React bileşenleri
│   ├── constants/         # Sabitler (şehirler)
│   └── lib/              # Yardımcı fonksiyonlar
├── supabase/
│   └── migrations/       # Veritabanı migration'ları
└── public/               # Statik dosyalar
```

## Güvenlik

- Tüm API işlemleri server-side yapılır
- Kullanıcı bilgileri client'a sızmaz
- HTTP-only, SameSite=Strict cookie kullanılır
- Rate limiting ile brute-force koruması
- Şifreler bcrypt ile hashlenir

## Lisans

Bu proje özel kullanım için tasarlanmıştır.
