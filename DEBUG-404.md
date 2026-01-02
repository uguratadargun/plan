# 404 Hatası Debug - Container'lar Çalışıyor Ama 404 Alıyorsunuz

Container'lar başlatıldı ama hala 404 alıyorsunuz. Bu, Coolify'ın reverse proxy yapılandırması ile ilgili olabilir.

## Hızlı Kontroller

### 1. Container'ların Durumunu Kontrol Edin

Coolify dashboard'da veya SSH ile:

```bash
# Tüm container'ları listeleyin
docker ps | grep bkg8wo4kkkwscwkos4k00ggc

# Frontend container'ının çalıştığını kontrol edin
docker ps | grep frontend

# Backend container'ının çalıştığını kontrol edin
docker ps | grep backend
```

### 2. Frontend Container'ına Girin ve Kontrol Edin

```bash
# Frontend container'ına girin (container adını loglardan alın)
docker exec -it frontend-bkg8wo4kkkwscwkos4k00ggc-111118126093 sh

# İçeride:
# Nginx'in çalıştığını kontrol edin
ps aux | grep nginx

# Dosyaların var olduğunu kontrol edin
ls -la /usr/share/nginx/html

# index.html var mı?
cat /usr/share/nginx/html/index.html

# Nginx yapılandırmasını kontrol edin
nginx -t

# Nginx loglarını kontrol edin
cat /var/log/nginx/error.log
cat /var/log/nginx/access.log
```

### 3. Coolify Reverse Proxy Yapılandırmasını Kontrol Edin

Coolify dashboard'da:
1. Resource'unuzu seçin
2. **Settings** → **General** bölümüne gidin
3. **Domains for frontend**: `plan.uguratadargun.com` olduğundan emin olun
4. **Save** butonuna tıklayın
5. **Redeploy** yapın

### 4. Coolify Traefik Yapılandırmasını Kontrol Edin

Coolify Traefik kullanıyor. Traefik'in container'ları bulması için labels gerekebilir.

**Kontrol:**
```bash
# Traefik container'ını bulun
docker ps | grep traefik

# Traefik loglarını kontrol edin
docker logs <traefik-container-name>
```

## Olası Sorunlar ve Çözümler

### Sorun 1: Coolify Container'ları Tanımıyor

**Belirti:** Container'lar çalışıyor ama Coolify reverse proxy onları bulamıyor.

**Çözüm:** Docker Compose dosyasına labels ekleyin (zaten eklendi). Ama Coolify'ın beklediği label formatı farklı olabilir.

### Sorun 2: Nginx Çalışmıyor

**Belirti:** Container çalışıyor ama nginx içinde çalışmıyor.

**Çözüm:**
```bash
docker exec -it <frontend-container> nginx -t
docker exec -it <frontend-container> ps aux | grep nginx
```

### Sorun 3: Dosyalar Eksik

**Belirti:** Build başarılı ama `/usr/share/nginx/html` klasörü boş.

**Çözüm:**
```bash
docker exec -it <frontend-container> ls -la /usr/share/nginx/html
```

Eğer boşsa, build başarısız olmuş olabilir. Build loglarını kontrol edin.

### Sorun 4: Coolify Domain Mapping Yanlış

**Belirti:** Domain ayarı yapılmış ama Coolify container'ı bulamıyor.

**Çözüm:**
1. Coolify dashboard'da resource'unuzu seçin
2. **Settings** → **General** → **Domains for frontend** kontrol edin
3. Domain'i silip tekrar ekleyin
4. **Save** ve **Redeploy**

## En Hızlı Çözüm: Container Loglarını Kontrol Edin

Coolify dashboard'da:
1. Resource'unuzu seçin
2. **Logs** sekmesine gidin
3. Frontend container'ının loglarını kontrol edin
4. Hata mesajları varsa paylaşın

## Alternatif: Direkt Container'a Erişim Testi

```bash
# Frontend container'ının port'una direkt erişim test edin
# (Coolify'ın internal network'ünden)
docker exec -it <frontend-container> wget -O- http://localhost/

# Eğer bu çalışıyorsa, sorun Coolify reverse proxy'de
# Eğer bu da 404 veriyorsa, sorun nginx yapılandırmasında
```

## Sonuç

Container'lar çalışıyor ama Coolify reverse proxy onları bulamıyor. Muhtemelen:
1. Coolify'ın domain mapping'i yanlış
2. Veya Coolify'ın beklediği label formatı farklı

Container loglarını ve nginx loglarını paylaşın, daha spesifik bir çözüm önerebilirim.

