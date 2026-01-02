# 503 Service Unavailable Hatası Çözümü

503 hatası, Coolify'ın reverse proxy'si container'ı buluyor ama erişemiyor demek. Bu genellikle:

1. **Container çalışmıyor** veya **crash oluyor**
2. **Health check başarısız** oluyor
3. **Port yapılandırması** yanlış
4. **Nginx çalışmıyor** container içinde

## Hızlı Kontroller

### 1. Container Durumunu Kontrol Edin

Coolify dashboard'da:
1. Resource'unuzu seçin
2. Container'ları kontrol edin
3. Frontend container'ının "Running" durumunda olduğundan emin olun
4. Eğer "Restarting" veya "Stopped" ise, logları kontrol edin

### 2. Container Loglarını Kontrol Edin

Coolify dashboard'da:
1. **Logs** sekmesine gidin
2. Frontend container'ının loglarını kontrol edin
3. Hata mesajları varsa paylaşın

**Beklenen loglar:**
- Nginx başarıyla başlamalı
- Health check başarılı olmalı
- Port 80'de dinliyor olmalı

### 3. Health Check'i Kontrol Edin

Frontend container'ının health check'i başarısız olabilir.

**Kontrol:**
```bash
# Container'a girin
docker exec -it <frontend-container-name> sh

# Health check komutunu manuel çalıştırın
wget --quiet --tries=1 --spider http://localhost/

# Eğer başarısız olursa, nginx'in çalıştığını kontrol edin
ps aux | grep nginx

# Nginx loglarını kontrol edin
cat /var/log/nginx/error.log
```

### 4. Nginx'in Çalıştığını Kontrol Edin

```bash
# Container'a girin
docker exec -it <frontend-container-name> sh

# Nginx process'ini kontrol edin
ps aux | grep nginx

# Nginx yapılandırmasını test edin
nginx -t

# Nginx'i manuel başlatmayı deneyin
nginx -g "daemon off;"
```

### 5. Port Yapılandırmasını Kontrol Edin

Coolify dashboard'da:
1. **Settings** → **Ports** bölümüne gidin
2. Frontend için port `80` olduğundan emin olun
3. Eğer farklı bir port varsa, `80` olarak değiştirin

## Olası Sorunlar ve Çözümler

### Sorun 1: Nginx Çalışmıyor

**Belirti:** Container çalışıyor ama nginx process'i yok.

**Çözüm:**
```bash
# Container'a girin
docker exec -it <frontend-container-name> sh

# Nginx'i manuel başlatın
nginx

# Hata varsa logları kontrol edin
cat /var/log/nginx/error.log
```

### Sorun 2: Health Check Başarısız

**Belirti:** Container restart oluyor, health check başarısız.

**Çözüm:**
Health check komutunu güncelleyin veya geçici olarak devre dışı bırakın.

### Sorun 3: Dosyalar Eksik

**Belirti:** Build başarılı ama `/usr/share/nginx/html` boş.

**Çözüm:**
```bash
docker exec -it <frontend-container-name> ls -la /usr/share/nginx/html
```

Eğer boşsa, build'i tekrar yapın.

### Sorun 4: Port Çakışması

**Belirti:** Port 80 zaten kullanılıyor.

**Çözüm:**
Coolify otomatik port yönetimi yapıyor, ama kontrol edin:
```bash
docker ps | grep 80
```

## Hızlı Çözüm Adımları

1. **Container loglarını kontrol edin** (Coolify dashboard)
2. **Container'a girin ve nginx'i kontrol edin**
3. **Health check'i test edin**
4. **Redeploy yapın**

## Debug Komutları

```bash
# Container durumunu kontrol edin
docker ps | grep frontend

# Container loglarını görüntüleyin
docker logs <frontend-container-name>

# Container'a girin
docker exec -it <frontend-container-name> sh

# İçeride:
ps aux | grep nginx
nginx -t
ls -la /usr/share/nginx/html
cat /var/log/nginx/error.log
wget -O- http://localhost/
```

## Sonuç

503 hatası genellikle container'ın çalışmaması veya health check'in başarısız olmasından kaynaklanır. Container loglarını paylaşın, daha spesifik bir çözüm önerebilirim.

