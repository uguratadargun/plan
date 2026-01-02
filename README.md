# Haftalık Planlama Uygulaması

React ve Node.js ile geliştirilmiş haftalık iş planlama uygulaması. Tablo formatında kişiler ve haftalar, güncel gün vurgusu ve backend API ile veri yönetimi.

## Özellikler

- 📅 Haftalık planlama tablosu (Pazartesi-Cuma)
- 👥 Kişi yönetimi (ekleme, düzenleme, silme)
- ✅ İş yönetimi (ekleme, düzenleme, silme, durum takibi)
- 🎨 Modern ve responsive arayüz
- 🔄 Güncel hafta vurgusu (timeline)
- 💾 JSON dosya tabanlı veri saklama

## Kurulum

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend `http://localhost:5001` adresinde çalışacaktır.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

## Kullanım

1. **Kişi Ekleme**: Tablonun sol üst köşesindeki "+ Kişi Ekle" butonuna tıklayın.
2. **İş Ekleme**: Tablodaki herhangi bir hücreye tıklayarak yeni iş ekleyebilirsiniz.
3. **İş Düzenleme**: Mevcut bir işe tıklayarak düzenleyebilir veya silebilirsiniz.
4. **Kişi Düzenleme**: Kişi satırının yanındaki ✎ ikonuna tıklayarak düzenleyebilirsiniz.

## Teknolojiler

- **Frontend**: React 18, TypeScript, Vite, Axios
- **Backend**: Node.js, Express, TypeScript
- **Veritabanı**: JSON dosya (backend/data/db.json)

## Proje Yapısı

```
project-management/
├── frontend/
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── utils/         # Yardımcı fonksiyonlar
│   │   └── types/         # TypeScript tipleri
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/        # API route'ları
│   │   ├── models/        # Veri modelleri
│   │   └── db.ts          # Veritabanı yönetimi
│   └── package.json
└── README.md
```

