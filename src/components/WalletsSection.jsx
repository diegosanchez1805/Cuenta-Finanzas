import React from 'react';
import { Pencil, Wallet, ArrowLeftRight, Plus, CalendarClock } from 'lucide-react';
import { money } from '../utils/formatters';
import { getAccounts, accountIcon, ACCOUNT_TYPES, nextDayOfMonth } from '../utils/registry';
import { shortDate } from '../utils/recurring';

export default function WalletsSection({ wallets, onEditAccount, onNewAccount, onTransfer, onPayCard }) {
  const accounts = getAccounts();
  const balanceOf = (id) => wallets[id] || 0;

  const moneyAccs = accounts.filter((a) => a.type !== 'credit');
  const creditAccs = accounts.filter((a) => a.type === 'credit');
  const totalDisponible = moneyAccs.reduce((s, a) => s + balanceOf(a.id), 0);
  // En crédito el saldo negativo es lo que debes
  const totalDeuda = creditAccs.reduce((s, a) => s + Math.max(0, -balanceOf(a.id)), 0);
  const positiveTotal = moneyAccs.reduce((s, a) => s + Math.max(0, balanceOf(a.id)), 0);

  return (
    <section className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="section-title flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Dinero disponible
        </span>
        <button
          type="button"
          onClick={onTransfer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          title="Pasar dinero entre tus cuentas"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Mover dinero
        </button>
      </div>
      <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
        {money(totalDisponible)}
      </div>
      {totalDeuda > 0 && (
        <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
          Debes {money(totalDeuda)} en tarjetas de crédito
        </div>
      )}

      {/* Distribución del dinero entre cuentas */}
      <div className="flex h-1.5 rounded-full overflow-hidden mt-3 mb-3 bg-slate-100 dark:bg-slate-800">
        {positiveTotal > 0 &&
          moneyAccs.map((a) => (
            <div
              key={a.id}
              className="transition-all duration-500"
              style={{ width: `${(Math.max(0, balanceOf(a.id)) / positiveTotal) * 100}%`, backgroundColor: a.color }}
            />
          ))}
      </div>

      <div className="space-y-1 mt-auto">
        {accounts.map((a) => {
          const Icon = accountIcon(a.id);
          const bal = balanceOf(a.id);
          const isCredit = a.type === 'credit';
          const debt = Math.max(0, -bal);
          const available = isCredit && a.limit ? a.limit + bal : null;
          const pay = isCredit ? nextDayOfMonth(a.payDay) : null;
          return (
            <div key={a.id} className="group flex items-center gap-2 -mx-1">
              <button
                type="button"
                onClick={() => onEditAccount(a.id)}
                className="flex-1 min-w-0 flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
                title={`Editar ${a.name}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{a.name}</span>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {isCredit
                        ? pay
                          ? `Pago ${shortDate(pay.iso)}${pay.daysLeft <= 5 ? ` · en ${pay.daysLeft} día${pay.daysLeft === 1 ? '' : 's'}` : ''}`
                          : 'Crédito'
                        : ACCOUNT_TYPES[a.type]?.label}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-right">
                    <span
                      className={`block font-mono font-bold text-sm ${
                        isCredit && debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? (debt > 0 ? `−${money(debt)}` : money(0)) : money(bal)}
                    </span>
                    {available !== null && (
                      <span className="block text-[10px] text-slate-400 font-mono">disp. {money(available)}</span>
                    )}
                  </span>
                  <Pencil className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                </span>
              </button>
              {isCredit && debt > 0 && (
                <button
                  type="button"
                  onClick={() => onPayCard(a.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                    pay && pay.daysLeft <= 5
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Pagar la tarjeta desde otra cuenta"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Pagar
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNewAccount}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar cuenta o tarjeta
      </button>
    </section>
  );
}
