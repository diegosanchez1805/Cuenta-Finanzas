import React from 'react';
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { MESES, money } from '../utils/formatters';

export default function BalanceHero({
  viewYear,
  viewMonth,
  onChangeMonth,
  totalIngreso,
  totalEgreso,
}) {
  const balance = totalIngreso - totalEgreso;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/70 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/40 border border-slate-200/80 dark:border-slate-800/90 mb-6 transition-colors duration-200">
      {/* Resplandor radial de alta gama (Mesh Glow) */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Lado Izquierdo: Saldo y Mes */}
        <div>
          {/* Selector de Mes */}
          <div className="inline-flex items-center gap-1 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1 mb-4 shadow-sm dark:shadow-inner transition-colors">
            <button
              onClick={() => onChangeMonth(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-200 tracking-wide select-none min-w-[110px] text-center font-sans">
              {MESES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={() => onChangeMonth(1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Balance del mes
          </div>
          <div
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1 transition-all ${
              balance >= 0
                ? 'text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_2px_12px_rgba(52,211,153,0.3)]'
                : 'text-rose-600 dark:text-rose-400 dark:drop-shadow-[0_2px_12px_rgba(251,113,133,0.3)]'
            }`}
          >
            {money(balance)}
          </div>
        </div>

        {/* Lado Derecho: Tarjetas resumen de Ingresos y Gastos */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-80">
          {/* Card Ingresos */}
          <div className="bg-white/90 dark:bg-slate-950/60 border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ingresos</span>
            </div>
            <div className="text-base sm:text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
              {money(totalIngreso)}
            </div>
          </div>

          {/* Card Gastos */}
          <div className="bg-white/90 dark:bg-slate-950/60 border border-rose-200 dark:border-rose-500/25 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-sm dark:shadow-lg transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gastos</span>
            </div>
            <div className="text-base sm:text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400 truncate">
              {money(totalEgreso)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
