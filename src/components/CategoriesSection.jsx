import React from 'react';
import { Tags, Plus } from 'lucide-react';
import { getCustomCategories, getCategoryMeta } from '../utils/registry';

export default function CategoriesSection({ onEdit, onNew }) {
  const mine = getCustomCategories();

  const group = (type, title) => {
    const items = mine.filter((c) => c.type === type);
    if (!items.length) return null;
    return (
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5">{title}</div>
        <div className="flex flex-wrap gap-2">
          {items.map((c) => {
            const meta = getCategoryMeta(c.name);
            const Icon = meta.Icon;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onEdit(c)}
                className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg border flex items-center justify-center" style={meta.style}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Tus categorías
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Crea las tuyas con su ícono y color.</p>
        </div>
        <button type="button" onClick={onNew} className="btn-primary !text-xs !px-3 !py-2">
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>
      {mine.length === 0 ? (
        <p className="text-xs text-slate-400">Aún no tienes categorías propias. Por ejemplo: Mascotas, Gimnasio o Gasolina.</p>
      ) : (
        <div className="space-y-3">
          {group('egreso', 'Gastos')}
          {group('ingreso', 'Ingresos')}
        </div>
      )}
    </section>
  );
}
