import React from 'react';
import { CreditCard, Banknote, Pencil, Wallet } from 'lucide-react';
import { money } from '../utils/formatters';

export default function WalletsSection({ wallets, onOpenWalletModal }) {
  const card = wallets.card || 0;
  const cash = wallets.cash || 0;
  const totalDisponible = card + cash;
  const cardPct = totalDisponible > 0 ? (card / totalDisponible) * 100 : 50;

  const rows = [
    { type: 'card', label: 'Tarjeta', value: card, icon: CreditCard, tone: 'indigo' },
    { type: 'cash', label: 'Efectivo', value: cash, icon: Banknote, tone: 'emerald' },
  ];

  return (
    <section className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="section-title flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Dinero disponible
        </span>
      </div>
      <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
        {money(totalDisponible)}
      </div>

      {/* Distribución tarjeta / efectivo */}
      <div className="flex h-1.5 rounded-full overflow-hidden mt-3 mb-4 bg-slate-100 dark:bg-slate-800">
        {totalDisponible > 0 && (
          <>
            <div className="bg-indigo-500 transition-all duration-500" style={{ width: `${cardPct}%` }} />
            <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${100 - cardPct}%` }} />
          </>
        )}
      </div>

      <div className="space-y-2 mt-auto">
        {rows.map(({ type, label, value, icon: Icon, tone }) => (
          <button
            key={type}
            type="button"
            onClick={() => onOpenWalletModal(type)}
            className="group w-full flex items-center justify-between gap-3 p-2.5 -mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
            title={`Ajustar saldo en ${label.toLowerCase()}`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tone === 'indigo'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{money(value)}</span>
              <Pencil className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
