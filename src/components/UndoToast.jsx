import React, { useEffect, useRef, useState } from 'react';
import { Undo2, X } from 'lucide-react';

const DURATION = 6000;

// Aviso inferior con botón "Deshacer" que desaparece solo a los pocos segundos
export default function UndoToast({ toast, onUndo, onClose }) {
  const [leaving, setLeaving] = useState(false);
  // El temporizador depende solo del aviso; así no se reinicia cuando la app se vuelve a pintar
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!toast) return;
    setLeaving(false);
    const t = setTimeout(() => closeRef.current(), DURATION);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed inset-x-0 bottom-36 lg:bottom-24 z-[70] flex justify-center px-4 pointer-events-none">
      <div
        key={toast.id}
        role="status"
        className={`relative pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-white/10 max-w-md w-full sm:w-auto ${
          leaving ? 'opacity-0' : 'tab-title-in'
        } transition-opacity`}
      >
        <span className="text-sm font-semibold truncate flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={() => {
            setLeaving(true);
            onUndo();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-indigo-300 hover:bg-white/10 transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          Deshacer
        </button>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10" aria-label="Cerrar aviso">
          <X className="w-4 h-4" />
        </button>
        {/* Barra de tiempo restante */}
        <span
          aria-hidden="true"
          className="absolute left-4 right-4 bottom-1 h-0.5 rounded-full bg-indigo-400/60 origin-left"
          style={{ animation: `undoTimer ${DURATION}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
