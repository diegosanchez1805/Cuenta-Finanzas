import React from 'react';
import { PieChart as PieIcon, BarChart3, Receipt } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { CATEGORY_PALETTE, MESES_CORTO, money, monthKeyOf } from '../utils/formatters';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function ChartsSection({ monthTx, allTx, viewYear, viewMonth, isDark }) {
  // 1. Donut: Gastos por categoría del mes actual
  const catMap = {};
  monthTx
    .filter((t) => t.type === 'egreso')
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const hasCatData = catEntries.length > 0;

  const donutData = {
    labels: catEntries.map((e) => e[0]),
    datasets: [
      {
        data: catEntries.map((e) => e[1]),
        backgroundColor: catEntries.map(
          (e) => (CATEGORY_PALETTE[e[0]] || CATEGORY_PALETTE['Otro']).color
        ),
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 4,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: 600 },
          color: isDark ? '#94a3b8' : '#475569',
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#020617' : '#0f172a',
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 1 : 0,
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
        bodyFont: { size: 12, family: "'JetBrains Mono', monospace" },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${money(ctx.parsed)}`,
        },
      },
    },
  };

  // 2. Tendencia últimos 6 meses
  const trendLabels = [];
  const trendIngresos = [];
  const trendEgresos = [];

  for (let i = 5; i >= 0; i--) {
    let m = viewMonth - i;
    let y = viewYear;
    while (m < 0) {
      m += 12;
      y--;
    }
    const key = monthKeyOf(y, m);
    trendLabels.push(MESES_CORTO[m]);

    const ing = allTx
      .filter((t) => t.date && t.date.slice(0, 7) === key && t.type === 'ingreso')
      .reduce((s, t) => s + t.amount, 0);

    const eg = allTx
      .filter((t) => t.date && t.date.slice(0, 7) === key && t.type === 'egreso')
      .reduce((s, t) => s + t.amount, 0);

    trendIngresos.push(ing);
    trendEgresos.push(eg);
  }

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Ingresos',
        data: trendIngresos,
        backgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Gastos',
        data: trendEgresos,
        backgroundColor: '#f43f5e',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: 600 },
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#020617' : '#0f172a',
        borderColor: isDark ? '#334155' : 'transparent',
        borderWidth: isDark ? 1 : 0,
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        titleFont: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
        bodyFont: { size: 12, family: "'JetBrains Mono', monospace" },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${money(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        display: false,
        grid: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: 600 },
          color: isDark ? '#64748b' : '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Gráfica de Categorías */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col justify-between backdrop-blur-md transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>¿En qué se fue el dinero?</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribución de gastos por categoría</p>
        </div>

        <div className="relative flex items-center justify-center min-h-[190px]">
          {hasCatData ? (
            <div className="w-full h-[190px]">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sin gastos registrados en este mes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gráfica de Tendencia */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl flex flex-col justify-between backdrop-blur-md transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Tendencia semestral</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Comparativa de ingresos vs gastos</p>
        </div>

        <div className="relative flex items-center justify-center min-h-[190px]">
          <div className="w-full h-[190px]">
            <Bar data={trendData} options={trendOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
