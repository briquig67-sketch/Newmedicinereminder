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
  BatteryMedium, 
  Check, 
  LogOut, 
  ShieldCheck,
  Plus,
  Pill,
  Trash2,
  Pencil,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { DoseLog, Medicine } from '../types';
import { AddMedicineModal } from './AddMedicineModal';
import { EditMedicineModal } from './EditMedicineModal';
import { 
  getRepeatLabel, 
  getDoseQuantityLabel, 
  formatTimeAmPm, 
  getLocalTodayIso,
  parseLocalDate 
} from '../utils/scheduleUtils';

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
    medicines,
    seniorMode,
    currentUser,
    logout,
    addMedicine,
    updateMedicine,
    deleteMedicine,
  } = useMedSync();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [dateOffset, setDateOffset] = useState(0); // Offset in weeks or days for exploring repeat intervals

  const todayIso = useMemo(() => getLocalTodayIso(), []);

  // Generate 7-day strip around the current view window
  const dateStrip = useMemo(() => {
    const dates = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + dateOffset * 7);

    // Show 7 days for the active window
    for (let i = -2; i <= 5; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const isToday = iso === todayIso;
      dates.push({ iso, dayName, dayNum, isToday });
    }
    return dates;
  }, [dateOffset, todayIso]);

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

  const isViewingToday = selectedDate === todayIso;
  const formattedSelectedDate = useMemo(() => {
    const target = parseLocalDate(selectedDate);
    return target.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, [selectedDate]);

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
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-600" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Patient Regimen
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Verified</span>
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
              {currentUser.name || 'Sarah Chen'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold">
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

      {/* Date Carousel & Navigation (Browse repeat days like every 3rd day, weekly) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5 font-black text-slate-900">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isViewingToday ? 'Today' : formattedSelectedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isViewingToday && (
              <button
                onClick={() => {
                  setSelectedDate(todayIso);
                  setDateOffset(0);
                }}
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold text-[11px] rounded-lg border border-emerald-300 transition-colors cursor-pointer"
              >
                Jump to Today
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setDateOffset(prev => prev - 1)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Previous days"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDateOffset(prev => prev + 1)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Next days"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          {dateStrip.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <button
                key={item.iso}
                onClick={() => setSelectedDate(item.iso)}
                className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 min-w-[44px] min-h-[52px] cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-extrabold shadow-md ring-2 ring-emerald-500'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 bg-slate-50 border border-slate-200'
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
              <span>{isViewingToday ? "Today's Progress" : `${formattedSelectedDate} Schedule`}</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {takenDosesCount} <span className="text-slate-500 text-xl font-semibold">of {totalDosesCount} taken</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1.5 leading-snug">
              {totalDosesCount === 0
                ? 'No doses scheduled on this day.'
                : adherencePercent === 100
                ? 'All scheduled medicines taken! Excellent job.'
                : nextPendingDose
                ? `Next: ${nextPendingDose.medicineName} (${nextPendingDose.quantity} units) at ${formatTimeAmPm(nextPendingDose.scheduledTime)}`
                : 'Stay consistent with your prescribed plan.'}
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

      {/* Scheduled Dose Timeline List */}
      <div className="space-y-4">
        {medicines.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-3.5">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Pill className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Your Medicine Cabinet is Ready</h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 max-w-xs mx-auto">
                No medications are added yet. Tap below to enter your first prescription, daily quantity, times, and repeat intervals.
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
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No medicines scheduled for {formattedSelectedDate}</h3>
            <p className="text-xs font-medium text-slate-600 max-w-xs mx-auto">
              Any medications with interval repeats (such as "every 3rd day" or "weekly") will automatically appear on their scheduled days.
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
                  {dosesInPeriod.map((dose) => {
                    const matchedMed = medicines.find(m => m.id === dose.medicineId);
                    return (
                      <DoseCard
                        key={dose.id}
                        dose={dose}
                        medicine={matchedMed}
                        seniorMode={seniorMode}
                        onTake={() => takeDose(dose.id, 'manual')}
                        onSkip={() => skipDose(dose.id, 'Patient skipped dose')}
                        onSnooze={() => snoozeDose(dose.id, 15)}
                        onUndo={() => undoDose(dose.id)}
                        onEdit={() => {
                          if (matchedMed) setEditingMedicine(matchedMed);
                        }}
                      />
                    );
                  })}
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

      <EditMedicineModal
        isOpen={Boolean(editingMedicine)}
        medicine={editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSave={updateMedicine}
        onDelete={deleteMedicine}
      />
    </div>
  );
};

// Sub-component: Senior-Friendly Dose Card with Quantity & Repeat Interval
interface DoseCardProps {
  dose: DoseLog;
  medicine?: Medicine;
  seniorMode: boolean;
  onTake: () => void;
  onSkip: () => void;
  onSnooze: () => void;
  onUndo: () => void;
  onEdit?: () => void;
}

const DoseCard: React.FC<DoseCardProps> = ({
  dose,
  medicine,
  seniorMode,
  onTake,
  onSkip,
  onSnooze,
  onUndo,
  onEdit,
}) => {
  const isTaken = dose.status === 'taken';
  const isSkipped = dose.status === 'skipped';
  const isSnoozed = dose.status === 'snoozed';
  const isPending = dose.status === 'pending';

  const qty = dose.quantity || medicine?.doseQuantity || 1;
  const form = medicine?.form || 'tablet';

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
            <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
              {dose.medicineName}
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 shrink-0">
              {dose.dosage}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                title="Edit prescription details"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time & Quantity to Take Row */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {/* Scheduled Time */}
            <div className="flex items-center gap-1 font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-700 stroke-[2.5]" />
              <span>{formatTimeAmPm(dose.scheduledTime)}</span>
            </div>

            {/* Quantity to take */}
            <div className="flex items-center gap-1 font-bold text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-300">
              <Pill className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              <span>Take {getDoseQuantityLabel(qty, form)}</span>
            </div>

            {/* Repeat Interval Badge (e.g. Every 3rd day, Every week) */}
            {medicine && (
              <div className="flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
                <CalendarDays className="w-3 h-3 text-amber-800" />
                <span>{getRepeatLabel(medicine)}</span>
              </div>
            )}
          </div>

          {/* Instructions Note if available */}
          {medicine?.instruction && (
            <p className="text-xs font-medium text-slate-600 mt-1.5 truncate">
              {medicine.instruction}
            </p>
          )}

          {/* Status Metadata line in Clear Large Text */}
          {isTaken && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-emerald-800 font-extrabold bg-emerald-100/90 px-2.5 py-1 rounded-lg w-fit border border-emerald-300">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                Taken on schedule ({getDoseQuantityLabel(qty, form)}){' '}
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
                className="min-h-[44px] min-w-[44px] rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Snooze 15 minutes"
              >
                <Clock className="w-5 h-5 text-amber-700 stroke-[2.5]" />
              </button>
              <button
                onClick={onSkip}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 border border-slate-300 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                title="Skip dose"
              >
                <BellOff className="w-5 h-5 stroke-[2]" />
              </button>
              <button
                onClick={onTake}
                className="min-h-[48px] px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Take {qty > 1 ? `${qty} ${form}s` : `${form}`}</span>
              </button>
            </>
          )}

          {isSnoozed && (
            <button
              onClick={onTake}
              className="min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Take Now ({qty})</span>
            </button>
          )}

          {(isTaken || isSkipped) && (
            <button
              onClick={onUndo}
              className="min-h-[40px] px-3 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
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
