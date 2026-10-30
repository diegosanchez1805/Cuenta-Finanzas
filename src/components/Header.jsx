import React, { useLayoutEffect, useRef, useState } from 'react';
import { LogOut, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import Logo from './Logo';

export default function Header({ onLogout, theme, onToggleTheme, displayName, onOpenProfile, amountsHidden, onToggleAmounts, tabs, activeTab, onChangeTab }) {
  const isDark = theme === 'dark';
  const initial = (displayName || '?').charAt(0).toUpperCase();

  // Posición del fondo deslizante de la pestaña activa
  const navRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // La primera colocación es instantánea; solo se anima a partir de ahí
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeTab];
      if (!el || !el.offsetWidth) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      requestAnimationFrame(() => setAnimated(true));
    };
    measure();
    // Volver a medir cuando cargan las fuentes o cambia el tamaño de la ventana
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [activeTab]);

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
    <header className="pt-safe bg-white/80 dark:bg-[#0b0f19]/80 border-b border-slate-200/70 dark:border-slate-800/70 sticky top-0 z-30 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Logo className="w-9 h-9 drop-shadow-[0_4px_10px_rgba(99,102,241,0.35)]" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Finanzas</span>
        </div>

        {/* Navegación de escritorio (en móvil se usa la barra inferior) */}
        <nav ref={navRef} className="hidden md:flex relative items-center gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
          {/* Fondo que se desliza hacia la pestaña activa */}
          <span
            aria-hidden="true"
            className={`nav-indicator ${animated ? 'is-animated' : ''} absolute top-1 bottom-1 left-0 rounded-xl bg-white dark:bg-slate-800 shadow-sm`}
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
              opacity: indicator.width ? 1 : 0,
            }}
          />
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                ref={(el) => (tabRefs.current[id] = el)}
                type="button"
                onClick={() => onChangeTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors duration-300 ${
                  active
                    ? 'text-indigo-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors duration-300 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleAmounts}
            type="button"
            className={`icon-btn ${amountsHidden ? '!text-indigo-600 dark:!text-indigo-400 !bg-indigo-50 dark:!bg-indigo-500/10' : ''}`}
            title={amountsHidden ? 'Mostrar cantidades' : 'Ocultar cantidades'}
            aria-label={amountsHidden ? 'Mostrar cantidades' : 'Ocultar cantidades'}
            aria-pressed={amountsHidden}
          >
            {amountsHidden ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
          <button
            onClick={onToggleTheme}
            type="button"
            className="icon-btn"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema de color"
          >
            {isDark ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1.5 pr-1.5 lg:pr-3 py-1 ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            title="Editar tu perfil"
            aria-label="Editar tu perfil"
          >
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
              {initial}
            </span>
            <span className="hidden lg:block text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
              {displayName || 'Agrega tu nombre'}
            </span>
          </button>

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
