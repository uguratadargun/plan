# Coolify Deployment Guide

Bu projeyi Coolify'da deploy etmek için aşağıdaki adımları izleyin.

## Ön Gereksinimler

- Coolify kurulumu yapılmış olmalı
- Git repository'ye push edilmiş olmalı

## Deployment Adımları

### 1. Backend Deployment

1. Coolify dashboard'a giriş yapın
2. "New Resource" butonuna tıklayın
3. "Docker Compose" veya "Dockerfile" seçin
4. Repository URL'ini girin
5. **Root Directory**: `backend`
6. **Dockerfile Path**: `Dockerfile` (veya `backend/Dockerfile`)
7. **Port**: `5001`
8. **Environment Variables**:
   - `PORT=5001`
   - `NODE_ENV=production`
9. **Volumes** (Persistent Storage):
   - `/app/data` → `backend-data` (database dosyası için)

### 2. Frontend Deployment

1. Coolify dashboard'da "New Resource" butonuna tıklayın
2. "Dockerfile" seçin
3. Repository URL'ini girin
4. **Root Directory**: `frontend`
5. **Dockerfile Path**: `Dockerfile` (veya `frontend/Dockerfile`)
6. **Port**: `80`
7. **Build Arguments**:
   - `VITE_API_URL` → Backend'in public URL'i (örn: `https://api.yourdomain.com/api`)
8. **Environment Variables**:
   - `VITE_API_URL` → Backend'in public URL'i

### 3. Nginx Configuration (Alternatif)

Eğer nginx proxy kullanmak isterseniz, frontend'in nginx.conf dosyasındaki backend URL'ini güncelleyin:

```nginx
location /api {
    proxy_pass http://YOUR_BACKEND_URL:5001;
    ...
}
```

### 4. Network Configuration

Coolify'da her iki servis de aynı network'te olmalı. Eğer docker-compose kullanıyorsanız, otomatik olarak aynı network'te olacaklardır.

## Environment Variables

### Backend
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment (production)

### Frontend
- `VITE_API_URL`: Backend API URL (örn: `https://api.yourdomain.com/api`)

## Database Persistence

Backend'in `data` klasörü volume olarak mount edilmelidir. Coolify'da:
- Volume Name: `backend-data`
- Mount Path: `/app/data`

## Health Checks

Her iki servis de health check endpoint'leri içerir:
- Backend: `http://localhost:5001/health`
- Frontend: `http://localhost/`

## Troubleshooting

1. **Frontend backend'e bağlanamıyor**: 
   - `VITE_API_URL` environment variable'ının doğru olduğundan emin olun
   - Backend'in public URL'ini kontrol edin

2. **Database kayboluyor**:
   - Volume mount'un doğru yapıldığından emin olun
   - `/app/data` path'inin writable olduğundan emin olun

3. **Build hatası**:
   - Node.js version'un 20 olduğundan emin olun
   - Dependencies'lerin doğru install edildiğinden emin olun

## Production Tips

1. SSL sertifikası için Coolify'ın Let's Encrypt entegrasyonunu kullanın
2. Backend ve frontend için ayrı domain'ler kullanabilirsiniz:
   - Frontend: `https://app.yourdomain.com`
   - Backend: `https://api.yourdomain.com`
3. Database için daha güvenli bir çözüm (PostgreSQL, MongoDB) kullanmayı düşünün

