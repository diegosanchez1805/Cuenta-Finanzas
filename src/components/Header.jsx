import React from 'react';
import { Wallet, LogOut, Sun, Moon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Header({ onLogout, theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que iniciar sesión de nuevo para ver tus movimientos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <header className="bg-white/90 dark:bg-slate-950/80 text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl transition-colors duration-200 shadow-sm dark:shadow-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-black/5 dark:ring-white/10">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">Cuenta Clara</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold block">Control Financiero</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón selector de Modo Oscuro / Modo Claro */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema de color"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-medium">Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">Modo oscuro</span>
              </>
            )}
          </button>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-900/80 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
