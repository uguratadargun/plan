import { Week } from '../types';

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

/**
 * Verilen tarihin Pazartesi gününü bulur
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi
  return new Date(d.setDate(diff));
}

/**
 * Verilen Pazartesi tarihinden Cuma tarihini hesaplar
 */
export function getFriday(monday: Date): Date {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return friday;
}

/**
 * Tarihi "5-9 Ocak" formatında string'e çevirir
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = monthNames[startDate.getMonth()];
  
  return `${startDay}-${endDay} ${month}`;
}

/**
 * Ocak'tan itibaren dinamik haftalar oluşturur
 * Bugünden başlar, geçmişe 1 ay (4 hafta), geleceğe yeterince fazla hafta gösterir
 */
export function generateWeeks(): Week[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Ocak'ın ilk Pazartesi'sini bul
  const januaryFirst = new Date(currentYear, 0, 1);
  const januaryFirstMonday = getMonday(januaryFirst);
  
  // Bugünün Pazartesi'sini bul
  const todayMonday = getMonday(today);
  
  // Başlangıç tarihi: Ocak'ın ilk Pazartesi'si veya bugünün Pazartesi'si (hangisi daha geç ise)
  const startMonday = januaryFirstMonday > todayMonday ? januaryFirstMonday : todayMonday;
  
  // Geçmişe 4 hafta (1 ay) ekle
  const weeksBack = 4;
  const actualStartMonday = new Date(startMonday);
  actualStartMonday.setDate(startMonday.getDate() - (weeksBack * 7));
  
  // Geleceğe 52 hafta (1 yıl) ekle
  const weeksForward = 52;
  const totalWeeks = weeksBack + weeksForward;
  
  const weeks: Week[] = [];
  
  for (let i = 0; i < totalWeeks; i++) {
    const weekMonday = new Date(actualStartMonday);
    weekMonday.setDate(actualStartMonday.getDate() + (i * 7));
    
    const weekFriday = getFriday(weekMonday);
    const displayText = formatWeekRange(weekMonday, weekFriday);
    
    // Bugünün bu hafta içinde olup olmadığını kontrol et
    const isCurrent = today >= weekMonday && today <= weekFriday;
    
    weeks.push({
      startDate: weekMonday.toISOString().split('T')[0],
      endDate: weekFriday.toISOString().split('T')[0],
      displayText,
      isCurrent
    });
  }
  
  return weeks;
}

/**
 * İki tarihin aynı hafta içinde olup olmadığını kontrol eder
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const monday1 = getMonday(date1);
  const monday2 = getMonday(date2);
  return monday1.getTime() === monday2.getTime();
}

