# 502 Bad Gateway - Hata Ayıklama Rehberi

## Eğer Hala 502 Alıyorsanız

### 1. Nginx Logs Kontrol Et (Coolify Dashboard)
```bash
# Frontend container logs
# Şu satırları arayın:
# - "upstream timed out"
# - "no resolver defined to resolve"
# - "could not be resolved"
```

### 2. Backend Health Check
```bash
curl https://planback.uguratadargun.com/health
# Response: {"status": "healthy"}
```

### 3. Frontend'den Backend'e Erişim Test Et
Coolify Dashboard → Frontend Container → **Execute Command**:
```bash
# Container içinde şunu çalıştır:
wget -O- https://planback.uguratadargun.com/health

# Eğer çalışmazsa:
nslookup planback.uguratadargun.com
```

### 4. Nginx Config Syntax Test
Coolify Dashboard → Frontend Container → **Execute Command**:
```bash
nginx -t
# Expected: "syntax is ok" ve "test is successful"
```

### 5. Network Connectivity
```bash
# Container içinde:
ping -c 3 planback.uguratadargun.com
```

---

## Yapılan Değişiklikler

### İlk Commit (e48428a)
- ✅ `Host` header'ı düzenlendi
- ✅ `X-Forwarded-Host` eklendi

### İkinci Commit (c091e81)
- ✅ DNS Resolver eklendi (127.0.0.11, 8.8.8.8, 8.8.4.4)
- ✅ SSL verification ayarları eklendi
- ✅ `proxy_ssl_verify off`
- ✅ `proxy_ssl_server_name on`

---

## Alternatif Çözüm: Environment Variable ile Backend URL

Eğer hala çalışmazsa, backend URL'i environment variable yapabiliriz:

### Dockerfile Değişikliği
```dockerfile
# Frontend Dockerfile'a ekle:
ENV BACKEND_URL=https://planback.uguratadargun.com
```

### nginx.conf Değişikliği
```nginx
location /api {
    set $backend ${BACKEND_URL};
    proxy_pass $backend;
    # ... rest of config
}
```

Bu sayede Coolify'da backend URL'i environment variable olarak yönetebilirsin.
