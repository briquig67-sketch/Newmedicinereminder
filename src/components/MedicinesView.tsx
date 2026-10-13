import React, { useState } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  Pill, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  RotateCw, 
  Radio, 
  Package,
  Pencil,
  CalendarDays
} from 'lucide-react';
import { Medicine } from '../types';
import { AddMedicineModal } from './AddMedicineModal';
import { EditMedicineModal } from './EditMedicineModal';
import { getRepeatLabel, getDoseQuantityLabel, formatTimeAmPm } from '../utils/scheduleUtils';

export const MedicinesView: React.FC = () => {
  const { medicines, deleteMedicine, updateMedicine, refillMedicine, addMedicine } = useMedSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'smart_bottle'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteConfirmMedicine, setDeleteConfirmMedicine] = useState<Medicine | null>(null);

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.prescribedFor && med.prescribedFor.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'low_stock') {
      return med.inventoryRemaining <= med.refillThreshold;
    }
    if (filterType === 'smart_bottle') {
      return med.smartBottleConnected;
    }
    return true;
  });

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Prescriptions</span>
            <Pill className="w-5 h-5 text-indigo-700" />
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Active medication schedules &amp; pharmacy supply
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search Bar (Clean Light Background) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search prescriptions or conditions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 transition-colors shadow-sm font-medium"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold shadow-sm">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-slate-900 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({medicines.length})
        </button>
        <button
          onClick={() => setFilterType('low_stock')}
          className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
            filterType === 'low_stock'
              ? 'bg-amber-600 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Low Stock ({medicines.filter(m => m.inventoryRemaining <= m.refillThreshold).length})
        </button>
        <button
          onClick={() => setFilterType('smart_bottle')}
          className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
            filterType === 'smart_bottle'
              ? 'bg-emerald-700 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Smart Caps ({medicines.filter(m => m.smartBottleConnected).length})
        </button>
      </div>

      {/* Medicine Cards List (Senior-Friendly Bright White Cards with Edit & Delete) */}
      <div className="space-y-3.5">
        {medicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-3">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Your Prescription List is Empty</h3>
            <p className="text-xs font-semibold text-slate-600 max-w-xs mx-auto">
              You haven't added any medications yet. Tap below to enter your prescriptions and daily dose schedules.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add First Prescription</span>
            </button>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No prescriptions found</h3>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Try adjusting your search terms or filter selection.
            </p>
          </div>
        ) : (
          filteredMedicines.map(med => {
            const isLow = med.inventoryRemaining <= med.refillThreshold;
            const qtyPerDose = med.doseQuantity || 1;
            const pillsPerDay = qtyPerDose * (med.scheduleTimes.length || 1);
            const daysLeft = pillsPerDay > 0 ? Math.floor(med.inventoryRemaining / pillsPerDay) : 30;

            return (
              <div
                key={med.id}
                className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-black text-slate-900 truncate">
                        {med.name}
                      </h3>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 shrink-0">
                        {med.dosage}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mt-1">
                      <span className="capitalize text-slate-800">{med.form}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-slate-700 truncate">{med.instruction}</span>
                    </div>

                    {med.prescribedFor && (
                      <div className="text-xs text-emerald-800 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                        For: {med.prescribedFor}
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditingMedicine(med)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-2 border-indigo-200 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                      title="Edit prescription name, dosage, schedule, or notes"
                    >
                      <Pencil className="w-3.5 h-3.5 text-indigo-700 stroke-[2.5]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmMedicine(med)}
                      className="min-h-[38px] p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition-colors cursor-pointer active:scale-95"
                      title="Delete prescription"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                {/* Key Prescription Details Badges: Qty, Repeats & Times */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Quantity to take */}
                  <div className="px-2.5 py-1.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-black rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Pill className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>Dose: {getDoseQuantityLabel(qtyPerDose, med.form)}</span>
                  </div>

                  {/* Repeats & Interval */}
                  <div className="px-2.5 py-1.5 bg-amber-50 border-2 border-amber-300 text-amber-950 font-black rounded-xl flex items-center gap-1.5 shadow-xs">
                    <CalendarDays className="w-3.5 h-3.5 text-amber-700 stroke-[2.5]" />
                    <span>Repeats: {getRepeatLabel(med)}</span>
                  </div>

                  {/* Times During Day */}
                  <div className="px-2.5 py-1.5 bg-blue-50 border-2 border-blue-300 text-blue-950 font-black rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-blue-700 stroke-[2.5]" />
                    <span>
                      {med.scheduleTimes.map(formatTimeAmPm).join(', ')} ({med.scheduleTimes.length}x daily)
                    </span>
                  </div>
                </div>

                {/* IoT Smart Cap Badge */}
                {med.smartBottleConnected && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <Radio className="w-4 h-4 text-emerald-700 animate-pulse" />
                      <span>Smart Bottle Cap Connected ({med.smartBottleCapId || 'CAP-01'})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      Battery {med.smartBottleBattery ?? 90}%
                    </span>
                  </div>
                )}

                {/* Inventory Runway & Refill Action */}
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-600 font-bold">Supply:</span>
                      <span className={`font-mono font-black tabular-nums text-sm ${isLow ? 'text-amber-800' : 'text-slate-900'}`}>
                        {med.inventoryRemaining} pills
                      </span>
                      <span className="text-slate-500 font-medium">({daysLeft} days remaining)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => refillMedicine(med.id, 30)}
                    className="min-h-[38px] px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border-2 border-slate-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>+30 Refill</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMedicine}
      />

      {/* Edit Medicine Modal */}
      <EditMedicineModal
        isOpen={Boolean(editingMedicine)}
        medicine={editingMedicine}
        onClose={() => setEditingMedicine(null)}
        onSave={updateMedicine}
        onDelete={deleteMedicine}
      />

      {/* Senior-Friendly Delete Confirmation Modal */}
      {deleteConfirmMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-800 shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delete {deleteConfirmMedicine.name}?
                </h3>
                <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                  This will remove this prescription and cancel all scheduled doses for it. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmMedicine(null)}
                className="min-h-[44px] px-4 rounded-xl text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMedicine(deleteConfirmMedicine.id);
                  setDeleteConfirmMedicine(null);
                }}
                className="min-h-[44px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-700/20 active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
