import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, X, Loader2, ArrowDown, Repeat, Plus } from 'lucide-react';
import { todayISO } from '../utils/formatters';
import { FREQUENCIES } from '../utils/recurring';
import { getAccounts, getAccount, accountIcon, getCategories, getCategoryMeta } from '../utils/registry';
import Swal from 'sweetalert2';

const TYPES = [
  { id: 'egreso', label: 'Gasto', active: 'bg-rose-500' },
  { id: 'ingreso', label: 'Ingreso', active: 'bg-emerald-500' },
  { id: 'transferencia', label: 'Transferencia', active: 'bg-indigo-600' },
];

// Fila de cuentas para elegir una
function AccountPicker({ value, onChange, exclude }) {
  return (
    <div className="flex flex-wrap gap-2">
      {getAccounts()
        .filter((a) => a.id !== exclude)
        .map((a) => {
          const Icon = accountIcon(a.id);
          const active = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                active
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" style={{ color: active ? undefined : a.color }} />
              {a.name}
            </button>
          );
        })}
    </div>
  );
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave, // (entry, frequency) => Promise
  editing, // movimiento a editar, o null
  editingRule, // regla recurrente a editar, o null
  initialType = 'egreso', // tipo con el que abre un movimiento nuevo
  initialTo = null, // destino predefinido de una transferencia (pagar tarjeta)
  onNewCategory, // (type, onCreated) abre la ventana de nueva categoría
  defaultYear,
  defaultMonth,
}) {
  const [type, setType] = useState('egreso');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Comida');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState('card');
  const [from, setFrom] = useState('card');
  const [to, setTo] = useState('cash');
  const [affectsWallet, setAffectsWallet] = useState(true);
  const [frequency, setFrequency] = useState('none');
  const [saving, setSaving] = useState(false);

  // Primera cuenta distinta de `id`, para que origen y destino nunca coincidan
  const otherThan = (id) => getAccounts().find((a) => a.id !== id)?.id || id;

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    const accounts = getAccounts();
    const firstId = accounts[0]?.id || 'card';

    const source = editing || editingRule;
    if (source) {
      setType(source.type);
      setAmount(String(source.amount ?? ''));
      setCategory(source.category || 'Otro');
      setDescription(source.description || '');
      setDate((editingRule ? source.nextDate : source.date) || todayISO());
      setMethod(source.method || firstId);
      setFrom(source.from || firstId);
      setTo(source.to || otherThan(source.from || firstId));
      setAffectsWallet(source.type === 'transferencia' ? true : !!source.affectsWallet);
      setFrequency(editingRule ? source.frequency : 'none');
      return;
    }

    setType(initialType);
    setAmount('');
    setCategory(getCategories(initialType === 'ingreso' ? 'ingreso' : 'egreso')[0]);
    setDescription(initialTo && getAccount(initialTo) ? `Pago de ${getAccount(initialTo).name}` : '');
    let lastMethod = firstId;
    try {
      const saved = localStorage.getItem('lastMethod');
      if (saved && getAccount(saved)) lastMethod = saved;
    } catch {
      /* sin almacenamiento local */
    }
    setMethod(lastMethod);
    if (initialTo) {
      // Pagar una tarjeta: el dinero sale de la primera cuenta que no sea de crédito
      const payer = accounts.find((a) => a.type !== 'credit' && a.id !== initialTo)?.id || otherThan(initialTo);
      setFrom(payer);
      setTo(initialTo);
    } else {
      setFrom(firstId);
      setTo(otherThan(firstId));
    }
    setAffectsWallet(true);
    setFrequency('none');

    const now = new Date();
    const isCurrentMonth = defaultYear === now.getFullYear() && defaultMonth === now.getMonth();
    if (isCurrentMonth || defaultYear === undefined || defaultMonth === undefined) {
      setDate(todayISO());
    } else {
      const mStr = String(defaultMonth + 1).padStart(2, '0');
      setDate(`${defaultYear}-${mStr}-01`);
    }
  }, [isOpen, editing, editingRule, initialType, initialTo, defaultYear, defaultMonth]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'transferencia') {
      setFrequency('none');
      return;
    }
    const cats = getCategories(newType);
    if (!cats.includes(category)) setCategory(cats[0]);
  };

  const handleFromChange = (id) => {
    setFrom(id);
    if (id === to) setTo(otherThan(id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'Ingresa un monto mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }

    const isTransfer = type === 'transferencia';
    if (isTransfer && from === to) {
      Swal.fire({ icon: 'warning', text: 'Elige dos cuentas distintas.', confirmButtonColor: '#6366f1' });
      return;
    }

    const entry = isTransfer
      ? {
          type,
          amount: num,
          category: 'Transferencia',
          description: description.trim(),
          date,
          from,
          to,
          affectsWallet: true,
        }
      : {
          type,
          amount: num,
          category,
          description: description.trim(),
          date,
          method,
          affectsWallet,
        };

    setSaving(true);
    try {
      await onSave(entry, frequency);
      if (!isTransfer) {
        try {
          localStorage.setItem('lastMethod', method);
        } catch {
          /* sin almacenamiento local */
        }
      }
      onClose();
      Swal.fire({
        icon: 'success',
        title: editingRule
          ? 'Recurrente actualizado'
          : frequency !== 'none'
          ? 'Movimiento recurrente creado'
          : editing
          ? 'Movimiento actualizado'
          : isTransfer
          ? 'Transferencia guardada'
          : 'Movimiento guardado',
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

  const isIngreso = type === 'ingreso';
  const isTransfer = type === 'transferencia';
  const currentCats = getCategories(isIngreso ? 'ingreso' : 'egreso');
  const methodAcc = getAccount(method);
  // Las transferencias no se repiten; un movimiento ya existente tampoco se convierte en recurrente
  const canRepeat = !isTransfer && !editing;
  const title = editingRule ? 'Editar recurrente' : editing ? 'Editar movimiento' : 'Nuevo movimiento';

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
            {editingRule ? (
              <Repeat className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : editing ? (
              <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{title}</span>
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de tipo (una regla recurrente no puede volverse transferencia) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-4 border border-slate-200/60 dark:border-slate-800/80">
          {TYPES.filter((t) => !(editingRule && t.id === 'transferencia')).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === t.id ? `${t.active} text-white shadow-sm` : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
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

          {isTransfer ? (
            /* Origen y destino de la transferencia */
            <div className="space-y-2">
              <div>
                <label className="block section-title mb-1.5">De</label>
                <AccountPicker value={from} onChange={handleFromChange} />
              </div>
              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <label className="block section-title mb-1.5">A</label>
                <AccountPicker value={to} onChange={setTo} exclude={from} />
              </div>
              <p className="text-[11px] text-slate-400">
                No cuenta como gasto ni ingreso; solo mueve dinero entre tus cuentas. Para pagar una tarjeta de crédito, mándalo a esa tarjeta.
              </p>
            </div>
          ) : (
            /* Categorías como fichas */
            <div>
              <label className="block section-title mb-2">Categoría</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {currentCats.map((c) => {
                  const meta = getCategoryMeta(c);
                  const Icon = meta.Icon;
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
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${meta.bg}`} style={meta.style}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="truncate max-w-full">{c}</span>
                    </button>
                  );
                })}
                {onNewCategory && (
                  <button
                    type="button"
                    onClick={() => onNewCategory(isIngreso ? 'ingreso' : 'egreso', (name) => setCategory(name))}
                    className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </span>
                    Nueva
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block section-title mb-1">Descripción</label>
              <input
                type="text"
                placeholder={isTransfer ? 'Ej. Retiro en cajero' : 'Ej. Supermercado'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block section-title mb-1">{frequency !== 'none' ? 'Primera fecha' : 'Fecha'}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input font-mono dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {canRepeat && (
            <div>
              <label className="block section-title mb-1">Repetir</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input font-medium">
                {FREQUENCIES.filter((f) => !(editingRule && f.id === 'none')).map((f) => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900">
                    {f.label}
                  </option>
                ))}
              </select>
              {frequency !== 'none' && (
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Se registrará solo en cada fecha. Puedes pausarlo o borrarlo en Movimientos → Recurrentes.
                </p>
              )}
            </div>
          )}

          {/* Cuenta y ajuste de saldo */}
          {!isTransfer && (
            <div>
              <label className="block section-title mb-1.5">{isIngreso ? 'Recibido en' : 'Pagado con'}</label>
              <AccountPicker value={method} onChange={setMethod} />
              <label className="flex items-center gap-2.5 mt-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={affectsWallet}
                  onChange={(e) => setAffectsWallet(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {methodAcc?.type === 'credit'
                    ? `${isIngreso ? 'Restar de' : 'Sumar a'} la deuda de ${methodAcc.name}`
                    : `${isIngreso ? 'Sumar a' : 'Restar de'} mi saldo en ${methodAcc?.name || 'la cuenta'}`}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{editing || editingRule ? 'Guardar cambios' : isTransfer ? 'Guardar transferencia' : 'Guardar movimiento'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
