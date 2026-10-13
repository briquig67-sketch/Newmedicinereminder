export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';
export type DoseSource = 'manual' | 'smart_bottle' | 'nfc_tap' | 'voice';
export type MedicineForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler';
export type FrequencyType = 'daily' | 'every_x_days' | 'days_of_week' | 'weekly' | 'every_2_weeks' | 'as_needed';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  doseQuantity: number; // Qty of pills/units to take per intake (e.g. 1, 2)
  form: MedicineForm;
  color: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal';
  instruction: string;
  scheduleTimes: string[]; // Multiple times per day, e.g. ["08:00", "13:00", "20:00"]
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  frequencyType: FrequencyType; // 'daily' | 'every_x_days' | 'days_of_week' | 'weekly' | 'every_2_weeks' | 'as_needed'
  intervalDays?: number; // e.g. 3 for "Every 3rd day", 2 for "Every 2nd day"
  startDate?: string; // "YYYY-MM-DD" start anchor for interval scheduling
  inventoryRemaining: number;
  inventoryTotal: number;
  refillThreshold: number;
  smartBottleConnected: boolean;
  smartBottleBattery?: number;
  smartBottleCapId?: string;
  prescribedFor?: string;
  doctor?: string;
  active: boolean;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  quantity: number; // Qty of units/pills to take for this dose
  scheduledTime: string; // "08:00"
  date: string; // "YYYY-MM-DD"
  status: DoseStatus;
  takenAt?: string; // "YYYY-MM-DDTHH:mm:ss"
  varianceMinutes?: number; // e.g. +7 (7 min late), -5 (5 min early)
  source: DoseSource;
  note?: string;
}

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  type: 'cap_opened' | 'cap_closed' | 'dose_logged' | 'snooze' | 'refill_alert' | 'battery_ping';
  medicineName: string;
  message: string;
  varianceText?: string;
}

export interface AnalyticsSummary {
  overallAdherenceRate: number; // percentage, e.g. 94.2
  todayAdherenceRate: number;
  dosesTakenToday: number;
  dosesTotalToday: number;
  currentStreakDays: number;
  bestStreakDays: number;
  onTimePercentage: number;
  latePercentage: number;
  skippedPercentage: number;
  totalLoggedDoses: number;
  pillsRemainingTotal: number;
  lowInventoryAlertsCount: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  doctor?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string[];
}

