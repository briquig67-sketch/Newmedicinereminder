import React, { useState, useMemo } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Download, 
  Search, 
  Check, 
  Radio, 
  Calendar 
} from 'lucide-react';
import { DoseLog } from '../types';

export const HistoryView: React.FC = () => {
  const { doseLogs, analytics, medicines, currentUser } = useMedSync();
  const [statusFilter, setStatusFilter] = useState<'all' | 'taken' | 'skipped' | 'smart_bottle'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const filteredLogs = useMemo(() => {
    return doseLogs
      .filter(log => {
        const matchesSearch = log.medicineName.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (statusFilter === 'taken') return log.status === 'taken';
        if (statusFilter === 'skipped') return log.status === 'skipped';
        if (statusFilter === 'smart_bottle') return log.source === 'smart_bottle';
        return true;
      })
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.scheduledTime.localeCompare(a.scheduledTime);
      });
  }, [doseLogs, statusFilter, searchQuery]);

  const formattedSummary = useMemo(() => {
    const total = doseLogs.length;
    const taken = doseLogs.filter(d => d.status === 'taken').length;
    const skipped = doseLogs.filter(d => d.status === 'skipped').length;

    return `MEDSYNC PATIENT ADHERENCE SUMMARY REPORT
Patient: ${currentUser.name || 'Patient'}
Report Generated: ${new Date().toLocaleDateString()}
Overall Adherence Rate: ${analytics.overallAdherenceRate}%
Active Streak: ${analytics.currentStreakDays} days
On-Time Compliance: ${analytics.onTimePercentage}%
Total Doses Logged: ${total} (Taken: ${taken}, Skipped: ${skipped})

PRESCRIPTION ADHERENCE BREAKDOWN:
${medicines.length > 0 ? medicines.map(m => {
  const logs = doseLogs.filter(l => l.medicineId === m.id);
  const t = logs.filter(l => l.status === 'taken').length;
  const pct = logs.length > 0 ? Math.round((t / logs.length) * 100) : 100;
  return `• ${m.name} (${m.dosage}): ${pct}% compliance (${t}/${logs.length} doses taken) - Current stock: ${m.inventoryRemaining} pills`;
}).join('\n') : '• No active prescriptions recorded yet.'}

TELEMETRY VERIFICATION:
Smart Bottle IoT sensor caps active on ${medicines.filter(m => m.smartBottleConnected).length} containers.
End of report.`;
  }, [doseLogs, analytics, medicines, currentUser]);

  const handleCopyReport = () => {
    navigator.clipboard.writeText(formattedSummary);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Dose History</span>
            <History className="w-5 h-5 text-emerald-700" />
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Verified intake history &amp; sensor event logs
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="min-h-[44px] px-3.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-emerald-800 border-2 border-slate-300 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Doctor Report</span>
        </button>
      </div>

      {/* Search Input (Bright White) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter history by prescription..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 transition-colors shadow-sm font-medium"
        />
      </div>

      {/* Status Filter Segment */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold shadow-sm">
        <button
          onClick={() => setStatusFilter('all')}
          className={`py-2 rounded-lg transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('taken')}
          className={`py-2 rounded-lg transition-all ${
            statusFilter === 'taken'
              ? 'bg-emerald-700 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Taken
        </button>
        <button
          onClick={() => setStatusFilter('skipped')}
          className={`py-2 rounded-lg transition-all ${
            statusFilter === 'skipped'
              ? 'bg-rose-700 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Skipped
        </button>
        <button
          onClick={() => setStatusFilter('smart_bottle')}
          className={`py-2 rounded-lg transition-all ${
            statusFilter === 'smart_bottle'
              ? 'bg-blue-700 text-white font-black shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Smart Cap
        </button>
      </div>

      {/* Timeline List of Logs (Crisp White Rows) */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
            <History className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">No logs found</h3>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        ) : (
          filteredLogs.slice(0, 40).map((log) => {
            const isTaken = log.status === 'taken';
            const isSkipped = log.status === 'skipped';
            const isPending = log.status === 'pending';

            return (
              <div
                key={log.id}
                className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-800'
                        : isSkipped
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isTaken ? (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    ) : isSkipped ? (
                      <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {log.medicineName}
                      </h4>
                      <span className="font-mono text-xs font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-800">
                        {log.dosage}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-xs mt-1 font-medium">
                      <span className="font-mono font-bold text-slate-800">Time: {log.scheduledTime}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="truncate">
                        {log.source === 'smart_bottle' ? 'IoT Bottle Cap Sync' : 'Manual Patient Confirm'}
                      </span>
                    </div>

                    {log.note && (
                      <div className="text-xs text-slate-600 italic mt-0.5 font-medium">
                        {log.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-700 block tabular-nums">
                    {log.date}
                  </span>
                  {isTaken && log.varianceMinutes !== undefined && (
                    <span
                      className={`text-xs font-mono font-extrabold block mt-0.5 ${
                        Math.abs(log.varianceMinutes) <= 15
                          ? 'text-emerald-700'
                          : log.varianceMinutes > 30
                          ? 'text-amber-800'
                          : 'text-slate-600'
                      }`}
                    >
                      {log.varianceMinutes === 0
                        ? 'Exact on-time'
                        : log.varianceMinutes > 0
                        ? `+${log.varianceMinutes}m late`
                        : `${Math.abs(log.varianceMinutes)}m early`}
                    </span>
                  )}
                  {isSkipped && (
                    <span className="text-xs font-bold text-rose-700 block mt-0.5">
                      Skipped
                    </span>
                  )}
                  {isPending && (
                    <span className="text-xs font-bold text-amber-700 block mt-0.5">
                      Scheduled
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export Clinical Report Modal (Bright White Design) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">Physician Care Team Report</h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-3 p-3.5 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {formattedSummary}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-semibold text-slate-600">Print or share with your doctor</span>
              <button
                onClick={handleCopyReport}
                className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
