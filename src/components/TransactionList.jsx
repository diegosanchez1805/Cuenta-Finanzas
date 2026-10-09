import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Zap,
  HeartPulse,
  Film,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  CircleDollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { CATEGORY_PALETTE, MESES_CORTO, money } from '../utils/formatters';
import Swal from 'sweetalert2';

function getCategoryIcon(catName) {
  switch (catName) {
    case 'Comida': return Utensils;
    case 'Transporte': return Car;
    case 'Vivienda': return Home;
    case 'Servicios': return Zap;
    case 'Salud': return HeartPulse;
    case 'Entretenimiento': return Film;
    case 'Salario': return Briefcase;
    case 'Freelance': return Laptop;
    case 'Inversión': return TrendingUp;
    case 'Regalo': return Gift;
    default: return CircleDollarSign;
  }
}

export default function TransactionList({ monthTx, onDeleteTransaction }) {
  const ingresos = monthTx
    .filter((t) => t.type === 'ingreso')
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const egresos = monthTx
    .filter((t) => t.type === 'egreso')
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleDelete = (tx) => {
    Swal.fire({
      title: '¿Borrar movimiento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteTransaction(tx.id);
        Swal.fire({
          icon: 'success',
          title: 'Borrado',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  };

  const renderGroup = (items, type) => {
    const isIngreso = type === 'ingreso';

    if (items.length === 0) {
      return (
        <div className="bg-slate-900/60 rounded-2xl p-6 text-center border border-slate-800 shadow-sm backdrop-blur-md">
          {isIngreso ? (
            <ArrowDownLeft className="w-7 h-7 text-slate-600 mx-auto mb-2" />
          ) : (
            <ArrowUpRight className="w-7 h-7 text-slate-600 mx-auto mb-2" />
          )}
          <p className="text-xs text-slate-400">
            {isIngreso ? 'Aún no hay ingresos registrados este mes.' : 'Aún no hay gastos registrados este mes.'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {items.map((t) => {
          const catMeta = CATEGORY_PALETTE[t.category] || CATEGORY_PALETTE['Otro'];
          const IconComp = getCategoryIcon(t.category);
          const day = t.date ? t.date.slice(8, 10) : '';
          const mIdx = t.date ? parseInt(t.date.slice(5, 7), 10) - 1 : 0;
          const dateLabel = `${day} ${MESES_CORTO[mIdx] || ''}`;

          return (
            <div
              key={t.id}
              className="group bg-slate-900/70 hover:bg-slate-850/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between transition-all duration-150 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${catMeta.bg}`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {t.description || t.category}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-medium text-[11px]">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500 text-[11px]">{dateLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                <span
                  className={`font-mono font-bold text-sm sm:text-base ${
                    isIngreso ? 'text-emerald-400' : 'text-slate-100'
                  }`}
                >
                  {isIngreso ? '+' : '−'}{money(t.amount)}
                </span>
                <button
                  onClick={() => handleDelete(t)}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                  title="Eliminar movimiento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna: Ingresos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span>Ingresos</span>
          </h3>
        </div>
        {renderGroup(ingresos, 'ingreso')}
      </div>

      {/* Columna: Gastos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span>Gastos</span>
          </h3>
        </div>
        {renderGroup(egresos, 'egreso')}
      </div>
    </div>
  );
}
