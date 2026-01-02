import { Router } from "express";
import { database } from "../db.js";

const router = Router();

const monthNames = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
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
router.get("/", (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Get all tasks to find the date range
    const allTasks = database.getTasks();
    const taskDates: string[] = allTasks
      .map((t) => t.weekStart)
      .filter(Boolean);

    // Find earliest and latest task dates
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    if (taskDates.length > 0) {
      const sortedDates = taskDates.sort();
      earliestDate = new Date(sortedDates[0]);
      latestDate = new Date(sortedDates[sortedDates.length - 1]);
    }

    // Ocak'ın ilk Pazartesi'sini bul
    const januaryFirst = new Date(currentYear, 0, 1);
    const januaryFirstMonday = getMonday(januaryFirst);

    // Bugünün Pazartesi'sini bul
    const todayMonday = getMonday(today);

    // Determine start date: earliest task date, January first Monday, or today's Monday (whichever is earliest)
    let startMonday =
      januaryFirstMonday > todayMonday ? januaryFirstMonday : todayMonday;

    if (earliestDate) {
      const earliestMonday = getMonday(earliestDate);
      if (earliestMonday < startMonday) {
        startMonday = earliestMonday;
      }
    }

    // Determine end date: latest task date or today + 52 weeks (whichever is later)
    let endMonday = new Date(todayMonday);
    endMonday.setDate(endMonday.getDate() + 52 * 7); // 52 weeks forward

    if (latestDate) {
      const latestMonday = getMonday(latestDate);
      // Add at least 4 weeks after latest task
      const latestWithBuffer = new Date(latestMonday);
      latestWithBuffer.setDate(latestWithBuffer.getDate() + 4 * 7);
      if (latestWithBuffer > endMonday) {
        endMonday = latestWithBuffer;
      }
    }

    // Calculate total weeks needed
    const weeksDiff = Math.ceil(
      (endMonday.getTime() - startMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const totalWeeks = Math.max(weeksDiff, 56); // At least 56 weeks (4 back + 52 forward)

    const weeks = [];

    for (let i = 0; i < totalWeeks; i++) {
      const weekMonday = new Date(startMonday);
      weekMonday.setDate(startMonday.getDate() + i * 7);

      const weekFriday = getFriday(weekMonday);
      const displayText = formatWeekRange(weekMonday, weekFriday);

      // Bugünün bu hafta içinde olup olmadığını kontrol et
      const isCurrent = today >= weekMonday && today <= weekFriday;

      weeks.push({
        startDate: weekMonday.toISOString().split("T")[0],
        endDate: weekFriday.toISOString().split("T")[0],
        displayText,
        isCurrent,
      });
    }

    res.json(weeks);
  } catch (error) {
    console.error("Error generating weeks:", error);
    res.status(500).json({ error: "Failed to fetch weeks" });
  }
});

export default router;
