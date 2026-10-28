import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { MESES } from '../utils/formatters';

export default function MonthSwitcher({ viewYear, viewMonth, onChangeMonth, onToday }) {
  const now = new Date();
  const isCurrent = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-0.5 card !rounded-full px-1 py-1">
        <button
          onClick={() => onChangeMonth(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold px-2 text-slate-800 dark:text-slate-100 select-none min-w-[130px] text-center">
          {MESES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => onChangeMonth(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {!isCurrent && (
        <button
          onClick={onToday}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Hoy</span>
        </button>
      )}
    </div>
  );
}
