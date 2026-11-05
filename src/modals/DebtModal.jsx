import React, { useState, useEffect } from 'react';
import { HandCoins, X, Loader2, Ban } from 'lucide-react';
import { moneyAccounts, accountIcon } from '../utils/registry';
import Swal from 'sweetalert2';

export default function DebtModal({ isOpen, debt, onClose, onSave }) {
  const [direction, setDirection] = useState('owe');
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [account, setAccount] = useState('none');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    setDirection(debt?.direction || 'owe');
    setName(debt?.name || '');
    setTotal(debt?.total ? String(debt.total) : '');
    setDueDate(debt?.dueDate || '');
    setNote(debt?.note || '');
    setAccount('none');
  }, [isOpen, debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const num = parseFloat(total);
    if (!cleanName) {
      Swal.fire({ icon: 'warning', text: 'Escribe con quién es la deuda.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un monto mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (debt && num < (debt.paid || 0)) {
      Swal.fire({ icon: 'warning', text: 'El total no puede ser menor a lo que ya se abonó.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      await onSave(
        { direction, name: cleanName, total: num, dueDate: dueDate || null, note: note.trim() },
        debt,
        !debt && account !== 'none' ? account : null
      );
      onClose();
      Swal.fire({
        icon: 'success',
        title: debt ? 'Deuda actualizada' : 'Deuda registrada',
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

  if (!isOpen) return null;

  const owe = direction === 'owe';
  const sources = [
    ...moneyAccounts().map((a) => ({ id: a.id, label: a.name, icon: accountIcon(a.id) })),
    { id: 'none', label: 'No', icon: Ban },
  ];

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
            <HandCoins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {debt ? 'Editar deuda' : 'Nueva deuda o préstamo'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-800/80">
          {[
            { id: 'owe', label: 'Yo debo', active: 'bg-rose-500' },
            { id: 'owed', label: 'Me deben', active: 'bg-emerald-500' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDirection(t.id)}
              disabled={!!debt}
              className={`py-2 text-xs font-bold rounded-lg transition-all disabled:cursor-not-allowed ${
                direction === t.id ? `${t.active} text-white shadow-sm` : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block section-title mb-1">{owe ? '¿A quién le debes?' : '¿Quién te debe?'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={owe ? 'Ej. Mamá, Banco, Juan' : 'Ej. Carlos'}
              maxLength={40}
              autoFocus
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block section-title mb-1">Monto total</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 pointer-events-none text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="input !pl-8 font-mono font-semibold"
                />
              </div>
            </div>
            <div>
              <label className="block section-title mb-1">Fecha límite</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input font-mono dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block section-title mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Préstamo para el coche"
              maxLength={80}
              className="input"
            />
          </div>

          {!debt && (
            <div>
              <label className="block section-title mb-1.5">
                {owe ? '¿El dinero entró a alguna cuenta?' : '¿El dinero salió de alguna cuenta?'}
              </label>
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
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {account === 'none'
                  ? 'Solo se registra la deuda; tus saldos no cambian.'
                  : owe
                  ? 'El monto se sumará a esa cuenta.'
                  : 'El monto se restará de esa cuenta.'}
              </p>
            </div>
          )}
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {debt ? 'Guardar cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}
