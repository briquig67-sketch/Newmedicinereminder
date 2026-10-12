import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock, AlertTriangle, Pill } from 'lucide-react';
import { Medicine, MedicineForm } from '../types';

interface EditMedicineModalProps {
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Medicine>) => void;
  onDelete: (id: string) => void;
}

export const EditMedicineModal: React.FC<EditMedicineModalProps> = ({
  isOpen,
  medicine,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [instruction, setInstruction] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [inventoryRemaining, setInventoryRemaining] = useState(30);
  const [inventoryTotal, setInventoryTotal] = useState(30);
  const [prescribedFor, setPrescribedFor] = useState('');
  const [doctor, setDoctor] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setDosage(medicine.dosage);
      setForm(medicine.form);
      setInstruction(medicine.instruction || '');
      setScheduleTime(medicine.scheduleTimes?.[0] || '08:00');
      setInventoryRemaining(medicine.inventoryRemaining ?? 30);
      setInventoryTotal(medicine.inventoryTotal ?? 30);
      setPrescribedFor(medicine.prescribedFor || '');
      setDoctor(medicine.doctor || '');
      setShowDeleteConfirm(false);
    }
  }, [medicine]);

  if (!isOpen || !medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    onSave(medicine.id, {
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      instruction: instruction.trim() || 'Take as directed',
      scheduleTimes: [scheduleTime],
      inventoryRemaining: Number(inventoryRemaining),
      inventoryTotal: Math.max(Number(inventoryTotal), Number(inventoryRemaining)),
      prescribedFor: prescribedFor.trim() || undefined,
      doctor: doctor.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    onDelete(medicine.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border-2 border-slate-300 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-2 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <Pill className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Edit Prescription</h3>
              <p className="text-xs font-semibold text-slate-600">Modify dosage, time, or remove</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Alert Banner (if user clicked Delete) */}
        {showDeleteConfirm ? (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-800 shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-950">
                  Delete {medicine.name}?
                </h4>
                <p className="text-xs font-medium text-rose-900 mt-1 leading-snug">
                  Are you sure you want to remove this medication? All scheduled reminders and logs for this prescription will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer"
              >
                Keep Medication
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Prescription</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Medicine Name */}
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Medication Name <span className="text-emerald-700">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin, Lisinopril"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-3 text-base text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Dosage & Form */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Dosage <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500 mg, 10 ml"
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

            {/* Scheduled Time & Supply Units */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Scheduled Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1 text-sm">
                  Pills Remaining
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={inventoryRemaining}
                  onChange={(e) => setInventoryRemaining(Number(e.target.value))}
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Instructions / Notes
              </label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="e.g. Take with breakfast and a glass of water"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Prescribed For */}
            <div>
              <label className="block text-slate-800 font-bold mb-1 text-sm">
                Prescribed For (Condition)
              </label>
              <input
                type="text"
                value={prescribedFor}
                onChange={(e) => setPrescribedFor(e.target.value)}
                placeholder="e.g. Blood Pressure, Diabetes, Pain relief"
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            {/* Action Buttons: Delete Prescription vs Save Changes */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="min-h-[46px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs flex items-center gap-1.5 border border-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[46px] px-4 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
