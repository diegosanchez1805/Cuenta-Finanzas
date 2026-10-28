import React from 'react';
import { Gauge, Plus, Pencil, AlertTriangle } from 'lucide-react';
import { CATS_EGRESO, CATEGORY_PALETTE, money } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';

export function budgetStatus(spent, limit) {
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  if (pct >= 100) return { pct, bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' };
  if (pct >= 80) return { pct, bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { pct, bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
}

export function spentByCategory(monthTx) {
  const map = {};
  monthTx
    .filter((t) => t.type === 'egreso')
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + (t.amount || 0);
    });
  return map;
}

// Aviso compacto para la vista de Resumen
export function BudgetAlerts({ budgets, monthTx, onOpen }) {
  const spent = spentByCategory(monthTx);
  const alerts = Object.entries(budgets)
    .filter(([, limit]) => limit > 0)
    .map(([cat, limit]) => ({ cat, limit, spent: spent[cat] || 0, ...budgetStatus(spent[cat] || 0, limit) }))
    .filter((b) => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  if (alerts.length === 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left card p-4 border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/5 hover:border-amber-300 transition-colors"
    >
      <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">
        <AlertTriangle className="w-4 h-4" />
        {alerts.length === 1 ? '1 presupuesto requiere atención' : `${alerts.length} presupuestos requieren atención`}
      </div>
      <div className="flex flex-wrap gap-2">
        {alerts.map((a) => (
          <span key={a.cat} className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-slate-700">
            {a.cat} <span className={`font-mono ${a.text}`}>{a.pct}%</span>
          </span>
        ))}
      </div>
    </button>
  );
}

export default function BudgetsSection({ budgets, monthTx, onEditBudget }) {
  const spent = spentByCategory(monthTx);
  const withBudget = CATS_EGRESO.filter((c) => budgets[c] > 0);
  const withoutBudget = CATS_EGRESO.filter((c) => !(budgets[c] > 0));

  const totalLimit = withBudget.reduce((s, c) => s + budgets[c], 0);
  const totalSpent = withBudget.reduce((s, c) => s + (spent[c] || 0), 0);
  const total = budgetStatus(totalSpent, totalLimit);
  const remaining = totalLimit - totalSpent;

  return (
    <div className="space-y-5">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Presupuestos mensuales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define cuánto quieres gastar por categoría y recibe avisos al acercarte al límite.
          </p>
        </div>
        <button onClick={() => onEditBudget(withoutBudget[0] || CATS_EGRESO[0])} type="button" className="btn-primary !text-xs">
          <Plus className="w-4 h-4" />
          Nuevo presupuesto
        </button>
      </div>

      {withBudget.length > 0 && (
        <div className="card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <div className="section-title">Total presupuestado</div>
              <div className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-0.5">
                {money(totalSpent)}{' '}
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">de {money(totalLimit)}</span>
              </div>
            </div>
            <span className={`text-sm font-bold ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {remaining >= 0 ? `Te quedan ${money(remaining)}` : `Te pasaste por ${money(-remaining)}`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${total.bar} transition-all duration-700`} style={{ width: `${Math.min(100, total.pct)}%` }} />
          </div>
        </div>
      )}

      {withBudget.length === 0 ? (
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Gauge className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-1">Sin presupuestos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Elige una categoría abajo y ponle un límite mensual.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {withBudget.map((cat) => {
            const limit = budgets[cat];
            const s = spent[cat] || 0;
            const st = budgetStatus(s, limit);
            const Icon = getCategoryIcon(cat);
            const meta = CATEGORY_PALETTE[cat] || CATEGORY_PALETTE['Otro'];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onEditBudget(cat)}
                className="group card p-4 text-left hover:border-indigo-200 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{cat}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${st.text}`}>{st.pct}%</span>
                    <Pencil className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${Math.min(100, st.pct)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
                  <span className="font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{money(s)}</span> de {money(limit)}
                  </span>
                  <span>{s <= limit ? `Quedan ${money(limit - s)}` : `Excedido ${money(s - limit)}`}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {withoutBudget.length > 0 && (
        <div>
          <div className="section-title mb-2 px-1">Categorías sin presupuesto</div>
          <div className="flex flex-wrap gap-2">
            {withoutBudget.map((cat) => {
              const Icon = getCategoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onEditBudget(cat)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat}
                  {spent[cat] > 0 && <span className="font-mono text-slate-400">· {money(spent[cat])}</span>}
                  <Plus className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
