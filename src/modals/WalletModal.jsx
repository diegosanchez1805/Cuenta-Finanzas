import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Banknote, X, Loader2 } from 'lucide-react';
import { money } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function WalletModal({
  isOpen,
  initialType = 'card',
  wallets,
  onClose,
  onSave,
}) {
  const [walletType, setWalletType] = useState('card');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWalletType(initialType);
      const currentVal = initialType === 'card' ? wallets.card : wallets.cash;
      setAmount(currentVal !== undefined && currentVal !== 0 ? currentVal.toString() : '');
      setSaving(false);
    }
  }, [isOpen, initialType, wallets]);

  const handleTypeChange = (type) => {
    setWalletType(type);
    const currentVal = type === 'card' ? wallets.card : wallets.cash;
    setAmount(currentVal !== undefined && currentVal !== 0 ? currentVal.toString() : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num < 0) {
      Swal.fire({
        icon: 'warning',
        text: 'Ingresa un monto válido (0 o mayor).',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(walletType, num);
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Saldo actualizado',
        text: `Dinero en ${walletType === 'card' ? 'tarjeta' : 'efectivo'}: ${money(num)}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        text: 'No se pudo guardar el saldo. Intenta de nuevo.',
        confirmButtonColor: '#f43f5e',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 modal-animate-enter text-slate-900 dark:text-white transition-colors"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Ajustar dinero disponible</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector Tipo: Tarjeta / Efectivo */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => handleTypeChange('card')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              walletType === 'card'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjeta</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('cash')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              walletType === 'cash'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Efectivo</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Monto disponible ($)
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
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Ingresa la cantidad exacta que tienes en este momento.
          </p>
        </div>

        <div className="pt-5 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md dark:shadow-lg dark:shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Guardar saldo</span>
          </button>
        </div>
      </form>
    </div>
  );
}
