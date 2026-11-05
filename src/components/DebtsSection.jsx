import React, { useState } from 'react';
import { HandCoins, Plus, Pencil, Trash2, CalendarClock, CheckCircle, ChevronDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { money, todayISO } from '../utils/formatters';
import { shortDate } from '../utils/recurring';

function daysUntil(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = todayISO().split('-').map(Number);
  return Math.round((new Date(y, m - 1, d) - new Date(ty, tm - 1, td)) / 86400000);
}

function DebtCard({ d, onPay, onEdit, onDelete }) {
  const owe = d.direction === 'owe';
  const paid = d.paid || 0;
  const remaining = Math.max(0, d.total - paid);
  const pct = d.total > 0 ? Math.min(100, Math.round((paid / d.total) * 100)) : 0;
  const settled = remaining <= 0.001;
  const left = settled ? null : daysUntil(d.dueDate);

  return (
    <div className={`card p-4 ${settled ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              settled
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : owe
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
            }`}
          >
            {settled ? <CheckCircle className="w-5 h-5" /> : owe ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
          </span>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{d.name}</div>
            {d.note && <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{d.note}</div>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(d)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            title="Editar"
            aria-label="Editar deuda"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(d)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            title="Borrar"
            aria-label="Borrar deuda"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs mt-3 mb-1.5">
        <span className="font-mono text-slate-500 dark:text-slate-400">
          <span className="font-bold text-sm text-slate-900 dark:text-white">{money(paid)}</span> de {money(d.total)}
        </span>
        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${settled ? 'bg-emerald-500' : owe ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!settled && (
        <div className="flex items-center justify-between gap-2 mt-3">
          <span
            className={`flex items-center gap-1 text-[11px] font-semibold ${
              left !== null && left < 0
                ? 'text-rose-600 dark:text-rose-400'
                : left !== null && left <= 7
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {d.dueDate && <CalendarClock className="w-3.5 h-3.5" />}
            {d.dueDate
              ? left < 0
                ? `Venció el ${shortDate(d.dueDate)}`
                : left === 0
                ? 'Vence hoy'
                : `Vence ${shortDate(d.dueDate)} · en ${left} día${left === 1 ? '' : 's'}`
              : `Faltan ${money(remaining)}`}
          </span>
          <button
            type="button"
            onClick={() => onPay(d)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            {owe ? 'Abonar' : 'Me pagó'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DebtsSection({ debts, onNew, onPay, onEdit, onDelete }) {
  const [showSettled, setShowSettled] = useState(false);

  const isSettled = (d) => d.total - (d.paid || 0) <= 0.001;
  const active = debts.filter((d) => !isSettled(d));
  const settled = debts.filter(isSettled);
  const byDue = (a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
  const iOwe = active.filter((d) => d.direction === 'owe').sort(byDue);
  const owedToMe = active.filter((d) => d.direction === 'owed').sort(byDue);
  const totalOwe = iOwe.reduce((s, d) => s + (d.total - (d.paid || 0)), 0);
  const totalOwed = owedToMe.reduce((s, d) => s + (d.total - (d.paid || 0)), 0);

  const list = (items, title, empty) => (
    <div className="space-y-3">
      <h3 className="section-title px-1">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 px-1">{empty}</p>
      ) : (
        items.map((d) => <DebtCard key={d.id} d={d} onPay={onPay} onEdit={onEdit} onDelete={onDelete} />)
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Deudas y préstamos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lleva la cuenta de lo que debes y de lo que te deben.</p>
        </div>
        <button onClick={onNew} type="button" className="btn-primary !text-xs">
          <Plus className="w-4 h-4" />
          Nueva deuda
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Debes</div>
          <div className="text-xl font-extrabold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5 truncate">{money(totalOwe)}</div>
          <div className="text-[11px] text-slate-400">{iOwe.length} pendiente{iOwe.length === 1 ? '' : 's'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Te deben</div>
          <div className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{money(totalOwed)}</div>
          <div className="text-[11px] text-slate-400">{owedToMe.length} pendiente{owedToMe.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      {debts.length === 0 ? (
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <HandCoins className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-1">Sin deudas registradas</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Registra un préstamo que pediste o que hiciste para no perderle la pista.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list(iOwe, 'Lo que debes', 'No debes nada. ¡Bien!')}
          {list(owedToMe, 'Lo que te deben', 'Nadie te debe dinero.')}
        </div>
      )}

      {settled.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSettled(!showSettled)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 px-1"
            aria-expanded={showSettled}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showSettled ? 'rotate-180' : ''}`} />
            Liquidadas ({settled.length})
          </button>
          {showSettled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {settled.map((d) => (
                <DebtCard key={d.id} d={d} onPay={onPay} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
