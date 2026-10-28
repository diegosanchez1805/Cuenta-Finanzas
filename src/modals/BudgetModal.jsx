import React, { useState, useEffect } from 'react';
import { Gauge, X, Loader2, Trash2 } from 'lucide-react';
import { CATS_EGRESO, money } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function BudgetModal({ isOpen, initialCategory, budgets, onClose, onSave }) {
  const [category, setCategory] = useState(CATS_EGRESO[0]);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cat = initialCategory || CATS_EGRESO[0];
      setCategory(cat);
      setAmount(budgets[cat] ? String(budgets[cat]) : '');
      setSaving(false);
    }
  }, [isOpen, initialCategory, budgets]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setAmount(budgets[cat] ? String(budgets[cat]) : '');
  };

  const save = async (value) => {
    setSaving(true);
    try {
      await onSave(category, value);
      onClose();
      Swal.fire({
        icon: 'success',
        title: value > 0 ? `Presupuesto de ${category}: ${money(value)}` : 'Presupuesto eliminado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', text: 'No se pudo guardar. Intenta de nuevo.', confirmButtonColor: '#f43f5e' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un límite mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }
    save(num);
  };

  if (!isOpen) return null;

  const exists = budgets[category] > 0;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 modal-animate-enter text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Presupuesto mensual
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block section-title mb-1">Categoría</label>
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="input font-medium">
              {CATS_EGRESO.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-slate-900">
                  {c}
                  {budgets[c] > 0 ? ` (${money(budgets[c])})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block section-title mb-1">Límite al mes ($)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 pointer-events-none text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="input !pl-8 font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 mt-2 flex gap-2">
          {exists && (
            <button
              type="button"
              disabled={saving}
              onClick={() => save(0)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
              title="Quitar presupuesto"
            >
              <Trash2 className="w-4 h-4" />
              Quitar
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex-1 !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar presupuesto
          </button>
        </div>
      </form>
    </div>
  );
}
