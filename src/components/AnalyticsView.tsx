import React, { useState, useMemo } from 'react';
import { useMedSync } from '../context/MedSyncContext';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Zap, 
  Radio, 
  AlertTriangle, 
  Pill, 
  Pause, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    analytics,
    doseLogs,
    medicines,
    liveFeed,
    isLiveSimulationActive,
    setIsLiveSimulationActive,
    triggerSimulatedCapOpen,
    refillMedicine,
    seniorMode
  } = useMedSync();

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  // Compute timing variance breakdown
  const varianceBuckets = useMemo(() => {
    const takenDoses = doseLogs.filter(d => d.status === 'taken');
    const skippedDoses = doseLogs.filter(d => d.status === 'skipped');

    let onTime = 0; // -15m to +15m
    let slightDelay = 0; // +16m to +60m
    let lateDelay = 0; // > 60m
    let early = 0; // < -15m

    takenDoses.forEach(d => {
      const v = d.varianceMinutes ?? 0;
      if (v < -15) {
        early++;
      } else if (v <= 15) {
        onTime++;
      } else if (v <= 60) {
        slightDelay++;
      } else {
        lateDelay++;
      }
    });

    const total = takenDoses.length + skippedDoses.length;
    const safeTotal = total > 0 ? total : 1;

    return [
      {
        label: 'On-Time (±15m)',
        count: onTime,
        percent: Math.round((onTime / safeTotal) * 100),
        color: 'bg-emerald-600',
        textColor: 'text-emerald-800'
      },
      {
        label: 'Minor Delay (15-60m)',
        count: slightDelay,
        percent: Math.round((slightDelay / safeTotal) * 100),
        color: 'bg-blue-600',
        textColor: 'text-blue-800'
      },
      {
        label: 'Late (>1 hour)',
        count: lateDelay,
        percent: Math.round((lateDelay / safeTotal) * 100),
        color: 'bg-amber-500',
        textColor: 'text-amber-800'
      },
      {
        label: 'Skipped Doses',
        count: skippedDoses.length,
        percent: Math.round((skippedDoses.length / safeTotal) * 100),
        color: 'bg-rose-500',
        textColor: 'text-rose-800'
      }
    ];
  }, [doseLogs]);

  // Hourly intake distribution across the 24 hours of the day
  const hourlyDistribution = useMemo(() => {
    const distribution = Array(24).fill(0);
    doseLogs.filter(d => d.status === 'taken').forEach(d => {
      const hour = parseInt(d.scheduledTime.split(':')[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        distribution[hour]++;
      }
    });
    const max = Math.max(...distribution, 1);
    return { distribution, max };
  }, [doseLogs]);

  // 14-day history heatmap
  const past14Days = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const dayNum = d.getDate();

      const dayLogs = doseLogs.filter(l => l.date === iso);
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const total = dayLogs.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

      days.push({
        iso,
        dayLabel,
        dayNum,
        taken,
        total,
        rate
      });
    }
    return days;
  }, [doseLogs]);

  // Per-medicine adherence & inventory calculation
  const medicineAnalytics = useMemo(() => {
    return medicines.map(med => {
      const medLogs = doseLogs.filter(l => l.medicineId === med.id);
      const taken = medLogs.filter(l => l.status === 'taken').length;
      const total = medLogs.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

      const pillsPerDay = med.scheduleTimes.length;
      const daysRemaining = pillsPerDay > 0 ? Math.floor(med.inventoryRemaining / pillsPerDay) : 30;
      const isLowStock = med.inventoryRemaining <= med.refillThreshold;

      return {
        ...med,
        logsCount: total,
        takenCount: taken,
        adherenceRate: rate,
        daysRemaining,
        isLowStock
      };
    });
  }, [medicines, doseLogs]);

  return (
    <div className="pb-24 px-4 pt-3 space-y-4 max-w-md mx-auto">
      {/* Analytics Header (High Contrast) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Adherence Analytics</span>
            <Activity className="w-5 h-5 text-emerald-700" />
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            Continuous health telemetry &amp; schedule tracking
          </p>
        </div>

        {/* Live Simulation Stream Toggle */}
        <button
          onClick={() => setIsLiveSimulationActive(!isLiveSimulationActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-sm ${
            isLiveSimulationActive
              ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
              : 'bg-slate-200 text-slate-700 border border-slate-300'
          }`}
          title="Toggle live telemetry feed"
        >
          {isLiveSimulationActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>LIVE</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3" />
              <span>PAUSED</span>
            </>
          )}
        </button>
      </div>

      {/* Time Range Horizon Segmented Control (Large Buttons) */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-white border-2 border-slate-200 rounded-2xl text-xs font-bold shadow-sm">
        {(['24h', '7d', '30d', '90d'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`py-2 rounded-xl transition-all ${
              timeRange === range
                ? 'bg-emerald-700 text-white font-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {range === '24h' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
          </button>
        ))}
      </div>

      {/* Primary Adherence KPI Scoreboard (Bright Light Card) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-600 font-extrabold block">
              Overall Adherence Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl md:text-5xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
                {analytics.overallAdherenceRate}%
              </span>
              <span className="flex items-center text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +3.4%
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1.5">
              Goal: 80%+ adherence recommended by your physician
            </p>
          </div>

          <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800">
            <TrendingUp className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        {/* 3 Secondary Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-slate-200 text-center font-mono">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-tight block">On-Time</span>
            <span className="text-lg font-black text-slate-900 tabular-nums">
              {analytics.onTimePercentage}%
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-tight block">Delayed</span>
            <span className="text-lg font-black text-amber-900 tabular-nums">
              {analytics.latePercentage}%
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5">
            <span className="text-[10px] text-rose-800 font-bold uppercase tracking-tight block">Skipped</span>
            <span className="text-lg font-black text-rose-900 tabular-nums">
              {analytics.skippedPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Live Intake Activity Stream */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Live Intake Activity Stream
            </h3>
          </div>
          <button
            onClick={() => triggerSimulatedCapOpen()}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 active:scale-95 transition-transform bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-700" />
            <span>Simulate Sensor</span>
          </button>
        </div>

        {/* Live Event Stream Cards */}
        <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
          {liveFeed.slice(0, 5).map(event => (
            <div
              key={event.id}
              className="bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-xl p-2.5 flex items-start justify-between gap-2 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 truncate">
                    {event.medicineName}
                  </div>
                  <div className="text-xs font-medium text-slate-600 line-clamp-1">
                    {event.message}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-slate-600 block tabular-nums">
                  {event.timestamp}
                </span>
                {event.varianceText && (
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {event.varianceText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Punctuality Variance Analysis */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-700" />
            <span>Dose Timing Punctuality</span>
          </h3>
          <span className="text-xs font-bold text-slate-600 font-mono">
            {doseLogs.length} Doses Logged
          </span>
        </div>

        {/* Stacked Ratio Bar */}
        <div className="w-full h-3.5 bg-slate-200 rounded-full flex overflow-hidden">
          {varianceBuckets.map((bucket, i) => (
            <div
              key={i}
              className={`${bucket.color} transition-all duration-500`}
              style={{ width: `${bucket.percent}%` }}
              title={`${bucket.label}: ${bucket.percent}%`}
            />
          ))}
        </div>

        {/* Legend & Breakdown in High-Contrast Light Cards */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          {varianceBuckets.map((bucket, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${bucket.color}`} />
                <span className="text-xs font-bold text-slate-800">{bucket.label}</span>
              </div>
              <span className={`font-mono font-black ${bucket.textColor} tabular-nums text-sm`}>
                {bucket.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Dose Density (24-Hour Curve) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Intake Frequency by Hour (24h)
          </h3>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            Morning &amp; Evening Peaks
          </span>
        </div>

        {/* 24 vertical bars */}
        <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1 border-b-2 border-slate-200">
          {hourlyDistribution.distribution.map((count, hour) => {
            const heightPercent = Math.max(8, Math.round((count / hourlyDistribution.max) * 100));
            const isPeak = count === hourlyDistribution.max && count > 0;
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak
                      ? 'bg-emerald-600 shadow-sm'
                      : count > 0
                      ? 'bg-emerald-500/80 hover:bg-emerald-600'
                      : 'bg-slate-200'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                {/* Tooltip on tap/hover */}
                <div className="absolute -top-7 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                  {hour}:00 ({count})
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs font-mono font-bold text-slate-600">
          <span>12 AM</span>
          <span>8 AM</span>
          <span>12 PM</span>
          <span>8 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* 14-Day Adherence Calendar Heatmap */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>14-Day Daily Record</span>
          </h3>
          <span className="text-xs font-mono text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
            19-Day Streak
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {past14Days.map((day, idx) => {
            const isPerfect = day.rate === 100;
            const isGood = day.rate >= 75 && day.rate < 100;
            const isMedium = day.rate >= 50 && day.rate < 75;

            const bgClass = isPerfect
              ? 'bg-emerald-600 text-white font-black'
              : isGood
              ? 'bg-emerald-200 text-emerald-950 font-bold'
              : isMedium
              ? 'bg-amber-200 text-amber-950 font-bold'
              : 'bg-rose-200 text-rose-950 font-bold';

            return (
              <div
                key={idx}
                className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-200"
              >
                <span className="text-[10px] text-slate-600 uppercase font-black">
                  {day.dayLabel}
                </span>
                <div
                  className={`w-8 h-8 mt-1 rounded-lg flex items-center justify-center text-sm font-mono tabular-nums ${bgClass} shadow-sm`}
                  title={`${day.iso}: ${day.rate}% (${day.taken}/${day.total})`}
                >
                  {day.dayNum}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1">
          <span>Missed</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-300" />
            <span className="w-3 h-3 rounded bg-amber-300" />
            <span className="w-3 h-3 rounded bg-emerald-200" />
            <span className="w-3 h-3 rounded bg-emerald-600" />
          </div>
          <span>100% Taken</span>
        </div>
      </div>

      {/* Per-Medicine Adherence & Refill Runway */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-indigo-700" />
            <span>Prescription Compliance &amp; Stock</span>
          </h3>
        </div>

        <div className="space-y-3">
          {medicineAnalytics.length === 0 ? (
            <div className="text-center py-6 text-xs font-semibold text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-200">
              No prescriptions tracked yet. Add your medications to view per-prescription adherence and supply countdowns.
            </div>
          ) : (
            medicineAnalytics.map(med => (
            <div key={med.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{med.name}</span>
                    <span className="text-xs font-mono font-bold bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    {med.prescribedFor || 'Health Maintenance'}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-mono font-black text-emerald-800 tabular-nums">
                    {med.adherenceRate}%
                  </span>
                  <span className="text-xs font-semibold text-slate-600 block font-mono">
                    {med.takenCount}/{med.logsCount} Taken
                  </span>
                </div>
              </div>

              {/* Inventory Runway Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-semibold">Remaining Supply</span>
                  <span className={`font-mono font-bold tabular-nums ${med.isLowStock ? 'text-amber-800 font-black' : 'text-slate-900'}`}>
                    {med.inventoryRemaining} pills ({med.daysRemaining} days left)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      med.isLowStock ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((med.inventoryRemaining / med.inventoryTotal) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* Low stock alert & refill CTA if needed */}
              {med.isLowStock && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                    <span>Low Supply Alert</span>
                  </div>
                  <button
                    onClick={() => refillMedicine(med.id, 30)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold active:scale-95 transition-all shadow-sm"
                  >
                    +30 Refill
                  </button>
                </div>
              )}
            </div>
          )))
        }
        </div>
      </div>
    </div>
  );
};
