import React, { useState, useEffect } from 'react';
import { Wallet, X, Loader2, Trash2 } from 'lucide-react';
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '../utils/registry';
import Swal from 'sweetalert2';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AccountModal({ isOpen, account, balance, canDelete, onClose, onSave, onDelete, isDark }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('debit');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [amount, setAmount] = useState('');
  const [limit, setLimit] = useState('');
  const [cutDay, setCutDay] = useState('');
  const [payDay, setPayDay] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    if (account) {
      setName(account.name);
      setType(account.type);
      setColor(account.color || ACCOUNT_COLORS[0]);
      // En crédito se captura la deuda como número positivo
      const value = account.type === 'credit' ? -(balance || 0) : balance || 0;
      setAmount(value ? String(value) : '');
      setLimit(account.limit ? String(account.limit) : '');
      setCutDay(account.cutDay ? String(account.cutDay) : '');
      setPayDay(account.payDay ? String(account.payDay) : '');
    } else {
      setName('');
      setType('debit');
      setColor(ACCOUNT_COLORS[2]);
      setAmount('');
      setLimit('');
      setCutDay('');
      setPayDay('');
    }
  }, [isOpen, account, balance]);

  const isCredit = type === 'credit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      Swal.fire({ icon: 'warning', text: 'Ponle un nombre a la cuenta.', confirmButtonColor: '#6366f1' });
      return;
    }
    const num = amount === '' ? 0 : parseFloat(amount);
    if (isNaN(num) || num < 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un monto válido (0 o mayor).', confirmButtonColor: '#6366f1' });
      return;
    }

    const data = { name: cleanName, type, color };
    if (isCredit) {
      data.limit = parseFloat(limit) || 0;
      data.cutDay = Number(cutDay) || null;
      data.payDay = Number(payDay) || null;
    }

    setSaving(true);
    try {
      await onSave(data, isCredit ? -num : num);
      onClose();
      Swal.fire({
        icon: 'success',
        title: account ? 'Cuenta actualizada' : 'Cuenta creada',
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

  const handleDelete = () => {
    Swal.fire({
      title: `¿Borrar "${account.name}"?`,
      text: 'Sus movimientos se conservan, pero ya no podrás usar esta cuenta.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        onDelete(account);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

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
            <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {account ? 'Editar cuenta' : 'Nueva cuenta'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block section-title mb-1.5">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ACCOUNT_TYPES).map(([id, { label, icon: Icon }]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setType(id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    type === id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block section-title mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCredit ? 'Ej. Nu crédito' : type === 'cash' ? 'Ej. Cartera' : 'Ej. BBVA nómina'}
              maxLength={30}
              className="input"
            />
          </div>

          <div>
            <label className="block section-title mb-1">{isCredit ? 'Deuda actual ($)' : 'Saldo actual ($)'}</label>
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
                className="input !pl-8 font-mono font-semibold"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isCredit
                ? 'Lo que debes hoy en esta tarjeta. Tus gastos con ella aumentan la deuda.'
                : 'Lo que tienes hoy en esta cuenta.'}
            </p>
          </div>

          {isCredit && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="col-span-2 sm:col-span-1">
                <label className="block section-title mb-1">Límite</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="block section-title mb-1">Día de corte</label>
                <select value={cutDay} onChange={(e) => setCutDay(e.target.value)} className="input">
                  <option value="">—</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="bg-white dark:bg-slate-900">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block section-title mb-1">Día de pago</label>
                <select value={payDay} onChange={(e) => setPayDay(e.target.value)} className="input">
                  <option value="">—</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="bg-white dark:bg-slate-900">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block section-title mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110' : ''}`}
                  style={{ backgroundColor: c, '--tw-ring-color': c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-5 mt-1 flex gap-2">
          {account && canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Borrar
            </button>
          )}
          <button type="submit" disabled={saving} className="btn-primary flex-1 !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {account ? 'Guardar cambios' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}
