import React, { useState, useEffect } from 'react';
import { HandCoins, X, Loader2, Ban } from 'lucide-react';
import { money } from '../utils/formatters';
import { moneyAccounts, accountIcon, accountLabel, getAccount } from '../utils/registry';
import Swal from 'sweetalert2';

export default function DebtPaymentModal({ isOpen, debt, wallets, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('none');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount('');
    setSaving(false);
    let last = moneyAccounts()[0]?.id || 'none';
    try {
      const saved = localStorage.getItem('lastDebtAccount');
      if (saved === 'none' || (saved && getAccount(saved))) last = saved;
    } catch {
      /* sin almacenamiento local */
    }
    setAccount(last);
  }, [isOpen, debt]);

  if (!isOpen || !debt) return null;

  const owe = debt.direction === 'owe';
  const remaining = Math.max(0, debt.total - (debt.paid || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un monto mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (num > remaining + 0.001) {
      Swal.fire({ icon: 'warning', text: `Solo faltan ${money(remaining)}.`, confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      await onSave(debt, num, account !== 'none' ? account : null);
      try {
        localStorage.setItem('lastDebtAccount', account);
      } catch {
        /* sin almacenamiento local */
      }
      onClose();
      Swal.fire({
        icon: 'success',
        title: num >= remaining - 0.001 ? '¡Deuda liquidada!' : 'Abono registrado',
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

  const sources = [
    ...moneyAccounts().map((a) => ({ id: a.id, label: a.name, icon: accountIcon(a.id) })),
    { id: 'none', label: 'No mover', icon: Ban },
  ];

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
            <HandCoins className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="truncate">{owe ? `Pagarle a ${debt.name}` : `${debt.name} te pagó`}</span>
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Faltan <span className="font-bold text-slate-800 dark:text-slate-100">{money(remaining)}</span> de {money(debt.total)}
        </p>

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
              autoFocus
              className="input !pl-9 !py-3.5 !text-2xl font-mono font-bold"
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(Math.round(remaining * 100) / 100))}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Liquidar todo ({money(remaining)})
          </button>

          <div>
            <label className="block section-title mb-1.5">{owe ? 'Pagado desde' : 'Recibido en'}</label>
            <div className="flex flex-wrap gap-2">
              {sources.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAccount(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    account === id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {id !== 'none' && <span className="font-mono text-[10px] text-slate-400">{money(wallets[id])}</span>}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {account === 'none'
                ? 'Solo cambia lo abonado a la deuda; tus saldos no se tocan.'
                : owe
                ? `Se restará de ${accountLabel(account)}.`
                : `Se sumará a ${accountLabel(account)}.`}
            </p>
          </div>
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {owe ? 'Registrar pago' : 'Registrar cobro'}
          </button>
        </div>
      </form>
    </div>
  );
}
