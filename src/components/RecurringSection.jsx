import React, { useState } from 'react';
import { Repeat, Pause, Play, Trash2, ChevronDown } from 'lucide-react';
import { CATEGORY_PALETTE, METHOD_LABEL, money } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';
import { FREQUENCY_SHORT, shortDate } from '../utils/recurring';
import Swal from 'sweetalert2';

export default function RecurringSection({ rules, onEdit, onToggle, onDelete, isDark }) {
  const [open, setOpen] = useState(true);

  if (rules.length === 0) return null;

  const sorted = rules
    .slice()
    .sort((a, b) => (a.active === b.active ? (a.nextDate || '').localeCompare(b.nextDate || '') : a.active ? -1 : 1));

  // Total mensual aproximado de los gastos recurrentes activos
  const perMonth = { weekly: 52 / 12, biweekly: 2, monthly: 1, yearly: 1 / 12 };
  const monthlyOut = rules
    .filter((r) => r.active && r.type === 'egreso')
    .reduce((s, r) => s + r.amount * (perMonth[r.frequency] || 0), 0);

  const handleDelete = (rule) => {
    Swal.fire({
      title: '¿Borrar recurrente?',
      text: 'Ya no se registrará. Los movimientos que ya se crearon se quedan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) onDelete(rule);
    });
  };

  return (
    <section className="card p-2 sm:p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
          <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Recurrentes
          <span className="text-xs font-normal text-slate-400">({rules.length})</span>
        </span>
        <span className="flex items-center gap-2">
          {monthlyOut > 0 && (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              ≈ {money(monthlyOut)}/mes en gastos fijos
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="mt-1">
          {sorted.map((r) => {
            const Icon = getCategoryIcon(r.category);
            const meta = CATEGORY_PALETTE[r.category] || CATEGORY_PALETTE['Otro'];
            const isIngreso = r.type === 'ingreso';
            return (
              <div
                key={r.id}
                className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                  r.active ? '' : 'opacity-50'
                }`}
              >
                <button type="button" onClick={() => onEdit(r)} className="flex items-center gap-3 min-w-0 flex-1 text-left" title="Editar recurrente">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.bg}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
                      {r.description || r.category}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {FREQUENCY_SHORT[r.frequency]} · {METHOD_LABEL[r.method] || ''} ·{' '}
                      {r.active ? `Próximo: ${shortDate(r.nextDate)}` : 'En pausa'}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`font-mono font-bold text-sm mr-1 ${
                      isIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {isIngreso ? '+' : '−'}
                    {money(r.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggle(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    title={r.active ? 'Pausar' : 'Reanudar'}
                    aria-label={r.active ? 'Pausar' : 'Reanudar'}
                  >
                    {r.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Borrar recurrente"
                    aria-label="Borrar recurrente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
