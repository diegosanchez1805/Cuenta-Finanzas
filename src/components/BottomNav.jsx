import React from 'react';

// Barra de navegación inferior para celular y tableta (el botón de nuevo movimiento flota encima)
export default function BottomNav({ tabs, activeTab, onChangeTab }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/80 pb-safe">
      <div className="flex items-stretch h-16 max-w-xl mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChangeTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold transition-colors duration-300 ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <span className="relative flex items-center justify-center w-12 h-7">
                <span
                  aria-hidden="true"
                  className={`bottom-nav-pill absolute inset-0 rounded-full bg-indigo-100 dark:bg-indigo-500/20 ${
                    active ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}
                />
                <Icon className={`relative w-5 h-5 transition-transform duration-300 ${active ? '-translate-y-px' : ''}`} />
              </span>
              <span className="truncate max-w-full px-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
