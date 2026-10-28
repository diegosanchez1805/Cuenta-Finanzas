import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, X, Loader2, CreditCard, Banknote } from 'lucide-react';
import { CATS_INGRESO, CATS_EGRESO, CATEGORY_PALETTE, todayISO } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';
import Swal from 'sweetalert2';

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editing, // movimiento a editar, o null para uno nuevo
  defaultYear,
  defaultMonth,
}) {
  const [type, setType] = useState('egreso');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATS_EGRESO[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState('card');
  const [affectsWallet, setAffectsWallet] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);

    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount ?? ''));
      setCategory(editing.category);
      setDescription(editing.description || '');
      setDate(editing.date || todayISO());
      setMethod(editing.method || 'card');
      setAffectsWallet(!!editing.affectsWallet);
      return;
    }

    setType('egreso');
    setAmount('');
    setCategory(CATS_EGRESO[0]);
    setDescription('');
    setMethod(localStorage.getItem('lastMethod') || 'card');
    setAffectsWallet(true);

    const now = new Date();
    const isCurrentMonth = defaultYear === now.getFullYear() && defaultMonth === now.getMonth();
    if (isCurrentMonth || defaultYear === undefined || defaultMonth === undefined) {
      setDate(todayISO());
    } else {
      const mStr = String(defaultMonth + 1).padStart(2, '0');
      setDate(`${defaultYear}-${mStr}-01`);
    }
  }, [isOpen, editing, defaultYear, defaultMonth]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const cats = newType === 'ingreso' ? CATS_INGRESO : CATS_EGRESO;
    if (!cats.includes(category)) setCategory(cats[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un monto mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        type,
        amount: num,
        category,
        description: description.trim(),
        date,
        method,
        affectsWallet,
      });
      try {
        localStorage.setItem('lastMethod', method);
      } catch {
        /* sin almacenamiento local */
      }
      onClose();
      Swal.fire({
        icon: 'success',
        title: editing ? 'Movimiento actualizado' : 'Movimiento guardado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar. Intenta de nuevo.', confirmButtonColor: '#f43f5e' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentCats = type === 'ingreso' ? CATS_INGRESO : CATS_EGRESO;
  const isIngreso = type === 'ingreso';

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 modal-animate-enter text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            {editing ? (
              <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{editing ? 'Editar movimiento' : 'Nuevo movimiento'}</span>
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Tipo: Gasto / Ingreso */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleTypeChange('egreso')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isIngreso ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ingreso')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isIngreso ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ingreso
          </button>
        </div>

        <div className="space-y-4">
          {/* Monto grande */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 dark:text-slate-500 pointer-events-none text-xl">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              className={`input !pl-9 !py-3.5 !text-2xl font-mono font-bold ${isIngreso ? '!text-emerald-600 dark:!text-emerald-400' : ''}`}
            />
          </div>

          {/* Categorías como fichas */}
          <div>
            <label className="block section-title mb-2">Categoría</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {currentCats.map((c) => {
                const Icon = getCategoryIcon(c);
                const meta = CATEGORY_PALETTE[c] || CATEGORY_PALETTE['Otro'];
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-semibold transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${meta.bg}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="truncate max-w-full">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block section-title mb-1">Descripción</label>
              <input
                type="text"
                placeholder="Ej. Supermercado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block section-title mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input font-mono dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Método de pago y ajuste de saldo */}
          <div>
            <label className="block section-title mb-1.5">{isIngreso ? 'Recibido en' : 'Pagado con'}</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'card', label: 'Tarjeta', icon: CreditCard },
                { id: 'cash', label: 'Efectivo', icon: Banknote },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    method === id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={affectsWallet}
                onChange={(e) => setAffectsWallet(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {isIngreso ? 'Sumar' : 'Restar'} automáticamente de mi saldo en {method === 'cash' ? 'efectivo' : 'tarjeta'}
              </span>
            </label>
          </div>
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{editing ? 'Guardar cambios' : 'Guardar movimiento'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
