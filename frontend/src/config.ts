export interface AppConfig {
  isDev: boolean;
  devApiUrl: string;
  prodApiUrl: string;
  customApiUrl?: string;
}

export const APP_CONFIG: AppConfig = {
  // Lokal JSON veritabanına bağlanmak için true yapın
  isDev: false,
  devApiUrl: 'http://localhost:5001/api',
  // Canlı ortam API adresi
  prodApiUrl: 'https://planback.uguratadargun.com/api',
  // İsteğe bağlı özel URL (örn. test sunucusu). Tanımlarsanız öncelik bu değerde olur.
  customApiUrl: undefined
};
