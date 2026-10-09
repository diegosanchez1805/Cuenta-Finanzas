import React, { useState, useEffect } from 'react';
import { PiggyBank, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function GoalModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTarget('');
      setSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const num = parseFloat(target);

    if (!cleanName) return;
    if (!num || num <= 0) {
      Swal.fire({
        icon: 'warning',
        text: 'La meta debe ser mayor a cero.',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: cleanName,
        target: num,
        saved: 0,
      });
      onClose();
      Swal.fire({
        icon: 'success',
        title: 'Meta creada',
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

  if (!isOpen) return null;

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
            <PiggyBank className="w-5 h-5 text-indigo-400" />
            <span>Nueva meta de ahorro</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Nombre del objetivo
            </label>
            <input
              type="text"
              placeholder="Ej. Fondo de emergencia, Viaje..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Monto meta ($)
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
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-5 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Crear meta</span>
          </button>
        </div>
      </form>
    </div>
  );
}
