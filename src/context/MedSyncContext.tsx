import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Medicine, DoseLog, LiveTelemetryEvent, AnalyticsSummary, UserProfile } from '../types';

interface MedSyncContextType {
  medicines: Medicine[];
  doseLogs: DoseLog[];
  selectedDate: string; // "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;
  todayDoses: DoseLog[];
  analytics: AnalyticsSummary;
  liveFeed: LiveTelemetryEvent[];
  isLiveSimulationActive: boolean;
  setIsLiveSimulationActive: (active: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  seniorMode: boolean;
  setSeniorMode: (enabled: boolean) => void;
  // Authentication & Disclaimer (Stored locally)
  isAuthenticated: boolean;
  currentUser: UserProfile;
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (accepted: boolean) => void;
  login: (email: string, password: string, customName?: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  clearAllUserData: () => void;
  loadDemoData: () => void;
  // Actions
  takeDose: (doseId: string, source?: DoseLog['source']) => void;
  skipDose: (doseId: string, reason?: string) => void;
  snoozeDose: (doseId: string, minutes?: number) => void;
  undoDose: (doseId: string) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  refillMedicine: (id: string, amount?: number) => void;
  triggerSimulatedCapOpen: (medicineId?: string) => void;
  resetToSampleData: () => void;
  activeNotification: { title: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  clearNotification: () => void;
}

const MedSyncContext = createContext<MedSyncContextType | undefined>(undefined);

// Web Audio synthesizer for haptic chime feedback
const playChime = (type: 'take' | 'skip' | 'alert' = 'take') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'take') {
      // Pleasant high double chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'skip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio context not allowed or unsupported
  }
};

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Metformin HCl',
    genericName: 'Glucophage',
    dosage: '500 mg',
    form: 'tablet',
    color: 'emerald',
    instruction: 'Take with morning and evening meal',
    scheduleTimes: ['08:00', '20:00'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    inventoryRemaining: 24,
    inventoryTotal: 60,
    refillThreshold: 8,
    smartBottleConnected: true,
    smartBottleBattery: 94,
    smartBottleCapId: 'CAP-MET-01',
    prescribedFor: 'Blood Glucose Management',
    doctor: 'Dr. Evelyn Reed',
    active: true,
  },
  {
    id: 'med-2',
    name: 'Lisinopril',
    genericName: 'Prinivil',
    dosage: '10 mg',
    form: 'tablet',
    color: 'blue',
    instruction: 'Take in the morning on empty stomach',
    scheduleTimes: ['08:00'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    inventoryRemaining: 18,
    inventoryTotal: 30,
    refillThreshold: 5,
    smartBottleConnected: true,
    smartBottleBattery: 88,
    smartBottleCapId: 'CAP-LIS-02',
    prescribedFor: 'Hypertension',
    doctor: 'Dr. Evelyn Reed',
    active: true,
  },
  {
    id: 'med-3',
    name: 'Atorvastatin',
    genericName: 'Lipitor',
    dosage: '20 mg',
    form: 'tablet',
    color: 'indigo',
    instruction: 'Take at night before bed',
    scheduleTimes: ['21:00'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    inventoryRemaining: 6, // Low inventory alert!
    inventoryTotal: 30,
    refillThreshold: 7,
    smartBottleConnected: false,
    prescribedFor: 'Cholesterol Regulation',
    doctor: 'Dr. Marcus Vance',
    active: true,
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 & K2',
    genericName: 'Cholecalciferol',
    dosage: '2,000 IU',
    form: 'capsule',
    color: 'amber',
    instruction: 'Take with lunchtime meal containing fat',
    scheduleTimes: ['12:30'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    inventoryRemaining: 42,
    inventoryTotal: 90,
    refillThreshold: 14,
    smartBottleConnected: true,
    smartBottleBattery: 76,
    smartBottleCapId: 'CAP-VIT-04',
    prescribedFor: 'Bone & Immune Support',
    doctor: 'Self-Care Protocol',
    active: true,
  },
  {
    id: 'med-5',
    name: 'Sertraline HCl',
    genericName: 'Zoloft',
    dosage: '50 mg',
    form: 'tablet',
    color: 'rose',
    instruction: 'Take once daily after breakfast',
    scheduleTimes: ['08:30'],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    inventoryRemaining: 14,
    inventoryTotal: 30,
    refillThreshold: 5,
    smartBottleConnected: false,
    prescribedFor: 'Mood & Serotonin Balance',
    doctor: 'Dr. Alan Harper',
    active: true,
  }
];

// Helper to format ISO date "YYYY-MM-DD"
const getIsoDate = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

// Generate realistic historic logs
const generateInitialDoseLogs = (meds: Medicine[]): DoseLog[] => {
  const logs: DoseLog[] = [];
  const today = new Date();

  // Generate logs for past 14 days up to today
  for (let i = 14; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    const dateStr = getIsoDate(targetDate);
    const dayOfWeek = targetDate.getDay();

    meds.forEach(med => {
      if (!med.daysOfWeek.includes(dayOfWeek)) return;

      med.scheduleTimes.forEach((timeStr, tIndex) => {
        const id = `dose-${dateStr}-${med.id}-${tIndex}`;

        if (i > 0) {
          // Historical days: mostly taken on time with realistic variations
          const rand = Math.random();
          let status: DoseLog['status'] = 'taken';
          let variance = Math.floor(Math.random() * 25) - 8; // -8m to +17m
          let source: DoseLog['source'] = med.smartBottleConnected ? 'smart_bottle' : 'manual';

          if (rand > 0.94) {
            status = 'skipped';
            variance = 0;
          } else if (rand > 0.88) {
            // Late dose
            variance = Math.floor(Math.random() * 90) + 35; // 35m to 125m late
          }

          const [h, m] = timeStr.split(':').map(Number);
          const takenH = h + Math.floor((m + variance) / 60);
          const takenM = Math.abs((m + variance) % 60);
          const takenTimeStr = `${String(takenH).padStart(2, '0')}:${String(takenM).padStart(2, '0')}`;

          logs.push({
            id,
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            scheduledTime: timeStr,
            date: dateStr,
            status,
            takenAt: status === 'taken' ? `${dateStr}T${takenTimeStr}:00` : undefined,
            varianceMinutes: status === 'taken' ? variance : undefined,
            source,
            note: status === 'skipped' ? 'Patient reported fasting / travel delay' : undefined
          });
        } else {
          // Today's doses: morning doses taken, afternoon/evening pending
          const [h] = timeStr.split(':').map(Number);
          const currentHour = today.getHours();

          let status: DoseLog['status'] = 'pending';
          let varianceMinutes: number | undefined = undefined;
          let takenAt: string | undefined = undefined;

          if (h <= 9) {
            // Morning doses already taken
            status = 'taken';
            varianceMinutes = Math.floor(Math.random() * 12) - 3;
            const takenH = h;
            const takenM = Math.min(59, Math.max(0, 15 + varianceMinutes));
            takenAt = `${dateStr}T${String(takenH).padStart(2, '0')}:${String(takenM).padStart(2, '0')}:00`;
          } else if (h === 12 && currentHour >= 13) {
            status = 'taken';
            varianceMinutes = 6;
            takenAt = `${dateStr}T12:36:00`;
          }

          logs.push({
            id,
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            scheduledTime: timeStr,
            date: dateStr,
            status,
            takenAt,
            varianceMinutes,
            source: med.smartBottleConnected ? 'smart_bottle' : 'manual'
          });
        }
      });
    });
  }

  return logs;
};

const INITIAL_LIVE_FEED: LiveTelemetryEvent[] = [
  {
    id: 'evt-1',
    timestamp: '08:04 AM',
    type: 'cap_opened',
    medicineName: 'Metformin HCl 500mg',
    message: 'Smart Bottle Cap #1 detected seal break',
    varianceText: '+4m on-time'
  },
  {
    id: 'evt-2',
    timestamp: '08:05 AM',
    type: 'dose_logged',
    medicineName: 'Metformin HCl 500mg',
    message: 'Dose registered & telemetry verified via BLE mesh',
    varianceText: 'Verified'
  },
  {
    id: 'evt-3',
    timestamp: '08:07 AM',
    type: 'dose_logged',
    medicineName: 'Lisinopril 10mg',
    message: 'Cap #2 sensor intake acknowledged',
    varianceText: '+7m on-time'
  },
  {
    id: 'evt-4',
    timestamp: '08:32 AM',
    type: 'dose_logged',
    medicineName: 'Sertraline HCl 50mg',
    message: 'Logged manually by patient via tap',
    varianceText: '+2m on-time'
  },
  {
    id: 'evt-5',
    timestamp: '12:35 PM',
    type: 'dose_logged',
    medicineName: 'Vitamin D3 & K2',
    message: 'Smart Bottle Cap #4 intake confirmed with meal',
    varianceText: '+5m on-time'
  }
];

export const MedSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to clean empty slate (no example user data)
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('medsync_medicines_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('medsync_logs_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [selectedDate, setSelectedDate] = useState<string>(getIsoDate());
  const [liveFeed, setLiveFeed] = useState<LiveTelemetryEvent[]>(() => {
    const saved = localStorage.getItem('medsync_live_feed_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [seniorMode, setSeniorMode] = useState<boolean>(true); // Default to Senior Accessibility mode!
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Authentication & Disclaimer states stored locally
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('medsync_is_authenticated_v1');
    const sessionAuth = sessionStorage.getItem('medsync_is_authenticated_v1');
    return savedAuth === 'true' || sessionAuth === 'true';
  });

  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(() => {
    const saved = localStorage.getItem('medsync_disclaimer_accepted_v1');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('medsync_current_user_v1');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch {}
    }
    return {
      name: '',
      email: '',
      doctor: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: []
    };
  });

  const login = useCallback((email: string, password: string, customName?: string, rememberMe = true) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { success: false, error: 'Please enter both your name/email and password.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password or PIN must be at least 4 characters long.' };
    }

    let displayName = customName?.trim() || '';
    if (!displayName) {
      if (trimmedEmail.toLowerCase().includes('sarah')) {
        displayName = 'Sarah Chen';
      } else {
        const prefix = trimmedEmail.split('@')[0].split('.');
        displayName = prefix.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Patient';
      }
    }

    const updatedUser: UserProfile = {
      name: displayName,
      email: trimmedEmail,
      doctor: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: []
    };

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setDisclaimerAccepted(true);

    if (rememberMe) {
      localStorage.setItem('medsync_is_authenticated_v1', 'true');
      localStorage.setItem('medsync_disclaimer_accepted_v1', 'true');
      localStorage.setItem('medsync_current_user_v1', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('medsync_is_authenticated_v1', 'true');
      localStorage.setItem('medsync_disclaimer_accepted_v1', 'true');
    }

    try {
      const existing = localStorage.getItem('medsync_registered_accounts_v1') || '{}';
      const accounts = JSON.parse(existing);
      accounts[trimmedEmail.toLowerCase()] = { email: trimmedEmail, name: displayName, lastLogin: new Date().toISOString() };
      localStorage.setItem('medsync_registered_accounts_v1', JSON.stringify(accounts));
    } catch {}

    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('medsync_is_authenticated_v1');
    sessionStorage.removeItem('medsync_is_authenticated_v1');
  }, []);

  const clearAllUserData = useCallback(() => {
    setMedicines([]);
    setDoseLogs([]);
    setLiveFeed([]);
    setCurrentUser({
      name: '',
      email: '',
      doctor: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: []
    });
    setIsAuthenticated(false);
    setDisclaimerAccepted(false);

    localStorage.removeItem('medsync_medicines_v2');
    localStorage.removeItem('medsync_logs_v2');
    localStorage.removeItem('medsync_live_feed_v2');
    localStorage.removeItem('medsync_current_user_v1');
    localStorage.removeItem('medsync_is_authenticated_v1');
    localStorage.removeItem('medsync_disclaimer_accepted_v1');
    sessionStorage.clear();
  }, []);

  const loadDemoData = useCallback(() => {
    const demoUser: UserProfile = {
      name: 'Sarah Chen',
      email: 'sarah.chen@medsync.care',
      avatarUrl: '/src/assets/images/patient_profile_avatar_1791152429334.jpg',
      doctor: 'Dr. Evelyn Reed (Cardiology & Internal Medicine)',
      emergencyContact: 'David Chen (Son)',
      emergencyPhone: '(555) 234-5678',
      allergies: ['Penicillin', 'Sulfa drugs']
    };
    const demoLogs = generateInitialDoseLogs(INITIAL_MEDICINES);

    setMedicines(INITIAL_MEDICINES);
    setDoseLogs(demoLogs);
    setLiveFeed(INITIAL_LIVE_FEED);
    setCurrentUser(demoUser);
    setIsAuthenticated(true);
    setDisclaimerAccepted(true);

    localStorage.setItem('medsync_medicines_v2', JSON.stringify(INITIAL_MEDICINES));
    localStorage.setItem('medsync_logs_v2', JSON.stringify(demoLogs));
    localStorage.setItem('medsync_current_user_v1', JSON.stringify(demoUser));
    localStorage.setItem('medsync_is_authenticated_v1', 'true');
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('medsync_medicines_v2', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('medsync_logs_v2', JSON.stringify(doseLogs));
  }, [doseLogs]);

  const clearNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActiveNotification({ title, message, type });
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Today's Doses for selectedDate
  const todayDoses = useMemo(() => {
    return doseLogs
      .filter(l => l.date === selectedDate)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [doseLogs, selectedDate]);

  // Analytics Computation
  const analytics = useMemo<AnalyticsSummary>(() => {
    const todayLogs = doseLogs.filter(l => l.date === getIsoDate());
    const totalToday = todayLogs.length;
    const takenToday = todayLogs.filter(l => l.status === 'taken').length;
    const todayAdherence = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

    // Overall metrics across historical logged doses
    const completedOrSkipped = doseLogs.filter(l => l.status === 'taken' || l.status === 'skipped');
    const totalTaken = completedOrSkipped.filter(l => l.status === 'taken').length;
    const totalCompleted = completedOrSkipped.length;
    const overallAdherence = totalCompleted > 0 ? Number(((totalTaken / totalCompleted) * 100).toFixed(1)) : 95.0;

    // Variance metrics for taken doses
    const takenDosesWithVariance = completedOrSkipped.filter(l => l.status === 'taken' && l.varianceMinutes !== undefined);
    const onTimeCount = takenDosesWithVariance.filter(l => Math.abs(l.varianceMinutes!) <= 30).length;
    const lateCount = takenDosesWithVariance.filter(l => l.varianceMinutes! > 30).length;
    const skippedCount = completedOrSkipped.filter(l => l.status === 'skipped').length;

    const onTimePercentage = totalCompleted > 0 ? Math.round((onTimeCount / totalCompleted) * 100) : 84;
    const latePercentage = totalCompleted > 0 ? Math.round((lateCount / totalCompleted) * 100) : 11;
    const skippedPercentage = totalCompleted > 0 ? Math.round((skippedCount / totalCompleted) * 100) : 5;

    // Inventory metrics
    const remainingPills = medicines.reduce((sum, m) => sum + m.inventoryRemaining, 0);
    const lowInventoryAlerts = medicines.filter(m => m.inventoryRemaining <= m.refillThreshold).length;

    return {
      overallAdherenceRate: overallAdherence,
      todayAdherenceRate: todayAdherence,
      dosesTakenToday: takenToday,
      dosesTotalToday: totalToday,
      currentStreakDays: 19,
      bestStreakDays: 42,
      onTimePercentage,
      latePercentage,
      skippedPercentage,
      totalLoggedDoses: doseLogs.length,
      pillsRemainingTotal: remainingPills,
      lowInventoryAlertsCount: lowInventoryAlerts,
    };
  }, [doseLogs, medicines]);

  // Actions
  const takeDose = useCallback((doseId: string, source: DoseLog['source'] = 'manual') => {
    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const nowTimestamp = now.toISOString();

    setDoseLogs(prev => {
      return prev.map(log => {
        if (log.id === doseId) {
          // Calculate minutes difference
          const [schedH, schedM] = log.scheduledTime.split(':').map(Number);
          const [nowH, nowM] = nowTimeStr.split(':').map(Number);
          const schedMinutes = schedH * 60 + schedM;
          const currentMinutes = nowH * 60 + nowM;
          const variance = currentMinutes - schedMinutes;

          return {
            ...log,
            status: 'taken',
            takenAt: nowTimestamp,
            varianceMinutes: variance,
            source
          };
        }
        return log;
      });
    });

    // Reduce inventory for that medicine
    const targetLog = doseLogs.find(l => l.id === doseId);
    if (targetLog) {
      setMedicines(prev => prev.map(m => {
        if (m.id === targetLog.medicineId) {
          return {
            ...m,
            inventoryRemaining: Math.max(0, m.inventoryRemaining - 1)
          };
        }
        return m;
      }));

      // Add to live telemetry feed
      const newEvent: LiveTelemetryEvent = {
        id: `evt-${Date.now()}`,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'dose_logged',
        medicineName: `${targetLog.medicineName} ${targetLog.dosage}`,
        message: source === 'smart_bottle' ? 'Verified by Smart Cap IoT telemetry' : 'Logged via patient mobile confirmation',
        varianceText: 'Confirmed'
      };
      setLiveFeed(prev => [newEvent, ...prev.slice(0, 19)]);

      showToast(
        'Dose Logged',
        `${targetLog.medicineName} (${targetLog.dosage}) marked as taken on schedule.`,
        'success'
      );
    }

    if (soundEnabled) playChime('take');
  }, [doseLogs, soundEnabled, showToast]);

  const skipDose = useCallback((doseId: string, reason = 'Skipped by patient') => {
    const targetLog = doseLogs.find(l => l.id === doseId);
    setDoseLogs(prev => prev.map(l => l.id === doseId ? { ...l, status: 'skipped', note: reason } : l));

    if (targetLog) {
      const newEvent: LiveTelemetryEvent = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'dose_logged',
        medicineName: `${targetLog.medicineName}`,
        message: `Dose skipped: ${reason}`,
        varianceText: 'Skipped'
      };
      setLiveFeed(prev => [newEvent, ...prev.slice(0, 19)]);

      showToast(
        'Dose Skipped',
        `${targetLog.medicineName} was recorded as skipped.`,
        'warning'
      );
    }

    if (soundEnabled) playChime('skip');
  }, [doseLogs, soundEnabled, showToast]);

  const snoozeDose = useCallback((doseId: string, minutes = 15) => {
    const targetLog = doseLogs.find(l => l.id === doseId);
    setDoseLogs(prev => prev.map(l => l.id === doseId ? { ...l, status: 'snoozed', note: `Snoozed +${minutes}m` } : l));

    if (targetLog) {
      showToast(
        'Reminder Snoozed',
        `Snoozed ${targetLog.medicineName} for ${minutes} minutes.`,
        'info'
      );
    }
    if (soundEnabled) playChime('alert');
  }, [doseLogs, soundEnabled, showToast]);

  const undoDose = useCallback((doseId: string) => {
    const targetLog = doseLogs.find(l => l.id === doseId);
    const wasTaken = targetLog?.status === 'taken';

    setDoseLogs(prev => prev.map(l => l.id === doseId ? {
      ...l,
      status: 'pending',
      takenAt: undefined,
      varianceMinutes: undefined
    } : l));

    if (wasTaken && targetLog) {
      setMedicines(prev => prev.map(m => m.id === targetLog.medicineId ? { ...m, inventoryRemaining: m.inventoryRemaining + 1 } : m));
    }

    showToast('Action Undone', 'Dose status reset to pending.', 'info');
  }, [doseLogs, showToast]);

  const addMedicine = useCallback((newMed: Omit<Medicine, 'id'>) => {
    const id = `med-${Date.now()}`;
    const medicine: Medicine = { ...newMed, id };
    setMedicines(prev => [...prev, medicine]);

    // Also populate today's dose log for this medicine if scheduled for today
    const today = new Date();
    const dateStr = getIsoDate(today);
    const dayOfWeek = today.getDay();

    if (medicine.daysOfWeek.includes(dayOfWeek)) {
      const newDoses: DoseLog[] = medicine.scheduleTimes.map((time, idx) => ({
        id: `dose-${dateStr}-${id}-${idx}`,
        medicineId: id,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        scheduledTime: time,
        date: dateStr,
        status: 'pending',
        source: medicine.smartBottleConnected ? 'smart_bottle' : 'manual'
      }));
      setDoseLogs(prev => [...prev, ...newDoses]);
    }

    showToast('Prescription Added', `${medicine.name} added to your active regimen.`, 'success');
  }, [showToast]);

  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showToast('Updated', 'Medicine schedule and details updated.', 'info');
  }, [showToast]);

  const deleteMedicine = useCallback((id: string) => {
    const target = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    setDoseLogs(prev => prev.filter(l => l.medicineId !== id));
    showToast('Removed', `${target?.name || 'Medicine'} removed from regimen.`, 'info');
  }, [medicines, showToast]);

  const refillMedicine = useCallback((id: string, amount = 30) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const updated = m.inventoryRemaining + amount;
        return {
          ...m,
          inventoryRemaining: updated,
          inventoryTotal: Math.max(m.inventoryTotal, updated)
        };
      }
      return m;
    }));

    const target = medicines.find(m => m.id === id);
    const newEvent: LiveTelemetryEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'refill_alert',
      medicineName: target?.name || 'Medicine',
      message: `Refill confirmed: +${amount} units added to stock`,
      varianceText: 'Refilled'
    };
    setLiveFeed(prev => [newEvent, ...prev.slice(0, 19)]);
    showToast('Refill Recorded', `+${amount} doses added to ${target?.name}.`, 'success');
    if (soundEnabled) playChime('take');
  }, [medicines, soundEnabled, showToast]);

  // Simulate real-time smart bottle cap opening
  const triggerSimulatedCapOpen = useCallback((medicineId?: string) => {
    const target = medicineId
      ? medicines.find(m => m.id === medicineId)
      : medicines.find(m => m.smartBottleConnected) || medicines[0];

    if (!target) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEvent: LiveTelemetryEvent = {
      id: `evt-${Date.now()}`,
      timestamp: timeStr,
      type: 'cap_opened',
      medicineName: target.name,
      message: `Smart Cap Sensor: Cap removed from ${target.name} container`,
      varianceText: 'Real-Time Sync'
    };

    setLiveFeed(prev => [newEvent, ...prev.slice(0, 19)]);

    // Check if there is an open pending dose for today
    const pendingDose = todayDoses.find(d => d.medicineId === target.id && d.status === 'pending');
    if (pendingDose) {
      setTimeout(() => {
        takeDose(pendingDose.id, 'smart_bottle');
      }, 700);
    } else {
      showToast('Smart Cap Opened', `${target.name} sensor detected container access.`, 'info');
      if (soundEnabled) playChime('alert');
    }
  }, [medicines, todayDoses, takeDose, soundEnabled, showToast]);

  // Real-time periodic simulated heartbeat ping
  useEffect(() => {
    if (!isLiveSimulationActive) return;

    const interval = setInterval(() => {
      // Send occasional telemetry ping (e.g. battery check, BLE sync)
      const randomMed = medicines[Math.floor(Math.random() * medicines.length)];
      if (randomMed && randomMed.smartBottleConnected) {
        const pingEvent: LiveTelemetryEvent = {
          id: `ping-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'battery_ping',
          medicineName: randomMed.name,
          message: `BLE Ping: ${randomMed.smartBottleCapId || 'Cap #1'} signal strong (98dBm, ${randomMed.smartBottleBattery ?? 90}%)`,
          varianceText: 'Live Sync'
        };
        setLiveFeed(prev => [pingEvent, ...prev.slice(0, 19)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLiveSimulationActive, medicines]);

  const resetToSampleData = useCallback(() => {
    setMedicines(INITIAL_MEDICINES);
    setDoseLogs(generateInitialDoseLogs(INITIAL_MEDICINES));
    setLiveFeed(INITIAL_LIVE_FEED);
    setSelectedDate(getIsoDate());
    showToast('Reset Complete', 'Loaded fresh demonstration medication data.', 'info');
  }, [showToast]);

  return (
    <MedSyncContext.Provider
      value={{
        medicines,
        doseLogs,
        selectedDate,
        setSelectedDate,
        todayDoses,
        analytics,
        liveFeed,
        isLiveSimulationActive,
        setIsLiveSimulationActive,
        soundEnabled,
        setSoundEnabled,
        seniorMode,
        setSeniorMode,
        isAuthenticated,
        currentUser,
        disclaimerAccepted,
        setDisclaimerAccepted,
        login,
        logout,
        clearAllUserData,
        loadDemoData,
        takeDose,
        skipDose,
        snoozeDose,
        undoDose,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        refillMedicine,
        triggerSimulatedCapOpen,
        resetToSampleData,
        activeNotification,
        clearNotification
      }}
    >
      {children}
    </MedSyncContext.Provider>
  );
};

export const useMedSync = () => {
  const context = useContext(MedSyncContext);
  if (!context) {
    throw new Error('useMedSync must be used within a MedSyncProvider');
  }
  return context;
};
