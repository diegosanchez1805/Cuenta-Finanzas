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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-black/40 border border-slate-800/90 mb-6">
      {/* Resplandor radial de alta gama (Mesh Glow) */}
      <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -left-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Lado Izquierdo: Saldo y Mes */}
        <div>
          {/* Selector de Mes */}
          <div className="inline-flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-full px-2 py-1 mb-4 shadow-inner">
            <button
              onClick={() => onChangeMonth(-1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-200 tracking-wide select-none min-w-[110px] text-center font-mono">
              {MESES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={() => onChangeMonth(1)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Balance del mes
          </div>
          <div
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight font-mono mt-1 transition-all ${
              balance >= 0 ? 'text-emerald-400 drop-shadow-[0_2px_12px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_2px_12px_rgba(251,113,133,0.3)]'
            }`}
          >
            {money(balance)}
          </div>
        </div>

        {/* Lado Derecho: Tarjetas resumen de Ingresos y Gastos */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-80">
          {/* Card Ingresos */}
          <div className="bg-slate-950/60 border border-emerald-500/25 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Ingresos</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 truncate">
              {money(totalIngreso)}
            </div>
          </div>

          {/* Card Gastos */}
          <div className="bg-slate-950/60 border border-rose-500/25 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Gastos</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-400 truncate">
              {money(totalEgreso)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
