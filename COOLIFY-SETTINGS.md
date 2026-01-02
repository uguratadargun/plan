# Coolify Ayarları - Yapılması Gerekenler

Coolify'da Docker Compose resource'unuz için aşağıdaki ayarları yapmanız gerekiyor:

## 1. Domain Ayarları

### Frontend için Domain

1. Coolify dashboard'da resource'unuzu seçin
2. **Settings** → **General** bölümüne gidin
3. **Domain** alanına: `plan.uguratadargun.com` yazın
4. **Save** butonuna tıklayın

**Önemli:** Domain ayarı yapılmazsa, Coolify reverse proxy container'ınızı bulamaz ve 404 hatası alırsınız.

## 2. Environment Variables

### Backend için

1. Resource'unuzu seçin
2. **Settings** → **Environment Variables** bölümüne gidin
3. Aşağıdaki değişkenleri ekleyin:
   ```
   PORT=5001
   NODE_ENV=production
   ```

### Frontend için (Build Arguments)

1. Resource'unuzu seçin
2. **Settings** → **Build Arguments** veya **Environment Variables** bölümüne gidin
3. Aşağıdaki değişkeni ekleyin:

   ```
   VITE_API_URL=/api
   ```

   **Not:** Eğer backend'i ayrı bir domain'de host ediyorsanız (örn: `api.uguratadargun.com`), o zaman:

   ```
   VITE_API_URL=https://api.uguratadargun.com/api
   ```

## 3. Port Ayarları

Coolify Docker Compose kullanırken genellikle port ayarlarına gerek yok çünkü:

- `docker-compose.yml` dosyasında `expose` kullanıyoruz (port mapping değil)
- Coolify otomatik olarak port'ları yönetir

Ama kontrol etmek için:

1. **Settings** → **Ports** bölümüne gidin
2. Eğer port ayarı varsa:
   - Frontend: `80`
   - Backend: `5001`

## 4. Volume Ayarları (Persistent Storage)

### Backend için

1. **Settings** → **Volumes** veya **Persistent Storage** bölümüne gidin
2. Volume ekleyin:
   - **Name**: `backend-data` (veya istediğiniz bir isim)
   - **Path**: `/app/data`
   - **Mount Point**: Backend container'ına mount edilecek

**Önemli:** Volume ayarı yapılmazsa, database dosyanız container yeniden başlatıldığında kaybolur.

## 5. Health Check Ayarları

Coolify genellikle otomatik olarak health check yapar, ama kontrol etmek için:

1. **Settings** → **Health Check** bölümüne gidin
2. Eğer manuel ayar gerekiyorsa:
   - **Backend**: `http://localhost:5001/health`
   - **Frontend**: `http://localhost/`

## 6. SSL Sertifikası (Opsiyonel ama Önerilen)

1. **Settings** → **SSL** veya **Domain** bölümüne gidin
2. **Let's Encrypt** seçeneğini aktif edin
3. Domain'iniz için otomatik SSL sertifikası oluşturulur

## Özet - Yapılması Gerekenler

### Zorunlu:

1. ✅ **Domain ayarı**: `plan.uguratadargun.com`
2. ✅ **Environment Variables**: Backend için `PORT=5001`, `NODE_ENV=production`
3. ✅ **Build Arguments**: Frontend için `VITE_API_URL=/api`
4. ✅ **Volume**: Backend için `/app/data` persistent storage

### Opsiyonel:

- SSL sertifikası
- Custom port ayarları (genellikle gerekmez)

## Hızlı Kontrol Listesi

- [ ] Domain ayarı yapıldı mı? (`plan.uguratadargun.com`)
- [ ] Backend environment variables eklendi mi? (`PORT=5001`, `NODE_ENV=production`)
- [ ] Frontend build argument eklendi mi? (`VITE_API_URL=/api`)
- [ ] Backend volume ayarı yapıldı mı? (`/app/data`)
- [ ] Container'lar çalışıyor mu? (Dashboard'da kontrol edin)
- [ ] SSL sertifikası aktif mi? (Opsiyonel)

## Notlar

- **Domain ayarı en önemlisi!** Domain ayarı yapılmazsa 404 hatası alırsınız.
- Environment variables'ları ekledikten sonra **redeploy** etmeniz gerekebilir.
- Volume ayarı yapılmazsa database kaybolur, bu yüzden önemli!
