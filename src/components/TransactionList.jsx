import React, { useState } from 'react';
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
  Trash2,
  Search,
  Download,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { CATEGORY_PALETTE, MESES_CORTO, money, todayISO } from '../utils/formatters';
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

export default function TransactionList({ monthTx, onDeleteTransaction, isDark }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'ingreso' | 'egreso'

  const filteredTx = monthTx.filter((t) => {
    // 1. Filtro por tipo
    if (filterType !== 'all' && t.type !== filterType) return false;

    // 2. Filtro por búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchAmount = (t.amount || '').toString().includes(q);
      return matchDesc || matchCat || matchAmount;
    }
    return true;
  });

  const ingresos = filteredTx
    .filter((t) => t.type === 'ingreso')
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const egresos = filteredTx
    .filter((t) => t.type === 'egreso')
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleExportCSV = () => {
    if (monthTx.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin movimientos',
        text: 'No hay movimientos para exportar en este mes.',
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto'];
    const rows = monthTx
      .slice()
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map((t) => [
        t.date || '',
        t.type === 'ingreso' ? 'Ingreso' : 'Gasto',
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount || 0,
      ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CuentaClara_movimientos_${todayISO().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'CSV descargado',
      text: 'Tu reporte mensual se ha exportado con éxito.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
    });
  };

  const handleDelete = (tx) => {
    Swal.fire({
      title: '¿Borrar movimiento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
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
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
          {isIngreso ? (
            <ArrowDownLeft className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          ) : (
            <ArrowUpRight className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {search.trim()
              ? `Sin resultados para "${search}".`
              : isIngreso
              ? 'Aún no hay ingresos registrados este mes.'
              : 'Aún no hay gastos registrados este mes.'}
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
              className="group bg-white dark:bg-slate-900/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between transition-all duration-150 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${catMeta.bg}`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {t.description || t.category}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700/50 font-medium text-[11px]">
                      {t.category}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px]">{dateLabel}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                <span
                  className={`font-mono font-bold text-sm sm:text-base ${
                    isIngreso ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {isIngreso ? '+' : '−'}{money(t.amount)}
                </span>
                <button
                  onClick={() => handleDelete(t)}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
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
    <div className="space-y-4">
      {/* Barra de herramientas: Búsqueda, Filtro y Exportar */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por concepto, categoría o monto..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por Tipo y Botón Exportar */}
        <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({monthTx.length})
            </button>
            <button
              onClick={() => setFilterType('ingreso')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'ingreso'
                  ? 'bg-white text-emerald-600 dark:bg-slate-800 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFilterType('egreso')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'egreso'
                  ? 'bg-white text-rose-600 dark:bg-slate-800 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Gastos
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm focus:outline-none"
            title="Exportar movimientos del mes a archivo Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Lista dividida en 2 columnas: Ingresos y Gastos (o 1 columna si se filtró) */}
      <div className={`grid grid-cols-1 ${filterType === 'all' ? 'md:grid-cols-2' : ''} gap-6`}>
        {/* Columna: Ingresos */}
        {(filterType === 'all' || filterType === 'ingreso') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span>Ingresos</span>
                <span className="text-xs font-normal text-slate-400">({ingresos.length})</span>
              </h3>
            </div>
            {renderGroup(ingresos, 'ingreso')}
          </div>
        )}

        {/* Columna: Gastos */}
        {(filterType === 'all' || filterType === 'egreso') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span>Gastos</span>
                <span className="text-xs font-normal text-slate-400">({egresos.length})</span>
              </h3>
            </div>
            {renderGroup(egresos, 'egreso')}
          </div>
        )}
      </div>
    </div>
  );
}
