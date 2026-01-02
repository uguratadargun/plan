# Coolify - Her Servis İçin Ayrı Resource (Önerilen Çözüm)

Docker Compose ile sorun yaşıyorsanız, her servis için ayrı resource oluşturun. Bu yaklaşım daha güvenilir ve Coolify'ın native desteği ile çalışır.

## Adım 1: Mevcut Docker Compose Resource'unu Silin (Opsiyonel)

Eğer mevcut Docker Compose resource'unuz varsa:
1. Coolify dashboard'da resource'unuzu seçin
2. **Settings** → **Danger Zone** → **Delete Resource**
3. Onaylayın

**Not:** Eğer silmek istemiyorsanız, sadece yeni resource'lar oluşturun.

## Adım 2: Backend Resource Oluşturun

1. Coolify dashboard'da **New Resource** butonuna tıklayın
2. **Type**: **Dockerfile** seçin
3. **Repository**: Git repository URL'inizi girin
4. **Branch**: `main` (veya kullandığınız branch)
5. **Root Directory**: `backend`
6. **Dockerfile Path**: `Dockerfile` (veya `backend/Dockerfile`)
7. **Port**: `5001`
8. **Domain**: `planback.uguratadargun.com` (veya istediğiniz backend domain'i)
9. **Environment Variables** ekleyin:
   ```
   PORT=5001
   NODE_ENV=production
   ```
10. **Persistent Storage** ekleyin:
    - **Name**: `backend-data`
    - **Path**: `/app/data`
11. **Save** ve **Deploy** edin

## Adım 3: Frontend Resource Oluşturun

1. Coolify dashboard'da **New Resource** butonuna tıklayın
2. **Type**: **Dockerfile** seçin
3. **Repository**: Git repository URL'inizi girin (backend ile aynı)
4. **Branch**: `main` (veya kullandığınız branch)
5. **Root Directory**: `frontend`
6. **Dockerfile Path**: `Dockerfile` (veya `frontend/Dockerfile`)
7. **Port**: `80`
8. **Domain**: `plan.uguratadargun.com`
9. **Build Arguments** ekleyin:
   ```
   VITE_API_URL=https://planback.uguratadargun.com/api
   ```
   **ÖNEMLİ:** Backend'in domain'ini buraya yazın!
10. **Save** ve **Deploy** edin

## Adım 4: Nginx Yapılandırmasını Güncelleyin (Opsiyonel)

Eğer frontend ve backend'i aynı domain'de kullanmak isterseniz (örn: `plan.uguratadargun.com` ve `plan.uguratadargun.com/api`), nginx proxy kullanabilirsiniz. Ama ayrı domain'ler kullanmak daha basit.

## Kontrol Listesi

- [ ] Backend resource oluşturuldu mu?
- [ ] Backend domain ayarı yapıldı mı? (`planback.uguratadargun.com`)
- [ ] Backend environment variables eklendi mi? (`PORT=5001`, `NODE_ENV=production`)
- [ ] Backend persistent storage eklendi mi? (`/app/data`)
- [ ] Frontend resource oluşturuldu mu?
- [ ] Frontend domain ayarı yapıldı mı? (`plan.uguratadargun.com`)
- [ ] Frontend build argument eklendi mi? (`VITE_API_URL=https://planback.uguratadargun.com/api`)
- [ ] Her iki resource da deploy edildi mi?
- [ ] Her iki container da "Running" durumunda mı?

## Avantajlar

✅ Her servis bağımsız olarak scale edilebilir
✅ Her servis için ayrı domain/URL kullanabilirsiniz
✅ Daha iyi monitoring ve logging
✅ Daha kolay troubleshooting
✅ Coolify'ın native desteği ile çalışır
✅ Daha güvenilir ve stabil

## Sorun Giderme

### Frontend Backend'e Bağlanamıyor

**Kontrol:**
1. `VITE_API_URL` build argument'inin doğru olduğundan emin olun
2. Backend'in public URL'ini kontrol edin: `https://planback.uguratadargun.com/health`
3. Backend container'ının çalıştığından emin olun
4. CORS ayarlarını kontrol edin (backend'de zaten var)

### Backend 404 Veriyor

**Kontrol:**
1. Backend domain ayarını kontrol edin
2. Backend container'ının çalıştığından emin olun
3. Backend loglarını kontrol edin

### Frontend 404 Veriyor

**Kontrol:**
1. Frontend domain ayarını kontrol edin
2. Frontend container'ının çalıştığından emin olun
3. Frontend build'in başarılı olduğundan emin olun
4. Nginx loglarını kontrol edin

## Sonuç

Bu yaklaşım Docker Compose'dan çok daha güvenilir ve Coolify'ın native desteği ile çalışır. 404 hatası almayacaksınız çünkü her servis Coolify tarafından doğru şekilde yönetilir.

