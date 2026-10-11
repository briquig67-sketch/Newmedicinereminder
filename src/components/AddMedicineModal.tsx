import React, { useState } from 'react';
import { X, Plus, Clock, Pill } from 'lucide-react';
import { Medicine, MedicineForm } from '../types';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicine: Omit<Medicine, 'id'>) => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [instruction, setInstruction] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [inventoryTotal, setInventoryTotal] = useState(30);
  const [smartBottleConnected, setSmartBottleConnected] = useState(false);
  const [prescribedFor, setPrescribedFor] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    onAdd({
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      color: 'emerald',
      instruction: instruction.trim() || 'Take as directed',
      scheduleTimes: [scheduleTime],
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      inventoryRemaining: inventoryTotal,
      inventoryTotal,
      refillThreshold: 7,
      smartBottleConnected,
      smartBottleBattery: smartBottleConnected ? 95 : undefined,
      prescribedFor: prescribedFor.trim() || 'General Health',
      active: true,
    });

    // Reset and close
    setName('');
    setDosage('');
    setInstruction('');
    setPrescribedFor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Pill className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Add Prescription</h3>
              <p className="text-xs font-semibold text-slate-600">Enter dosage &amp; schedule times</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-800 font-bold mb-1 text-sm">
              Medication Name <span className="text-emerald-700">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin, Lisinopril"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-3 text-base text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Dosage <span className="text-emerald-700">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500 mg, 10 ml"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Form
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicineForm)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="liquid">Liquid</option>
                <option value="injection">Injection</option>
                <option value="inhaler">Inhaler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Scheduled Time
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Total Supply Units
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={inventoryTotal}
                onChange={(e) => setInventoryTotal(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1 text-sm">
              Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Take with breakfast and full glass of water"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1 text-sm">
              Prescribed For (Condition)
            </label>
            <input
              type="text"
              placeholder="e.g. High Blood Pressure, Joint Pain"
              value={prescribedFor}
              onChange={(e) => setPrescribedFor(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
            <div>
              <span className="font-extrabold text-slate-900 block text-sm">Smart Bottle Cap Sensor</span>
              <span className="text-xs font-semibold text-slate-600">Enable automatic bottle opening detection</span>
            </div>
            <input
              type="checkbox"
              checked={smartBottleConnected}
              onChange={(e) => setSmartBottleConnected(e.target.checked)}
              className="w-6 h-6 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Save Medicine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
