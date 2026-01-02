# Coolify Deployment Fix

Coolify'da Docker Compose kullanırken karşılaştığınız hatayı çözmek için:

## Sorun

Coolify, `docker-compose.yml` dosyasını Dockerfile olarak kullanmaya çalışıyor. Bu yüzden hata alıyorsunuz.

## Çözüm 1: Coolify'da Resource Type'ı Kontrol Edin

1. Coolify dashboard'a gidin
2. Resource'unuzu seçin
3. **Settings** → **General** bölümüne gidin
4. **Build Pack** veya **Docker Compose** seçeneğini kontrol edin
5. Eğer "Dockerfile" seçiliyse, "Docker Compose" olarak değiştirin

## Çözüm 2: Her Servis İçin Ayrı Resource Oluşturun (Önerilen)

Coolify'da Docker Compose desteği bazen sorunlu olabiliyor. Daha güvenilir bir yöntem, her servis için ayrı resource oluşturmaktır:

### Backend Resource

1. **New Resource** → **Dockerfile**
2. **Repository URL**: Git repo URL'iniz
3. **Root Directory**: `backend`
4. **Dockerfile Path**: `Dockerfile` (veya `backend/Dockerfile`)
5. **Port**: `5001`
6. **Environment Variables**:
   - `PORT=5001`
   - `NODE_ENV=production`
7. **Volumes** (Persistent Storage):
   - Path: `/app/data`
   - Volume Name: `backend-data`

### Frontend Resource

1. **New Resource** → **Dockerfile**
2. **Repository URL**: Git repo URL'iniz
3. **Root Directory**: `frontend`
4. **Dockerfile Path**: `Dockerfile` (veya `frontend/Dockerfile`)
5. **Port**: `80`
6. **Build Arguments**:
   - `VITE_API_URL` → Backend'in public URL'i (örn: `https://backend.yourdomain.com/api`)
7. **Environment Variables**:
   - `VITE_API_URL` → Backend'in public URL'i

### Frontend'te API URL'i Ayarlama

Frontend build sırasında backend URL'ini bilmesi gerekiyor. İki seçenek var:

**Seçenek A: Build Argument (Önerilen)**
- Coolify'da Frontend resource'unun **Build Arguments** bölümüne:
  - `VITE_API_URL=https://backend.yourdomain.com/api`

**Seçenek B: Nginx Proxy**
- Frontend'in `nginx.conf` dosyası zaten `/api` path'ini proxy ediyor
- Backend'in internal service name'ini kullanabilirsiniz (Coolify'da network otomatik oluşturulur)
- Ama bu durumda backend'in internal URL'ini bilmeniz gerekir

## Çözüm 3: Docker Compose Dosyasını Güncelleyin

`docker-compose.yml` dosyası güncellendi:
- `version` satırı kaldırıldı (Docker Compose v2 için gerekli değil)
- Volume'lar named volume olarak değiştirildi
- Network eklendi

Eğer Coolify'da Docker Compose resource type'ı kullanıyorsanız, bu güncellenmiş dosyayı kullanabilirsiniz.

## Önerilen Yaklaşım

**Her servis için ayrı resource oluşturmak** en güvenilir yöntemdir çünkü:
- Her servis bağımsız olarak scale edilebilir
- Her servis için ayrı domain/URL kullanabilirsiniz
- Daha iyi monitoring ve logging
- Daha kolay troubleshooting

## Environment Variables

### Backend
- `PORT=5001` (default, değiştirilebilir)
- `NODE_ENV=production`

### Frontend
- `VITE_API_URL` → Backend'in public URL'i (build time'da gerekli)

## Notlar

1. Backend'in public URL'ini frontend'e build argument olarak geçmeniz gerekiyor
2. Database persistence için volume mount kullanın
3. Her iki servis de health check endpoint'leri içerir
4. SSL sertifikası için Coolify'ın Let's Encrypt entegrasyonunu kullanın

