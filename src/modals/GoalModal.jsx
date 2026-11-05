import React, { useState, useEffect } from 'react';
import { PiggyBank, X, Loader2 } from 'lucide-react';
import { todayISO } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function GoalModal({ isOpen, goal, onClose, onSave }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(goal?.name || '');
      setTarget(goal?.target ? String(goal.target) : '');
      setDeadline(goal?.deadline || '');
      setSaving(false);
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const num = parseFloat(target);

    if (!cleanName) return;
    if (!num || num <= 0) {
      Swal.fire({ icon: 'warning', text: 'La meta debe ser mayor a cero.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (deadline && deadline <= todayISO()) {
      Swal.fire({ icon: 'warning', text: 'La fecha límite debe ser en el futuro.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      const data = { name: cleanName, target: num, deadline: deadline || null };
      await onSave(goal ? data : { ...data, saved: 0 }, goal);
      onClose();
      Swal.fire({
        icon: 'success',
        title: goal ? 'Meta actualizada' : 'Meta creada',
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
            <PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {goal ? 'Editar meta' : 'Nueva meta de ahorro'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block section-title mb-1">Nombre del objetivo</label>
            <input
              type="text"
              placeholder="Ej. Fondo de emergencia, Viaje..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="input"
            />
          </div>

          <div>
            <label className="block section-title mb-1">Monto meta ($)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 pointer-events-none text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="input !pl-8 font-mono font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block section-title mb-1">Fecha límite (opcional)</label>
            <input
              type="date"
              value={deadline}
              min={todayISO()}
              onChange={(e) => setDeadline(e.target.value)}
              className="input font-mono dark:[color-scheme:dark]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Con fecha, te decimos cuánto apartar cada mes y cada quincena para llegar.</p>
          </div>
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {goal ? 'Guardar cambios' : 'Crear meta'}
          </button>
        </div>
      </form>
    </div>
  );
}
