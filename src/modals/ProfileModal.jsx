import React, { useState, useEffect } from 'react';
import { UserRound, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProfileModal({ isOpen, currentName, onClose, onSave }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName || '');
      setSaving(false);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      Swal.fire({ icon: 'warning', text: 'Escribe tu nombre.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      await onSave(cleanName);
      onClose();
      Swal.fire({
        icon: 'success',
        title: `¡Listo, ${cleanName}!`,
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

  if (!isOpen) return null;

  const initial = (name.trim() || '?').charAt(0).toUpperCase();

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
            <UserRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Tu perfil
          </h2>
          <button type="button" onClick={onClose} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {initial}
          </div>
        </div>

        <div>
          <label className="block section-title mb-1">¿Cómo quieres que te llamemos?</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            maxLength={40}
            autoComplete="given-name"
            autoFocus
            className="input"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">Se muestra en el saludo y en el encabezado en lugar de tu correo.</p>
        </div>

        <div className="pt-5 mt-1">
          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar nombre
          </button>
        </div>
      </form>
    </div>
  );
}
