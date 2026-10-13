import { Medicine } from '../types';

/**
 * Parses a YYYY-MM-DD string into a local Date at midnight (00:00:00)
 * avoiding UTC timezone boundary issues.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Returns today's ISO date string (YYYY-MM-DD) in local time.
 */
export function getLocalTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object into YYYY-MM-DD string in local time.
 */
export function formatLocalDateToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a medicine is scheduled on a given ISO date (YYYY-MM-DD).
 */
export function isMedicineScheduledOnDate(med: Medicine, dateStr: string): boolean {
  if (med.active === false) return false;
  if (med.frequencyType === 'as_needed') return false;

  const target = parseLocalDate(dateStr);
  const targetDayOfWeek = target.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // 1. Daily frequency
  if (!med.frequencyType || med.frequencyType === 'daily') {
    if (med.daysOfWeek && med.daysOfWeek.length > 0 && med.daysOfWeek.length < 7) {
      return med.daysOfWeek.includes(targetDayOfWeek);
    }
    return true;
  }

  // 2. Specific Days of Week
  if (med.frequencyType === 'days_of_week') {
    return Array.isArray(med.daysOfWeek) && med.daysOfWeek.includes(targetDayOfWeek);
  }

  // 3. Anchor Date calculations for intervals & repeats
  const anchorDateStr = med.startDate || dateStr;
  const start = parseLocalDate(anchorDateStr);
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return false; // Date is before medicine start date

  // Every X days (e.g. Every 2nd day, Every 3rd day, Every 4th day)
  if (med.frequencyType === 'every_x_days') {
    const interval = Math.max(1, med.intervalDays || 1);
    return diffDays % interval === 0;
  }

  // Weekly
  if (med.frequencyType === 'weekly') {
    if (med.daysOfWeek && med.daysOfWeek.length > 0) {
      return med.daysOfWeek.includes(targetDayOfWeek);
    }
    return diffDays % 7 === 0;
  }

  // Every 2 weeks (bi-weekly)
  if (med.frequencyType === 'every_2_weeks') {
    return diffDays % 14 === 0;
  }

  return true;
}

/**
 * Calculates the next N scheduled dates for a medicine, starting from today or an anchor date.
 */
export function getNextScheduledDates(
  med: Medicine,
  count: number = 4,
  startDateStr: string = getLocalTodayIso()
): { iso: string; formatted: string; isToday: boolean }[] {
  if (med.frequencyType === 'as_needed') return [];

  const results: { iso: string; formatted: string; isToday: boolean }[] = [];
  const start = parseLocalDate(startDateStr);
  const todayIso = getLocalTodayIso();

  // Search ahead up to 90 days to find upcoming dates
  for (let i = 0; i <= 90 && results.length < count; i++) {
    const curr = new Date(start);
    curr.setDate(start.getDate() + i);
    const iso = formatLocalDateToIso(curr);

    if (isMedicineScheduledOnDate(med, iso)) {
      const isToday = iso === todayIso;
      const formatted = curr.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      results.push({ iso, formatted, isToday });
    }
  }

  return results;
}

/**
 * Formats the repeat pattern into plain, clear English for patients and caregivers.
 */
export function getRepeatLabel(med: Medicine): string {
  if (!med.frequencyType || med.frequencyType === 'daily') {
    if (med.daysOfWeek && med.daysOfWeek.length < 7 && med.daysOfWeek.length > 0) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return med.daysOfWeek.map(d => days[d]).join(', ');
    }
    return 'Every day';
  }

  if (med.frequencyType === 'every_x_days') {
    const n = med.intervalDays || 1;
    if (n === 1) return 'Every day';
    if (n === 2) return 'Every 2nd day (alternate days)';
    if (n === 3) return 'Every 3rd day';
    if (n === 4) return 'Every 4th day';
    if (n === 5) return 'Every 5th day';
    return `Every ${n} days`;
  }

  if (med.frequencyType === 'weekly') {
    if (med.daysOfWeek && med.daysOfWeek.length === 1) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Every week on ${days[med.daysOfWeek[0]]}`;
    }
    return 'Every week (once weekly)';
  }

  if (med.frequencyType === 'every_2_weeks') {
    return 'Every 2 weeks (bi-weekly)';
  }

  if (med.frequencyType === 'days_of_week') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (med.daysOfWeek.length === 5 && !med.daysOfWeek.includes(0) && !med.daysOfWeek.includes(6)) {
      return 'Weekdays (Mon-Fri)';
    }
    if (med.daysOfWeek.length === 2 && med.daysOfWeek.includes(0) && med.daysOfWeek.includes(6)) {
      return 'Weekends only';
    }
    return med.daysOfWeek.map(d => dayNames[d]).join(', ');
  }

  if (med.frequencyType === 'as_needed') {
    return 'As needed (PRN)';
  }

  return 'Every day';
}

/**
 * Formats quantity and form into a friendly instruction (e.g. "2 tablets", "1 capsule", "2 puffs").
 */
export function getDoseQuantityLabel(qty: number, form: string): string {
  const quantity = Math.max(1, qty || 1);
  const plural = quantity > 1 ? 's' : '';

  switch (form.toLowerCase()) {
    case 'tablet':
      return `${quantity} tablet${plural}`;
    case 'capsule':
      return `${quantity} capsule${plural}`;
    case 'liquid':
      return `${quantity} dose${plural}`;
    case 'injection':
      return `${quantity} injection${plural}`;
    case 'inhaler':
      return `${quantity} puff${plural}`;
    default:
      return `${quantity} unit${plural}`;
  }
}

/**
 * Converts "14:30" 24h format to friendly "2:30 PM".
 */
export function formatTimeAmPm(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${ampm}`;
}

/**
 * Summarizes the daily time frequency with human-readable AM/PM formatting.
 */
export function getDailyTimesSummary(times: string[]): string {
  if (!times || times.length === 0) return 'No scheduled times';
  const formattedTimes = times.map(formatTimeAmPm);
  if (times.length === 1) return `Once daily at ${formattedTimes[0]}`;
  if (times.length === 2) return `Twice daily (${formattedTimes.join(', ')})`;
  if (times.length === 3) return `3 times daily (${formattedTimes.join(', ')})`;
  return `${times.length} times daily (${formattedTimes.join(', ')})`;
}
