import React, { useMemo, useState } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  BellOff, 
  Zap, 
  BatteryMedium, 
  Check, 
  LogOut, 
  ShieldCheck,
  Plus,
  Pill,
  Trash2
} from 'lucide-react';
import { DoseLog } from '../types';
import { AddMedicineModal } from './AddMedicineModal';

export const TodayView: React.FC = () => {
  const {
    todayDoses,
    selectedDate,
    setSelectedDate,
    analytics,
    takeDose,
    skipDose,
    snoozeDose,
    undoDose,
    triggerSimulatedCapOpen,
    medicines,
    seniorMode,
    currentUser,
    logout,
    addMedicine,
    clearAllUserData
  } = useMedSync();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Generate 7-day strip around today
  const dateStrip = useMemo(() => {
    const dates = [];
    const today = new Date();
    // 3 days back to 3 days forward
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isToday = i === 0;
      dates.push({ iso, dayName, dayNum, isToday });
    }
    return dates;
  }, []);

  // Group doses by time of day
  const groupedDoses = useMemo(() => {
    const groups: {
      morning: DoseLog[];
      afternoon: DoseLog[];
      evening: DoseLog[];
      night: DoseLog[];
    } = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    todayDoses.forEach((dose) => {
      const [hour] = dose.scheduledTime.split(':').map(Number);
      if (hour < 12) {
        groups.morning.push(dose);
      } else if (hour < 17) {
        groups.afternoon.push(dose);
      } else if (hour < 21) {
        groups.evening.push(dose);
      } else {
        groups.night.push(dose);
      }
    });

    return groups;
  }, [todayDoses]);

  // Next upcoming pending dose
  const nextPendingDose = useMemo(() => {
    return todayDoses.find((d) => d.status === 'pending');
  }, [todayDoses]);

  // Smart bottle stats
  const connectedBottles = useMemo(() => {
    return medicines.filter((m) => m.smartBottleConnected);
  }, [medicines]);

  const totalDosesCount = todayDoses.length;
  const takenDosesCount = todayDoses.filter((d) => d.status === 'taken').length;
  const adherencePercent = totalDosesCount > 0 ? Math.round((takenDosesCount / totalDosesCount) * 100) : 100;

  // SVG Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (adherencePercent / 100) * circumference;

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Top Patient Greeting & IoT Beacon */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name || 'Patient'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-600 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center font-extrabold text-emerald-900 text-sm shadow-sm">
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ME'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-2 ring-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
              {currentUser.name ? `Good day, ${currentUser.name.split(' ')[0]}` : 'Good day'}
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span className="text-emerald-700 font-bold">Daily Medicine Plan</span>
              <span aria-hidden="true">·</span>
              <span>{medicines.length} {medicines.length === 1 ? 'Prescription' : 'Prescriptions'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Live Pill & Mobile Sign Out */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-full text-emerald-800 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono tracking-wide hidden sm:inline">LIVE</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer"
            title="Sign out of MedSync"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Interactive Date Carousel (High Contrast for Elderly) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          {dateStrip.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex-1 py-2.5 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-w-[46px] min-h-[54px] ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-extrabold shadow-md ring-2 ring-emerald-500'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <span className={`text-[11px] uppercase font-bold tracking-tight ${isSelected ? 'text-emerald-100' : 'text-slate-600'}`}>
                  {item.dayName}
                </span>
                <span className="text-base font-mono font-extrabold tabular-nums mt-0.5">
                  {item.dayNum}
                </span>
                {item.isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Daily Adherence Ring Card (Bright High-Contrast) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Today's Progress</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {takenDosesCount} <span className="text-slate-500 text-xl font-semibold">of {totalDosesCount} taken</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1.5 leading-snug">
              {adherencePercent === 100
                ? 'All medicines taken for today! Excellent job.'
                : nextPendingDose
                ? `Next: ${nextPendingDose.medicineName} at ${nextPendingDose.scheduledTime}`
                : 'Follow your schedule to maintain health.'}
            </p>
          </div>

          {/* Dynamic SVG Circular Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="text-slate-200 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="text-emerald-600 stroke-current transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {adherencePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Streak & Status Badges */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900 shrink-0">
              <Flame className="w-4 h-4 fill-amber-700 text-amber-700" />
            </div>
            <div>
              <div className="text-amber-800 text-[11px] font-bold uppercase tracking-tight">Active Streak</div>
              <div className="font-extrabold text-slate-900 font-mono text-sm tabular-nums">
                {analytics.currentStreakDays} Days
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
            <div className="p-1.5 rounded-lg bg-blue-200/80 text-blue-900 shrink-0">
              <Clock className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <div className="text-blue-800 text-[11px] font-bold uppercase tracking-tight">On-Time Rate</div>
              <div className="font-extrabold text-slate-900 font-mono text-sm tabular-nums">
                {analytics.onTimePercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Bottle Live Sync Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/smart_pill_bottle_1791152438379.jpg"
            alt="Smart Bottle"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-300 shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">Smart Pill Bottle Connected</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mt-0.5">
              <span>{connectedBottles.length} Cap Sensors Active</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-700" /> 92%
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => triggerSimulatedCapOpen()}
          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all whitespace-nowrap shadow-sm"
          title="Simulate opening smart bottle cap to log real-time dose"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-700 fill-emerald-600" />
          <span>Test Cap Open</span>
        </button>
      </div>

      {/* Scheduled Dose Timeline List (Senior-Friendly Card Design) */}
      <div className="space-y-4">
        {medicines.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-3.5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Pill className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Your Medicine Cabinet is Ready</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 max-w-xs mx-auto">
                No medications are added yet. Tap below to enter your first prescription or vitamin to start tracking your daily doses.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Add Your First Medicine</span>
            </button>
          </div>
        ) : todayDoses.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No medicines scheduled for this day</h3>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Select another day on the calendar or add a new scheduled dose time.
            </p>
          </div>
        ) : (
          (['morning', 'afternoon', 'evening', 'night'] as const).map((periodKey) => {
            const dosesInPeriod = groupedDoses[periodKey];
            if (dosesInPeriod.length === 0) return null;

            const periodLabels = {
              morning: { title: 'Morning', sub: 'Before 12:00 PM' },
              afternoon: { title: 'Afternoon', sub: '12:00 PM - 5:00 PM' },
              evening: { title: 'Evening', sub: '5:00 PM - 9:00 PM' },
              night: { title: 'Night', sub: '9:00 PM onwards' },
            };

            return (
              <div key={periodKey} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {periodLabels[periodKey].title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {periodLabels[periodKey].sub}
                  </span>
                </div>

                <div className="space-y-3">
                  {dosesInPeriod.map((dose) => (
                    <DoseCard
                      key={dose.id}
                      dose={dose}
                      seniorMode={seniorMode}
                      onTake={() => takeDose(dose.id, 'manual')}
                      onSkip={() => skipDose(dose.id, 'Patient skipped dose')}
                      onSnooze={() => snoozeDose(dose.id, 15)}
                      onUndo={() => undoDose(dose.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMedicine}
      />
    </div>
  );
};

// Sub-component: Senior-Friendly Dose Card
interface DoseCardProps {
  dose: DoseLog;
  seniorMode: boolean;
  onTake: () => void;
  onSkip: () => void;
  onSnooze: () => void;
  onUndo: () => void;
}

const DoseCard: React.FC<DoseCardProps> = ({
  dose,
  seniorMode,
  onTake,
  onSkip,
  onSnooze,
  onUndo,
}) => {
  const isTaken = dose.status === 'taken';
  const isSkipped = dose.status === 'skipped';
  const isSnoozed = dose.status === 'snoozed';
  const isPending = dose.status === 'pending';

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all duration-200 ${
        isTaken
          ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
          : isSkipped
          ? 'bg-slate-100/80 border-slate-300 opacity-70'
          : isSnoozed
          ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-slate-300 shadow-sm hover:border-slate-400'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight">
              {dose.medicineName}
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 shrink-0">
              {dose.dosage}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mt-1.5">
            <span className="flex items-center gap-1 font-mono font-bold text-slate-900 text-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              {dose.scheduledTime}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="truncate">
              {dose.source === 'smart_bottle' ? 'Smart Bottle Cap Synced' : 'Take with water'}
            </span>
          </div>

          {/* Status Metadata line in Clear Large Text */}
          {isTaken && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-800 font-extrabold bg-emerald-100/80 px-2.5 py-1 rounded-lg w-fit border border-emerald-300">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                Taken on schedule{' '}
                {dose.varianceMinutes !== undefined && (
                  <span className="font-mono text-[11px] font-bold">
                    ({dose.varianceMinutes > 0 ? `+${dose.varianceMinutes}m late` : `${Math.abs(dose.varianceMinutes)}m early`})
                  </span>
                )}
              </span>
            </div>
          )}

          {isSkipped && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-rose-800 font-bold bg-rose-100 px-2.5 py-1 rounded-lg w-fit border border-rose-300">
              <AlertCircle className="w-4 h-4" />
              <span>Skipped dose recorded</span>
            </div>
          )}

          {isSnoozed && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-amber-900 font-bold bg-amber-100 px-2.5 py-1 rounded-lg w-fit border border-amber-300">
              <Clock className="w-4 h-4" />
              <span>Reminder snoozed for 15 min</span>
            </div>
          )}
        </div>

        {/* Action Button Zone (Large 48-52px Touch Hitboxes for Elderly Hands) */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          {isPending && (
            <>
              <button
                onClick={onSnooze}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300 flex items-center justify-center transition-colors shadow-sm"
                title="Snooze 15 minutes"
              >
                <Clock className="w-5 h-5 text-amber-700 stroke-[2.5]" />
              </button>
              <button
                onClick={onSkip}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors shadow-sm"
                title="Skip dose"
              >
                <BellOff className="w-5 h-5 stroke-[2]" />
              </button>
              <button
                onClick={onTake}
                className="min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Take Dose</span>
              </button>
            </>
          )}

          {isSnoozed && (
            <button
              onClick={onTake}
              className="min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-md"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Take Now</span>
            </button>
          )}

          {(isTaken || isSkipped) && (
            <button
              onClick={onUndo}
              className="min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
