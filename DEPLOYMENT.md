# Coolify Deployment Guide

Bu proje, her servis için ayrı Coolify resource kullanarak deploy edilir.

## Backend Deployment

1. Coolify Dashboard → **New Resource**
2. **Type**: Dockerfile
3. **Repository**: Bu Git repository'nin URL'si
4. **Branch**: `main`
5. **Root Directory**: `backend`
6. **Dockerfile Path**: `Dockerfile`
7. **Port**: `5001`
8. **Domain**: `planback.uguratadargun.com`
9. **Environment Variables** (opsiyonel - zaten Dockerfile'da var):
   ```
   PORT=5001
   NODE_ENV=production
   ```
10. **Persistent Storage**:
    - Name: `backend-data`
    - Path: `/app/data`
11. **Save** → **Deploy**

## Frontend Deployment

1. Coolify Dashboard → **New Resource**
2. **Type**: **Nixpacks** (Dockerfile değil!)
3. **Repository**: Bu Git repository'nin URL'si (backend ile aynı)
4. **Branch**: `main`
5. **Root Directory**: `frontend`
6. **Port**: `3000`
7. **Domain**: `plan.uguratadargun.com`
8. **Environment Variables**:
   ```
   VITE_API_URL=https://planback.uguratadargun.com/api
   NODE_ENV=production
   ```
9. **Save** → **Deploy**

**Not**: Nixpacks otomatik olarak:
- Node.js 20 kurar
- `npm ci` ile dependencies yükler
- `npm run build` ile build eder
- `serve` ile static files'ları serve eder
- SPA routing otomatik çalışır (serve.json sayesinde)

## Doğrulama

- Backend Health: https://planback.uguratadargun.com/health
- Frontend: https://plan.uguratadargun.com

## Sorun Giderme

### Frontend Backend'e Bağlanamıyor

1. `VITE_API_URL` build argument'inin doğru olduğundan emin olun
2. Backend CORS ayarlarının frontend domain'ine izin verdiğini kontrol edin
3. Her iki container'ın da "Running" durumunda olduğunu doğrulayın

### Container Çalışmıyor

1. Coolify logs sekmesinden hata mesajlarını kontrol edin
2. Build logs'da hata olup olmadığına bakın
3. Gerekirse redeploy yapın
