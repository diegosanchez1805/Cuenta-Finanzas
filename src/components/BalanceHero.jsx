import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { MESES, money, pctChange } from '../utils/formatters';

function DeltaBadge({ value, invert = false }) {
  if (value === null) return null;
  // Para gastos, subir es malo (invert)
  const good = invert ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
        good ? 'bg-emerald-400/20 text-emerald-100' : 'bg-rose-400/25 text-rose-100'
      }`}
      title="Comparado con el mes anterior"
    >
      <Icon className="w-3 h-3" />
      {value > 0 ? '+' : ''}
      {value}%
    </span>
  );
}

export default function BalanceHero({
  viewMonth,
  totalIngreso,
  totalEgreso,
  prevIngreso,
  prevEgreso,
}) {
  const balance = totalIngreso - totalEgreso;
  const hasTransactions = totalIngreso > 0 || totalEgreso > 0;
  const savingsRate =
    totalIngreso > 0 ? Math.round(((totalIngreso - totalEgreso) / totalIngreso) * 100) : 0;
  const spentPct = totalIngreso > 0 ? Math.min(100, Math.round((totalEgreso / totalIngreso) * 100)) : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 shadow-glow-brand">
      {/* Decoración */}
      <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-28 w-64 h-64 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />
      <svg className="absolute right-0 bottom-0 w-64 opacity-[0.12] pointer-events-none" viewBox="0 0 200 80" fill="none" aria-hidden="true">
        <path d="M0 70 L30 55 L60 60 L90 35 L120 42 L150 18 L200 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-[0.1em] text-indigo-100/80">
          Balance de {MESES[viewMonth].toLowerCase()}
        </div>
        <div className="text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums mt-1.5">
          {balance < 0 ? '−' : ''}{money(Math.abs(balance))}
        </div>

        {hasTransactions ? (
          <p className="text-sm text-indigo-100/90 mt-1.5">
            {totalIngreso === 0
              ? 'Solo hay gastos registrados este mes.'
              : savingsRate >= 0
              ? `Estás ahorrando el ${savingsRate}% de lo que ganas.`
              : `Gastaste ${Math.abs(savingsRate)}% más de lo que ganaste.`}
          </p>
        ) : (
          <p className="text-sm text-indigo-100/90 mt-1.5">Aún no hay movimientos este mes.</p>
        )}

        {/* Barra: proporción gastada de los ingresos */}
        {totalIngreso > 0 && (
          <div className="mt-5">
            <div className="flex justify-between text-[11px] font-semibold text-indigo-100/80 mb-1.5">
              <span>Gastado de tus ingresos</span>
              <span className="font-mono">{spentPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  spentPct >= 100 ? 'bg-rose-300' : spentPct >= 80 ? 'bg-amber-300' : 'bg-emerald-300'
                }`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-100">
                <span className="w-5 h-5 rounded-md bg-emerald-400/25 flex items-center justify-center">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-200" />
                </span>
                Ingresos
              </span>
              <DeltaBadge value={pctChange(totalIngreso, prevIngreso)} />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums truncate">{money(totalIngreso)}</div>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-100">
                <span className="w-5 h-5 rounded-md bg-rose-400/25 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-200" />
                </span>
                Gastos
              </span>
              <DeltaBadge value={pctChange(totalEgreso, prevEgreso)} invert />
            </div>
            <div className="text-lg sm:text-xl font-bold tabular-nums truncate">{money(totalEgreso)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
