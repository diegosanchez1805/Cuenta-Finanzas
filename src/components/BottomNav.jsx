import React from 'react';
import { Plus } from 'lucide-react';

// Barra de navegación inferior para móvil con botón central de nuevo movimiento
export default function BottomNav({ tabs, activeTab, onChangeTab, onAdd }) {
  const half = Math.ceil(tabs.length / 2);

  const renderTab = ({ id, label, icon: Icon }) => {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onChangeTab(id)}
        aria-current={active ? 'page' : undefined}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold transition-colors duration-300 ${
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
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/80 pb-safe">
      <div className="flex items-stretch h-16">
        {tabs.slice(0, half).map(renderTab)}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={onAdd}
            className="w-12 h-12 -mt-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-[#f5f6fa] dark:ring-[#0b0f19] active:scale-95 transition-transform"
            aria-label="Nuevo movimiento"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
        {tabs.slice(half).map(renderTab)}
      </div>
    </nav>
  );
}
