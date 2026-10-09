import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Loader2 } from 'lucide-react';
import { CATS_INGRESO, CATS_EGRESO, todayISO } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function TransactionModal({ isOpen, onClose, onSave }) {
  const [type, setType] = useState('egreso');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATS_EGRESO[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('egreso');
      setAmount('');
      setCategory(CATS_EGRESO[0]);
      setDescription('');
      setDate(todayISO());
      setSaving(false);
    }
  }, [isOpen]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const cats = newType === 'ingreso' ? CATS_INGRESO : CATS_EGRESO;
    setCategory(cats[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Swal.fire({
        icon: 'warning',
        text: 'Ingresa un monto mayor a cero.',
        confirmButtonColor: '#6366f1',
      });
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
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Movimiento guardado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar. Intenta de nuevo.',
        confirmButtonColor: '#f43f5e',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentCats = type === 'ingreso' ? CATS_INGRESO : CATS_EGRESO;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-800 modal-animate-enter text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <span>Nuevo movimiento</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Tipo: Gasto / Ingreso */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800/80">
          <button
            type="button"
            onClick={() => handleTypeChange('egreso')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'egreso'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('ingreso')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'ingreso'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ingreso
          </button>
        </div>

        {/* Campos */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Monto ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500 pointer-events-none text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all"
            >
              {currentCats.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Descripción (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Supermercado, Alquiler..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="pt-5 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Guardar movimiento</span>
          </button>
        </div>
      </form>
    </div>
  );
}
