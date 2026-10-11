export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'snoozed';
export type DoseSource = 'manual' | 'smart_bottle' | 'nfc_tap' | 'voice';
export type MedicineForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: MedicineForm;
  color: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal';
  instruction: string;
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
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

