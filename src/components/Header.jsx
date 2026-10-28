import React from 'react';
import { LogOut, Sun, Moon } from 'lucide-react';
import Swal from 'sweetalert2';
import Logo from './Logo';

export default function Header({ onLogout, theme, onToggleTheme, userEmail, tabs, activeTab, onChangeTab }) {
  const isDark = theme === 'dark';
  const initial = (userEmail || '?').charAt(0).toUpperCase();

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
    <header className="bg-white/80 dark:bg-[#0b0f19]/80 border-b border-slate-200/70 dark:border-slate-800/70 sticky top-0 z-30 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Logo className="w-9 h-9 drop-shadow-[0_4px_10px_rgba(99,102,241,0.35)]" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Finanzas</span>
        </div>

        {/* Navegación de escritorio (en móvil se usa la barra inferior) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeTab(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleTheme}
            type="button"
            className="icon-btn"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema de color"
          >
            {isDark ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-slate-200 dark:border-slate-800">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center"
              title={userEmail}
            >
              {initial}
            </div>
            <span className="hidden lg:block text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
              {userEmail}
            </span>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            className="icon-btn hover:!text-rose-600 dark:hover:!text-rose-400 hover:!bg-rose-50 dark:hover:!bg-rose-500/10"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
