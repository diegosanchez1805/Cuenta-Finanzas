import React, { useState } from 'react';
import { Trash2, Search, Download, X, CreditCard, Banknote, ReceiptText, ChevronRight, Repeat } from 'lucide-react';
import { CATEGORY_PALETTE, METHOD_LABEL, money, monthKeyOf, dayLabel } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryIcons';
import Swal from 'sweetalert2';

function TxRow({ t, onEdit, onDelete }) {
  const isIngreso = t.type === 'ingreso';
  const isTransfer = t.type === 'transferencia';
  const catMeta = CATEGORY_PALETTE[t.category] || CATEGORY_PALETTE['Otro'];
  const IconComp = getCategoryIcon(t.category);
  const MethodIcon = t.method === 'cash' ? Banknote : CreditCard;

  return (
    <div className="group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
      <button type="button" onClick={() => onEdit(t)} className="flex items-center gap-3 min-w-0 flex-1 text-left" title="Editar movimiento">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${catMeta.bg}`}>
          <IconComp className="w-5 h-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-800 dark:text-white truncate">
            {t.description || t.category}
          </span>
          <span className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>{isTransfer ? `${METHOD_LABEL[t.from]} → ${METHOD_LABEL[t.to]}` : t.category}</span>
            {t.recurringId && (
              <span title="Movimiento recurrente" className="inline-flex">
                <Repeat className="w-3 h-3 text-indigo-500" />
              </span>
            )}
            {!isTransfer && t.method && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <MethodIcon className="w-3 h-3" />
                <span>{t.method === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
              </>
            )}
          </span>
        </span>
      </button>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={`font-mono font-bold text-sm ${
            isIngreso
              ? 'text-emerald-600 dark:text-emerald-400'
              : isTransfer
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {isIngreso ? '+' : isTransfer ? '' : '−'}
          {money(t.amount)}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(t)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
            title="Eliminar movimiento"
            aria-label="Eliminar movimiento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Lista compacta de últimos movimientos para la vista de Resumen
export function RecentTransactions({ monthTx, onEdit, onSeeAll, onAdd }) {
  const recent = monthTx
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  return (
    <section className="card p-3 sm:p-4">
      <div className="flex items-center justify-between px-2 pb-2">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Últimos movimientos</h3>
        {monthTx.length > 0 && (
          <button type="button" onClick={onSeeAll} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {recent.length === 0 ? (
        <div className="text-center py-8">
          <ReceiptText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Aún no hay movimientos este mes.</p>
          <button type="button" onClick={onAdd} className="btn-primary !text-xs !py-2">
            Registrar el primero
          </button>
        </div>
      ) : (
        recent.map((t) => <TxRow key={t.id} t={t} onEdit={onEdit} />)
      )}
    </section>
  );
}

export default function TransactionList({ monthTx, viewYear, viewMonth, onEditTransaction, onDeleteTransaction, isDark }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'ingreso' | 'egreso'

  const filteredTx = monthTx.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchAmount = (t.amount || '').toString().includes(q);
      return matchDesc || matchCat || matchAmount;
    }
    return true;
  });

  // Agrupar por día, del más reciente al más antiguo
  const groups = {};
  filteredTx.forEach((t) => {
    (groups[t.date] = groups[t.date] || []).push(t);
  });
  const days = Object.keys(groups).sort((a, b) => b.localeCompare(a));

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

    const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Método', 'Monto'];
    const rows = monthTx
      .slice()
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map((t) => [
        t.date || '',
        t.type === 'ingreso' ? 'Ingreso' : t.type === 'transferencia' ? 'Transferencia' : 'Gasto',
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.type === 'transferencia' ? `${METHOD_LABEL[t.from]} a ${METHOD_LABEL[t.to]}` : METHOD_LABEL[t.method] || '',
        t.amount || 0,
      ]);

    const csvContent = '﻿' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Finanzas_movimientos_${monthKeyOf(viewYear, viewMonth)}.csv`);
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
      text: tx.affectsWallet ? 'También se revertirá el cambio en tus saldos.' : 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: isDark ? '#475569' : '#94a3b8',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteTransaction(tx);
        Swal.fire({ icon: 'success', title: 'Borrado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      }
    });
  };

  const filters = [
    { id: 'all', label: `Todos (${monthTx.length})`, active: 'text-slate-900 dark:text-white' },
    { id: 'ingreso', label: 'Ingresos', active: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'egreso', label: 'Gastos', active: 'text-rose-600 dark:text-rose-400' },
    { id: 'transferencia', label: 'Transf.', active: 'text-slate-700 dark:text-slate-200' },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de herramientas: Búsqueda, Filtro y Exportar */}
      <div className="card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por concepto, categoría o monto..."
            className="input !py-2 !pl-9 !pr-8"
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

        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === f.id
                    ? `bg-white dark:bg-slate-800 shadow-sm ${f.active}`
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Exportar movimientos del mes a CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="card p-10 text-center">
          <ReceiptText className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search.trim() ? `Sin resultados para "${search}".` : 'Aún no hay movimientos en este mes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const items = groups[day];
            const net = items.reduce(
              (s, t) => s + (t.type === 'ingreso' ? t.amount : t.type === 'egreso' ? -t.amount : 0),
              0
            );
            return (
              <section key={day} className="card p-2 sm:p-3">
                <div className="flex items-center justify-between px-3 pt-1 pb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 first-letter:uppercase">{dayLabel(day)}</span>
                  <span className={`font-mono text-xs font-bold ${net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {net >= 0 ? '+' : '−'}
                    {money(Math.abs(net))}
                  </span>
                </div>
                {items.map((t) => (
                  <TxRow key={t.id} t={t} onEdit={onEditTransaction} onDelete={handleDelete} />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
