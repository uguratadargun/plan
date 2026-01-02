export interface Person {
  id: string;
  name: string;
  color?: string;
  order?: number;
}

export interface Task {
  id: string;
  personIds: string[]; // Birden fazla kişiye atanabilir
  weekStart: string; // ISO date (Pazartesi)
  name: string; // Board'da görünen kısa isim
  description?: string; // Detaylı açıklama (hover'da görünür)
  status?: 'pending' | 'in-progress' | 'completed';
  // Backward compatibility
  personId?: string;
}

export interface Week {
  startDate: string; // ISO date
  endDate: string;   // ISO date
  displayText: string; // "5-9 Ocak"
  isCurrent: boolean;
}

