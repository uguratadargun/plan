# 404 Hatası Çözümü - Coolify Docker Compose

## Sorun
`http://plan.uguratadargun.com/` adresinde 404 hatası alıyorsunuz.

## Olası Nedenler

### 1. Coolify Servisleri Tanımıyor
Coolify'ın Docker Compose servislerini tanıması için labels ekledik. Ama eğer hala çalışmıyorsa:

**Kontrol:**
- Coolify dashboard'da "Show Deployable Compose" butonuna tıklayın
- Backend ve frontend servislerinin göründüğünü kontrol edin
- Eğer sadece 1 servis görünüyorsa, compose dosyası doğru parse edilmemiş olabilir

### 2. Domain Mapping Yanlış
Coolify'da domain ayarları yapılmış ama servis mapping'i yanlış olabilir.

**Çözüm:**
1. Coolify dashboard'da resource'unuzu seçin
2. **Settings** → **General** bölümüne gidin
3. **Domains for frontend** alanında `plan.uguratadargun.com` olduğundan emin olun
4. **Domains for backend** alanında `planback.uguratadargun.com` olduğundan emin olun
5. **Save** butonuna tıklayın

### 3. Container'lar Çalışmıyor
Container'lar çalışmıyor olabilir.

**Kontrol:**
1. Coolify dashboard'da container'ları kontrol edin
2. Her iki container da "Running" durumunda olmalı
3. Eğer çalışmıyorsa, logları kontrol edin

### 4. Coolify Reverse Proxy Yapılandırması
Coolify'ın reverse proxy'si container'ları bulamıyor olabilir.

**Çözüm:**
1. Coolify dashboard'da resource'unuzu seçin
2. **Settings** → **Advanced** bölümüne gidin
3. **Custom Start Command** kontrol edin: `docker compose up -d`
4. **Redeploy** yapın

## Hızlı Çözüm Adımları

### Adım 1: Compose Dosyasını Kontrol Edin
1. Coolify dashboard'da "Show Deployable Compose" butonuna tıklayın
2. Backend ve frontend servislerinin göründüğünü doğrulayın
3. Eğer görünmüyorsa, compose dosyasını tekrar yükleyin

### Adım 2: Domain Ayarlarını Kontrol Edin
1. **Settings** → **General** → **Domains for frontend**: `plan.uguratadargun.com`
2. **Settings** → **General** → **Domains for backend**: `planback.uguratadargun.com`
3. **Save** butonuna tıklayın

### Adım 3: Redeploy Yapın
1. Coolify dashboard'da **Redeploy** butonuna tıklayın
2. Build ve deployment loglarını izleyin
3. Hata varsa logları kontrol edin

### Adım 4: Container Loglarını Kontrol Edin
1. Coolify dashboard'da container'ları seçin
2. Logları kontrol edin
3. Nginx error log'unu kontrol edin: `docker exec -it <frontend-container> cat /var/log/nginx/error.log`

## Alternatif Çözüm: Her Servis İçin Ayrı Resource

Eğer Docker Compose ile sorun devam ediyorsa, her servis için ayrı resource oluşturun:

### Backend Resource
- Type: Dockerfile
- Root Directory: `backend`
- Port: `5001`
- Domain: `planback.uguratadargun.com`

### Frontend Resource
- Type: Dockerfile
- Root Directory: `frontend`
- Port: `80`
- Domain: `plan.uguratadargun.com`
- Build Arguments: `VITE_API_URL=https://planback.uguratadargun.com/api`

Bu yaklaşım daha güvenilir ve Coolify'ın native desteği ile çalışır.

## Debug Komutları

Container içine girip kontrol edin:

```bash
# Frontend container'ına girin
docker exec -it <frontend-container-name> sh

# İçeride:
ls -la /usr/share/nginx/html
nginx -t
cat /var/log/nginx/error.log
cat /var/log/nginx/access.log
```

## Sonuç

Eğer hala 404 hatası alıyorsanız:
1. Container loglarını paylaşın
2. Nginx error log'unu paylaşın
3. "Show Deployable Compose" çıktısını paylaşın

Bu bilgilerle daha spesifik bir çözüm önerebiliriz.

