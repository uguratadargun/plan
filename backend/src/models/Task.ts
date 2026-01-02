export interface Task {
  id: string;
  personIds: string[]; // Birden fazla kişiye atanabilir
  weekStart: string; // ISO date (Pazartesi)
  name: string; // Board'da görünen kısa isim
  description?: string; // Detaylı açıklama (hover'da görünür)
  color: string; // Task rengi
  // Backward compatibility
  personId?: string;
  status?: 'pending' | 'in-progress' | 'completed'; // Eski veriler için
}

