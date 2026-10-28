import React from 'react';
import { CalendarClock, Crown, Gauge, Scale } from 'lucide-react';
import { CATEGORY_PALETTE, daysInMonth, money, pctChange } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';

function Stat({ icon: Icon, iconClass, label, value, hint }) {
  return (
    <div className="card p-4 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{label}</span>
      </div>
      <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white truncate">{value}</div>
      {hint && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{hint}</div>}
    </div>
  );
}

export default function InsightsSection({ monthTx, viewYear, viewMonth, prevEgreso }) {
  const gastos = monthTx.filter((t) => t.type === 'egreso');
  const totalEgreso = gastos.reduce((s, t) => s + (t.amount || 0), 0);

  // Días transcurridos del mes visto (mes actual: hasta hoy; pasado: completo)
  const now = new Date();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const isCurrent = viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const isFuture = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());
  const elapsed = isCurrent ? now.getDate() : isFuture ? 0 : totalDays;

  const dailyAvg = elapsed > 0 ? totalEgreso / elapsed : 0;
  const projection = dailyAvg * totalDays;

  const catMap = {};
  gastos.forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + (t.amount || 0);
  });
  const [topCat, topAmount] = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0] || [null, 0];
  const topPct = totalEgreso > 0 ? Math.round((topAmount / totalEgreso) * 100) : 0;
  const TopIcon = getCategoryIcon(topCat);
  const topMeta = CATEGORY_PALETTE[topCat] || CATEGORY_PALETTE['Otro'];

  const change = pctChange(totalEgreso, prevEgreso);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        icon={Gauge}
        iconClass="bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
        label="Gasto diario promedio"
        value={money(dailyAvg)}
        hint={elapsed > 0 ? `En ${elapsed} día${elapsed === 1 ? '' : 's'}` : 'Mes sin iniciar'}
      />
      <Stat
        icon={CalendarClock}
        iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
        label={isCurrent ? 'Proyección del mes' : 'Total del mes'}
        value={money(isCurrent ? projection : totalEgreso)}
        hint={isCurrent ? 'Si sigues a este ritmo' : 'Gastos registrados'}
      />
      <Stat
        icon={topCat ? TopIcon : Crown}
        iconClass={topCat ? `border ${topMeta.bg}` : 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'}
        label="Mayor gasto"
        value={topCat || '—'}
        hint={topCat ? `${money(topAmount)} · ${topPct}% del total` : 'Sin gastos aún'}
      />
      <Stat
        icon={Scale}
        iconClass={
          change === null
            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            : change <= 0
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
        }
        label="vs. mes anterior"
        value={change === null ? '—' : `${change > 0 ? '+' : ''}${change}%`}
        hint={change === null ? 'Sin datos para comparar' : change <= 0 ? 'Gastaste menos' : 'Gastaste más'}
      />
    </div>
  );
}
