import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DepositModal({ isOpen, goal, onClose, onSave }) {
  const [depositType, setDepositType] = useState('abonar');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDepositType('abonar');
      setAmount('');
      setSaving(false);
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Swal.fire({
        icon: 'warning',
        text: 'Anota un monto mayor a cero.',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    if (!goal) return;

    const newSaved =
      depositType === 'abonar' ? (goal.saved || 0) + amt : (goal.saved || 0) - amt;

    if (newSaved < 0) {
      Swal.fire({
        icon: 'error',
        text: 'No puedes retirar más dinero del que tienes acumulado.',
        confirmButtonColor: '#f43f5e',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(goal.id, newSaved);
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Ahorro actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        text: 'No se pudo guardar. Intenta de nuevo.',
        confirmButtonColor: '#f43f5e',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200/80 dark:border-slate-800 modal-animate-enter text-slate-900 dark:text-white transition-colors"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
            Mover dinero — {goal.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setDepositType('abonar')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              depositType === 'abonar'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Abonar
          </button>
          <button
            type="button"
            onClick={() => setDepositType('retirar')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              depositType === 'retirar'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Retirar
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Monto a mover ($)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 dark:text-slate-500 pointer-events-none text-sm">
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
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-600"
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
            <span>Guardar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
