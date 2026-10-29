import React, { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Banknote, Ban, PiggyBank } from 'lucide-react';
import { money } from '../utils/formatters';
import Swal from 'sweetalert2';

const SOURCES = [
  { id: 'card', label: 'Tarjeta', icon: CreditCard },
  { id: 'cash', label: 'Efectivo', icon: Banknote },
  { id: 'none', label: 'No mover', icon: Ban },
];

export default function DepositModal({ isOpen, goal, wallets, onClose, onSave }) {
  const [depositType, setDepositType] = useState('abonar');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('card');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDepositType('abonar');
      setAmount('');
      let last = 'card';
      try {
        last = localStorage.getItem('lastGoalSource') || 'card';
      } catch {
        /* sin almacenamiento local */
      }
      setSource(last);
      setSaving(false);
    }
  }, [isOpen, goal]);

  const isDeposit = depositType === 'abonar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Swal.fire({ icon: 'warning', text: 'Anota un monto mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }

    if (!goal) return;

    const newSaved = isDeposit ? (goal.saved || 0) + amt : (goal.saved || 0) - amt;

    if (newSaved < 0) {
      Swal.fire({ icon: 'error', text: 'No puedes retirar más dinero del que tienes acumulado.', confirmButtonColor: '#f43f5e' });
      return;
    }

    // Avisar si el abono deja el saldo en negativo
    if (isDeposit && source !== 'none' && amt > (wallets[source] || 0)) {
      const res = await Swal.fire({
        icon: 'warning',
        title: 'Saldo insuficiente',
        text: `En ${source === 'card' ? 'tarjeta' : 'efectivo'} tienes ${money(wallets[source] || 0)}. Tu saldo quedaría en negativo.`,
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Abonar de todos modos',
        cancelButtonText: 'Cancelar',
      });
      if (!res.isConfirmed) return;
    }

    setSaving(true);
    try {
      // Abonar saca dinero del saldo; retirar lo regresa
      const walletDelta = source === 'none' ? null : { [source]: isDeposit ? -amt : amt };
      await onSave(goal.id, newSaved, walletDelta);
      try {
        localStorage.setItem('lastGoalSource', source);
      } catch {
        /* sin almacenamiento local */
      }
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
      Swal.fire({ icon: 'error', text: 'No se pudo guardar. Intenta de nuevo.', confirmButtonColor: '#f43f5e' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !goal) return null;

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
          <h2 className="font-bold text-lg flex items-center gap-2 min-w-0">
            <PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="truncate">{goal.name}</span>
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Llevas <span className="font-bold text-slate-800 dark:text-slate-100">{money(goal.saved)}</span> de {money(goal.target)}
        </p>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setDepositType('abonar')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isDeposit ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Abonar
          </button>
          <button
            type="button"
            onClick={() => setDepositType('retirar')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isDeposit ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Retirar
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center font-bold text-slate-400 pointer-events-none text-xl">$</span>
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
              className="input !pl-9 !py-3.5 !text-2xl font-mono font-bold"
            />
          </div>

          <div>
            <label className="block section-title mb-1.5">{isDeposit ? 'Tomar el dinero de' : 'Regresar el dinero a'}</label>
            <div className="grid grid-cols-3 gap-2">
              {SOURCES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSource(id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    source === id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {id !== 'none' && (
                    <span className="font-mono text-[10px] font-semibold text-slate-400">{money(wallets[id])}</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {source === 'none'
                ? 'Solo cambia el progreso de la meta; tus saldos no se tocan.'
                : isDeposit
                ? `Se restará de tu saldo en ${source === 'card' ? 'tarjeta' : 'efectivo'}.`
                : `Se sumará a tu saldo en ${source === 'card' ? 'tarjeta' : 'efectivo'}.`}
            </p>
          </div>
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeposit ? 'Abonar a la meta' : 'Retirar de la meta'}
          </button>
        </div>
      </form>
    </div>
  );
}
