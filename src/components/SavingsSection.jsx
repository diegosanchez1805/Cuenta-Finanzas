import React from 'react';
import { Target, Plus, PiggyBank, CheckCircle, Trash2, ArrowLeftRight } from 'lucide-react';
import { money } from '../utils/formatters';
import Swal from 'sweetalert2';

export default function SavingsSection({
  savingsGoals,
  onOpenNewGoalModal,
  onOpenDepositModal,
  onDeleteGoal,
}) {
  const handleDelete = (goal) => {
    Swal.fire({
      title: '¿Borrar meta?',
      text: 'El progreso acumulado se eliminará de tus metas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteGoal(goal.id);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 p-5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Tus Metas de Ahorro</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organiza tu dinero y alcanza tus objetivos paso a paso.
          </p>
        </div>
        <button
          onClick={onOpenNewGoalModal}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva meta</span>
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="bg-slate-900/70 rounded-3xl p-10 text-center border border-slate-800 shadow-xl max-w-md mx-auto backdrop-blur-md">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">Sin metas de ahorro</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Crea tu primera meta financiera para comenzar a apartar y monitorear tu dinero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((g) => {
            const pct =
              g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
            const isComplete = pct >= 100;

            return (
              <div
                key={g.id}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 backdrop-blur-md hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl ${
                          isComplete
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        } flex items-center justify-center flex-shrink-0`}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm sm:text-base truncate">
                        {g.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(g)}
                        type="button"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Montos y Progreso */}
                  <div className="flex items-baseline justify-between text-xs mt-3 mb-1.5">
                    <div className="font-mono text-slate-400">
                      <span className="font-bold text-white text-sm">{money(g.saved)}</span> de{' '}
                      {money(g.target)}
                    </div>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded-full text-xs ${
                        isComplete
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete
                          ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Botón de Acción */}
                <div className="pt-1">
                  <button
                    onClick={() => onOpenDepositModal(g)}
                    type="button"
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-800/80 hover:bg-indigo-500/15 text-slate-200 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Abonar o Retirar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
