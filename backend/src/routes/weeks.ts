import { Router } from 'express';

const router = Router();

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getFriday(monday: Date): Date {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return friday;
}

function formatWeekRange(startDate: Date, endDate: Date): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const month = monthNames[startDate.getMonth()];
  return `${startDay}-${endDay} ${month}`;
}

// GET /api/weeks
router.get('/', (req, res) => {
  try {
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
    
    const weeks = [];
    
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
    
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weeks' });
  }
});

export default router;

