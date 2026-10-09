import React from 'react';
import { CreditCard, Banknote, SlidersHorizontal, Pencil } from 'lucide-react';
import { money } from '../utils/formatters';

export default function WalletsSection({ wallets, onOpenWalletModal }) {
  const totalDisponible = (wallets.card || 0) + (wallets.cash || 0);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mi dinero disponible
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-slate-300 shadow-sm">
            Total: {money(totalDisponible)}
          </span>
        </div>
        <button
          onClick={() => onOpenWalletModal('card')}
          type="button"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 focus:outline-none"
          title="Ajustar dinero en tarjeta o efectivo"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Ajustar saldos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Tarjeta: En Tarjeta */}
        <div className="bg-slate-900/70 border border-indigo-500/25 hover:border-indigo-500/50 rounded-2xl p-4 shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex items-center justify-between group backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                En Tarjeta
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5 truncate">
                {money(wallets.card)}
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenWalletModal('card')}
            type="button"
            className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none"
            title="Ajustar saldo en tarjeta"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>

        {/* Tarjeta: En Efectivo */}
        <div className="bg-slate-900/70 border border-emerald-500/25 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 flex items-center justify-between group backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Banknote className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                En Efectivo
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5 truncate">
                {money(wallets.cash)}
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenWalletModal('cash')}
            type="button"
            className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none"
            title="Ajustar dinero en efectivo"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    </section>
  );
}
