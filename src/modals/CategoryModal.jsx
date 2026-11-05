import React, { useState, useEffect } from 'react';
import { Tag, X, Loader2, Trash2 } from 'lucide-react';
import { CUSTOM_ICONS, CATEGORY_COLORS, getCategories } from '../utils/registry';
import Swal from 'sweetalert2';

export default function CategoryModal({ isOpen, category, initialType = 'egreso', onClose, onSave, onDelete, isDark }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('egreso');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSaving(false);
    setName(category?.name || '');
    setType(category?.type || initialType);
    setIcon(category?.icon || 'Tag');
    setColor(category?.color || CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
  }, [isOpen, category, initialType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      Swal.fire({ icon: 'warning', text: 'Escribe un nombre para la categoría.', confirmButtonColor: '#6366f1' });
      return;
    }
    // No se permiten nombres repetidos (de la app o tuyos), salvo el de la misma categoría
    const taken = [...getCategories('egreso'), ...getCategories('ingreso'), 'Transferencia'].some(
      (c) => c.toLowerCase() === cleanName.toLowerCase() && c !== category?.name
    );
    if (taken) {
      Swal.fire({ icon: 'warning', text: 'Ya existe una categoría con ese nombre.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSaving(true);
    try {
      await onSave({ name: cleanName, type, icon, color }, category);
      onClose(cleanName);
    } catch (err) {
      Swal.fire({ icon: 'error', text: 'No se pudo guardar. Intenta de nuevo.', confirmButtonColor: '#f43f5e' });
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: `¿Borrar "${category.name}"?`,
      text: 'Los movimientos que ya tienen esta categoría la conservan, pero ya no podrás elegirla.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (r.isConfirmed) {
        onDelete(category);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  const Preview = CUSTOM_ICONS[icon] || Tag;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[60] bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 modal-animate-enter text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {category ? 'Editar categoría' : 'Nueva categoría'}
          </h2>
          <button type="button" onClick={() => onClose()} className="icon-btn !w-8 !h-8 !rounded-full" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}24`, color, borderColor: `${color}55` }}
            >
              <Preview className="w-6 h-6" />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mascotas"
              maxLength={20}
              autoFocus
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
            {[
              { id: 'egreso', label: 'Para gastos', active: 'bg-rose-500' },
              { id: 'ingreso', label: 'Para ingresos', active: 'bg-emerald-500' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                disabled={!!category}
                className={`py-2 text-xs font-bold rounded-lg transition-all disabled:cursor-not-allowed ${
                  type === t.id ? `${t.active} text-white shadow-sm` : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block section-title mb-1.5">Ícono</label>
            <div className="grid grid-cols-7 gap-1.5">
              {Object.entries(CUSTOM_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={`aspect-square rounded-xl flex items-center justify-center border transition-all ${
                    icon === key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                  }`}
                  aria-label={key}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block section-title mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
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

          {category && (
            <p className="text-[11px] text-slate-400">
              Si cambias el nombre, también se actualiza en tus movimientos, recurrentes y presupuestos.
            </p>
          )}
        </div>

        <div className="pt-5 mt-1 flex gap-2">
          {category && (
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
            {category ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}
