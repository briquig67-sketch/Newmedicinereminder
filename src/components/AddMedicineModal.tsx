import React, { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Clock, 
  Pill, 
  Calendar, 
  CalendarDays, 
  Check, 
  Trash2, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Medicine, MedicineForm, FrequencyType } from '../types';
import { 
  getDoseQuantityLabel, 
  getRepeatLabel, 
  formatTimeAmPm, 
  getNextScheduledDates, 
  getLocalTodayIso 
} from '../utils/scheduleUtils';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicine: Omit<Medicine, 'id'>) => void;
}

const INSTRUCTION_PRESETS = [
  'Take with food or meal',
  'Take on an empty stomach',
  'Take with a full glass of water',
  'Take at bedtime',
  'Do not crush or chew'
];

const TIME_PRESETS = [
  { label: 'Morning', time: '08:00' },
  { label: 'Noon', time: '12:00' },
  { label: 'Afternoon', time: '14:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Bedtime', time: '21:00' }
];

const DAY_NAMES = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' }
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [doseQuantity, setDoseQuantity] = useState(1);
  const [instruction, setInstruction] = useState('');
  const [prescribedFor, setPrescribedFor] = useState('');
  const [doctor, setDoctor] = useState('');

  // Times during the day (e.g. ["08:00", "20:00"])
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(['08:00']);

  // Repeat & interval frequency
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [intervalDays, setIntervalDays] = useState(3); // Default for 'every_x_days' e.g. Every 3rd day
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default if days_of_week
  const [startDate, setStartDate] = useState(getLocalTodayIso());

  // Inventory
  const [inventoryTotal, setInventoryTotal] = useState(30);

  // Live preview of the medicine's schedule
  const previewMed = useMemo<Medicine>(() => ({
    id: 'preview',
    name: name || 'Medication',
    dosage: dosage || '1 dose',
    doseQuantity,
    form,
    color: 'emerald',
    instruction,
    scheduleTimes,
    daysOfWeek: frequencyType === 'days_of_week' 
      ? selectedDaysOfWeek 
      : frequencyType === 'weekly' 
      ? [new Date().getDay()] 
      : [0, 1, 2, 3, 4, 5, 6],
    frequencyType,
    intervalDays,
    startDate,
    inventoryRemaining: inventoryTotal,
    inventoryTotal,
    refillThreshold: 7,
    smartBottleConnected: false,
    active: true
  }), [name, dosage, doseQuantity, form, instruction, scheduleTimes, frequencyType, intervalDays, selectedDaysOfWeek, startDate, inventoryTotal]);

  const upcomingDates = useMemo(() => {
    return getNextScheduledDates(previewMed, 4, startDate);
  }, [previewMed, startDate]);

  if (!isOpen) return null;

  // Handler for Daily Times Presets
  const handleSetDailyTimesPreset = (presetCount: number) => {
    if (presetCount === 1) setScheduleTimes(['08:00']);
    else if (presetCount === 2) setScheduleTimes(['08:00', '20:00']);
    else if (presetCount === 3) setScheduleTimes(['08:00', '13:00', '20:00']);
    else if (presetCount === 4) setScheduleTimes(['08:00', '12:00', '17:00', '21:00']);
  };

  const handleAddTimeSlot = () => {
    const lastTime = scheduleTimes[scheduleTimes.length - 1] || '08:00';
    const [h, m] = lastTime.split(':').map(Number);
    const nextH = Math.min(23, (h + 4) % 24);
    const formattedNext = `${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setScheduleTimes([...scheduleTimes, formattedNext]);
  };

  const handleUpdateTimeSlot = (index: number, newTime: string) => {
    const updated = [...scheduleTimes];
    updated[index] = newTime;
    setScheduleTimes(updated);
  };

  const handleRemoveTimeSlot = (index: number) => {
    if (scheduleTimes.length <= 1) return;
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
  };

  const toggleDayOfWeek = (day: number) => {
    if (selectedDaysOfWeek.includes(day)) {
      if (selectedDaysOfWeek.length > 1) {
        setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== day));
      }
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, day].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    // Sort schedule times chronologically
    const sortedTimes = [...scheduleTimes].sort((a, b) => a.localeCompare(b));

    onAdd({
      name: name.trim(),
      dosage: dosage.trim(),
      doseQuantity: Math.max(1, doseQuantity),
      form,
      color: 'emerald',
      instruction: instruction.trim() || 'Take as directed',
      scheduleTimes: sortedTimes.length > 0 ? sortedTimes : ['08:00'],
      daysOfWeek: frequencyType === 'days_of_week' 
        ? selectedDaysOfWeek 
        : frequencyType === 'weekly' 
        ? [new Date(startDate).getDay()] 
        : [0, 1, 2, 3, 4, 5, 6],
      frequencyType,
      intervalDays: frequencyType === 'every_x_days' ? Math.max(2, intervalDays) : undefined,
      startDate,
      inventoryRemaining: inventoryTotal,
      inventoryTotal,
      refillThreshold: 7,
      smartBottleConnected: false,
      prescribedFor: prescribedFor.trim() || undefined,
      doctor: doctor.trim() || undefined,
      active: true,
    });

    // Reset and close
    setName('');
    setDosage('');
    setDoseQuantity(1);
    setInstruction('');
    setPrescribedFor('');
    setScheduleTimes(['08:00']);
    setFrequencyType('daily');
    setIntervalDays(3);
    setStartDate(getLocalTodayIso());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
              <Pill className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Prescription</h3>
              <p className="text-xs font-semibold text-slate-600">Set dosage, intake quantity, times &amp; repeat intervals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-slate-900">
          
          {/* SECTION 1: Medicine Details */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-700" />
              <span>1. Medication Details</span>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Medication Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metformin, Lisinopril, Warfarin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-bold shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Strength / Dosage <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg, 10 mg, 5 ml"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-semibold shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Form
                </label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as MedicineForm)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold shadow-sm cursor-pointer"
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="liquid">Liquid / Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="inhaler">Inhaler</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Quantity to Take */}
          <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Quantity to Take Each Time</span>
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                {getDoseQuantityLabel(doseQuantity, form)}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600">
              How many {form}s or units should the patient take at each scheduled intake?
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDoseQuantity(Math.max(1, doseQuantity - 1))}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border-2 border-slate-300 text-slate-900 font-black text-xl flex items-center justify-center shadow-sm cursor-pointer"
              >
                -
              </button>
              
              <div className="flex-1 bg-white border-2 border-emerald-400 rounded-xl py-2 px-3 text-center shadow-sm">
                <span className="text-2xl font-black font-mono text-emerald-900">
                  {doseQuantity}
                </span>
                <span className="text-xs font-bold text-slate-600 block capitalize">
                  {doseQuantity === 1 ? form : `${form}s`} per dose
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDoseQuantity(doseQuantity + 1)}
                className="w-12 h-12 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border-2 border-slate-300 text-slate-900 font-black text-xl flex items-center justify-center shadow-sm cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Quick Quantity Chips */}
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setDoseQuantity(qty)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all border cursor-pointer ${
                    doseQuantity === qty
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {qty} {qty === 1 ? form : `${form}s`}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Times During the Day */}
          <div className="space-y-3.5 bg-blue-50/60 p-4 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>3. Times During The Day</span>
              </div>
              <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-300">
                {scheduleTimes.length} {scheduleTimes.length === 1 ? 'time' : 'times'} daily
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600">
              Select how many times per day and set the exact reminder times:
            </p>

            {/* Frequency Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { count: 1, label: '1x Daily' },
                { count: 2, label: '2x Daily' },
                { count: 3, label: '3x Daily' },
                { count: 4, label: '4x Daily' },
              ].map(preset => (
                <button
                  key={preset.count}
                  type="button"
                  onClick={() => handleSetDailyTimesPreset(preset.count)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    scheduleTimes.length === preset.count
                      ? 'bg-blue-700 text-white border-blue-800 shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Configured Time Slots */}
            <div className="space-y-2.5 pt-1">
              {scheduleTimes.map((time, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border-2 border-slate-300 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleUpdateTimeSlot(idx, e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-black text-base text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-xs font-extrabold text-slate-700 font-mono">
                      ({formatTimeAmPm(time)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Preset Buttons */}
                    <div className="hidden sm:flex items-center gap-1">
                      {TIME_PRESETS.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleUpdateTimeSlot(idx, p.time)}
                          className={`text-[10px] px-1.5 py-1 rounded font-bold border ${
                            time === p.time 
                              ? 'bg-blue-100 text-blue-800 border-blue-300' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {scheduleTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeSlot(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove this time"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddTimeSlot}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-400 hover:border-blue-600 bg-white hover:bg-blue-50/50 text-blue-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Another Time Slot</span>
            </button>
          </div>

          {/* SECTION 4: Repeats & Days Apart (Every 3rd day, Every week, etc.) */}
          <div className="space-y-3.5 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-300">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-amber-700" />
                <span>4. Repeats &amp; Schedule Intervals</span>
              </div>
              <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                {getRepeatLabel(previewMed)}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700">
              How often is this medication taken? (e.g. Daily, every 3rd day, every week, etc.)
            </p>

            {/* Repeat Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFrequencyType('daily')}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'daily'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Every day</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'daily' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Daily regimen
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrequencyType('every_x_days');
                  setIntervalDays(2);
                }}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'every_x_days' && intervalDays === 2
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Every 2nd day</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'every_x_days' && intervalDays === 2 ? 'text-amber-100' : 'text-slate-500'}`}>
                  Alternate days
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrequencyType('every_x_days');
                  setIntervalDays(3);
                }}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'every_x_days' && intervalDays === 3
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Every 3rd day</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'every_x_days' && intervalDays === 3 ? 'text-amber-100' : 'text-slate-500'}`}>
                  2 days in between
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFrequencyType('weekly')}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'weekly'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Every week</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'weekly' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Once a week
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFrequencyType('every_2_weeks')}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'every_2_weeks'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Every 2 weeks</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'every_2_weeks' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Bi-weekly schedule
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFrequencyType('days_of_week')}
                className={`p-2.5 rounded-xl text-xs font-extrabold text-left border transition-all cursor-pointer ${
                  frequencyType === 'days_of_week'
                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm ring-2 ring-amber-400'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <div className="font-black">Specific Days</div>
                <div className={`text-[10px] mt-0.5 ${frequencyType === 'days_of_week' ? 'text-amber-100' : 'text-slate-500'}`}>
                  e.g. Mon, Wed, Fri
                </div>
              </button>
            </div>

            {/* Interval Days Stepper if 'every_x_days' is active */}
            {frequencyType === 'every_x_days' && (
              <div className="bg-white border-2 border-amber-400 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Custom Days Apart:</span>
                  <span className="font-mono font-black text-amber-900 text-sm">
                    Every {intervalDays} days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 7, 10, 14].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setIntervalDays(n)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                        intervalDays === n
                          ? 'bg-amber-700 text-white border-amber-800'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {n}d
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specific Days of Week toggles if 'days_of_week' is active */}
            {frequencyType === 'days_of_week' && (
              <div className="bg-white border-2 border-amber-400 rounded-xl p-3 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Select active days:</span>
                <div className="flex items-center justify-between gap-1">
                  {DAY_NAMES.map(d => {
                    const isSelected = selectedDaysOfWeek.includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => toggleDayOfWeek(d.day)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedule Start Anchor Date */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  Schedule Starts From:
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Anchor date for intervals &amp; repeats
                </span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* Live Upcoming Dates Preview */}
            <div className="bg-white/90 border border-amber-300 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Upcoming Scheduled Dates Preview:</span>
              </div>
              {upcomingDates.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {upcomingDates.map((item, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                        item.isToday
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      {item.isToday ? 'Today (' + item.formatted + ')' : item.formatted}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No scheduled dates found</p>
              )}
            </div>
          </div>

          {/* SECTION 5: Supply & Instructions */}
          <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-700" />
              <span>5. Supply &amp; Instructions</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Supply Total ({form}s)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={inventoryTotal}
                  onChange={(e) => setInventoryTotal(Number(e.target.value))}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Reason / Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blood Pressure, Diabetes"
                  value={prescribedFor}
                  onChange={(e) => setPrescribedFor(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Instructions &amp; Meal Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Take with morning meal and full glass of water"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-medium shadow-sm"
              />
              
              {/* Instruction Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                {INSTRUCTION_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setInstruction(p)}
                    className="text-[11px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Save Prescription Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
