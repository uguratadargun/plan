# Troubleshooting - 404 Page Not Found

## Sorun
`http://plan.uguratadargun.com/` adresinde 404 hatası alıyorsunuz.

## Olası Nedenler ve Çözümler

### 1. Frontend Container'ı Çalışmıyor

**Kontrol:**
```bash
# Coolify dashboard'da container'ları kontrol edin
# Veya SSH ile sunucuya bağlanıp:
docker ps | grep frontend
```

**Çözüm:**
- Coolify dashboard'da frontend container'ının çalıştığından emin olun
- Container loglarını kontrol edin: `docker logs <container-name>`

### 2. Coolify Reverse Proxy Yapılandırması

**Kontrol:**
- Coolify dashboard'da resource'unuzu seçin
- **Settings** → **General** bölümüne gidin
- **Domain** ayarının doğru olduğundan emin olun: `plan.uguratadargun.com`
- **Port** ayarının `80` olduğundan emin olun

**Çözüm:**
- Domain'i doğru ayarlayın
- SSL sertifikası varsa, HTTP'den HTTPS'e yönlendirme yapıldığından emin olun

### 3. Nginx Yapılandırması

**Kontrol:**
Container içinde nginx'in çalıştığını kontrol edin:
```bash
docker exec -it <frontend-container> nginx -t
docker exec -it <frontend-container> ls -la /usr/share/nginx/html
```

**Çözüm:**
- `index.html` dosyasının `/usr/share/nginx/html` klasöründe olduğundan emin olun
- Nginx loglarını kontrol edin: `docker logs <frontend-container>`

### 4. Build Dosyaları Eksik

**Kontrol:**
```bash
docker exec -it <frontend-container> ls -la /usr/share/nginx/html
```

**Çözüm:**
- Eğer dosyalar yoksa, build başarısız olmuş olabilir
- Build loglarını kontrol edin
- Tekrar build edin

### 5. Coolify'ın Port Yönetimi

**Kontrol:**
- Coolify dashboard'da resource settings'de port yapılandırmasını kontrol edin
- `docker-compose.yml` dosyasında `expose` kullanıldığından emin olun (port mapping değil)

**Çözüm:**
- Coolify'ın otomatik port yönetimini kullanın
- `docker-compose.yml` dosyasında `ports` yerine `expose` kullanın (zaten yapıldı)

## Debug Adımları

### 1. Container Loglarını Kontrol Edin

```bash
# Frontend container logları
docker logs <frontend-container-name>

# Backend container logları
docker logs <backend-container-name>
```

### 2. Container İçine Girin

```bash
# Frontend container'ına girin
docker exec -it <frontend-container-name> sh

# İçeride:
ls -la /usr/share/nginx/html
nginx -t
cat /etc/nginx/conf.d/default.conf
```

### 3. Nginx Loglarını Kontrol Edin

```bash
docker exec -it <frontend-container-name> cat /var/log/nginx/error.log
docker exec -it <frontend-container-name> cat /var/log/nginx/access.log
```

### 4. Network Bağlantısını Kontrol Edin

```bash
# Frontend'den backend'e bağlantıyı test edin
docker exec -it <frontend-container-name> wget -O- http://backend:5001/health
```

## Hızlı Çözüm

1. **Coolify dashboard'da:**
   - Resource'unuzu seçin
   - **Redeploy** butonuna tıklayın
   - Logları izleyin

2. **Domain ayarlarını kontrol edin:**
   - Settings → General → Domain: `plan.uguratadargun.com`
   - SSL sertifikası varsa, HTTPS kullanın

3. **Container'ların çalıştığını doğrulayın:**
   - Her iki container da "Running" durumunda olmalı
   - Health check'ler başarılı olmalı

## Hala Sorun Varsa

1. Coolify dashboard'da container loglarını paylaşın
2. Nginx error log'unu kontrol edin
3. Browser console'da hataları kontrol edin (F12)
4. Network tab'ında request'leri kontrol edin

