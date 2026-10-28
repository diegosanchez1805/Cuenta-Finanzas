import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  writeBatch,
  increment
} from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { sumBy, txOfMonth, prevMonthOf, setHideAmounts } from './utils/formatters';
import Swal from 'sweetalert2';

// Componentes
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MonthSwitcher from './components/MonthSwitcher';
import AuthScreen from './components/AuthScreen';
import BalanceHero from './components/BalanceHero';
import WalletsSection from './components/WalletsSection';
import InsightsSection from './components/InsightsSection';
import ChartsSection from './components/ChartsSection';
import TransactionList, { RecentTransactions } from './components/TransactionList';
import BudgetsSection, { BudgetAlerts } from './components/BudgetsSection';
import SavingsSection from './components/SavingsSection';
import Logo from './components/Logo';

// Modales
import TransactionModal from './modals/TransactionModal';
import WalletModal from './modals/WalletModal';
import GoalModal from './modals/GoalModal';
import DepositModal from './modals/DepositModal';
import BudgetModal from './modals/BudgetModal';

// Iconos
import { LayoutDashboard, ReceiptText, Gauge, PiggyBank, Plus } from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'movimientos', label: 'Movimientos', icon: ReceiptText },
  { id: 'presupuestos', label: 'Presupuestos', icon: Gauge },
  { id: 'ahorros', label: 'Metas', icon: PiggyBank },
];

// Efecto de un movimiento sobre los saldos: { card: +x } / { cash: -y }
function walletEffect(tx, sign = 1) {
  if (!tx || !tx.affectsWallet || !tx.method) return {};
  const delta = (tx.type === 'ingreso' ? tx.amount : -tx.amount) * sign;
  return { [tx.method]: delta };
}

// Cerrar sesión tras este tiempo sin usar la app
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'lastActivity';

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento local */
  }
};

function mergeEffects(...effects) {
  const out = {};
  effects.forEach((e) => {
    Object.entries(e).forEach(([k, v]) => {
      out[k] = (out[k] || 0) + v;
    });
  });
  return out;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados de datos
  const [allTx, setAllTx] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [wallets, setWallets] = useState({ card: 0, cash: 0 });
  const [budgets, setBudgets] = useState({});

  // Navegación temporal y pestañas
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [activeTab, setActiveTab] = useState('resumen');

  // Tema: 'dark' | 'light' (por defecto 'dark', persistido en localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const isDark = theme === 'dark';

  // Modo privado: oculta las cantidades (se aplica antes de pintar los componentes)
  const [amountsHidden, setAmountsHidden] = useState(() => readStorage('hideAmounts') === '1');
  setHideAmounts(amountsHidden);

  const handleToggleAmounts = () => {
    setAmountsHidden((prev) => {
      writeStorage('hideAmounts', prev ? '0' : '1');
      return !prev;
    });
  };

  // Estados de modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalType, setWalletModalType] = useState('card');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Sincronizar color de la barra del navegador móvil
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b0f19' : '#f5f6fa');
  }, [theme]);

  const openNewTx = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  // Atajos de teclado: 'N' para nuevo movimiento, 'Escape' para cerrar modales
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTxModalOpen(false);
        setIsWalletModalOpen(false);
        setIsGoalModalOpen(false);
        setIsDepositModalOpen(false);
        setIsBudgetModalOpen(false);
        return;
      }

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openNewTx();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Cierre de sesión automático por inactividad. La hora de la última actividad se
  // guarda para detectarlo también cuando el celular estuvo bloqueado o en segundo plano.
  useEffect(() => {
    if (!currentUser) return;

    const expired = () => {
      const last = Number(readStorage(LAST_ACTIVITY_KEY)) || Date.now();
      return Date.now() - last > INACTIVITY_LIMIT_MS;
    };

    const logoutForInactivity = () => {
      writeStorage(LAST_ACTIVITY_KEY, '');
      signOut(auth);
      Swal.fire({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Cerramos tu sesión por inactividad para proteger tus datos.',
        confirmButtonColor: '#4f46e5',
      });
    };

    if (expired()) {
      logoutForInactivity();
      return;
    }

    let lastWrite = 0;
    const markActivity = () => {
      const now = Date.now();
      if (now - lastWrite > 15000) {
        lastWrite = now;
        writeStorage(LAST_ACTIVITY_KEY, String(now));
      }
    };
    markActivity();

    const check = () => {
      if (expired()) logoutForInactivity();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, markActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisibility);
    const interval = setInterval(check, 30000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActivity));
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
    };
  }, [currentUser]);

  // Escuchar Firestore en tiempo real cuando hay usuario autenticado
  useEffect(() => {
    if (!currentUser) {
      setAllTx([]);
      setSavingsGoals([]);
      setWallets({ card: 0, cash: 0 });
      setBudgets({});
      return;
    }

    // 1. Transacciones
    const txColRef = collection(db, 'users', currentUser.uid, 'transactions');
    const unsubscribeTx = onSnapshot(txColRef, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllTx(docs);
    });

    // 2. Metas de ahorro
    const savingsColRef = collection(db, 'users', currentUser.uid, 'savings');
    const unsubscribeSavings = onSnapshot(savingsColRef, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSavingsGoals(docs);
    });

    // 3. Saldos de dinero (Tarjeta y Efectivo)
    const walletDocRef = doc(db, 'users', currentUser.uid, 'wallets', 'current');
    const unsubscribeWallets = onSnapshot(walletDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWallets({
          card: Number(data.card) || 0,
          cash: Number(data.cash) || 0,
        });
      } else {
        setWallets({ card: 0, cash: 0 });
      }
    });

    // 4. Presupuestos por categoría
    const budgetsDocRef = doc(db, 'users', currentUser.uid, 'settings', 'budgets');
    const unsubscribeBudgets = onSnapshot(
      budgetsDocRef,
      (docSnap) => setBudgets(docSnap.exists() ? docSnap.data().limits || {} : {}),
      () => setBudgets({})
    );

    return () => {
      unsubscribeTx();
      unsubscribeSavings();
      unsubscribeWallets();
      unsubscribeBudgets();
    };
  }, [currentUser]);

  // Cambiar de mes
  const handleChangeMonth = (delta) => {
    let newM = viewMonth + delta;
    let newY = viewYear;
    if (newM < 0) {
      newM = 11;
      newY--;
    } else if (newM > 11) {
      newY++;
      newM = 0;
    }
    setViewMonth(newM);
    setViewYear(newY);
  };

  const handleGoToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // Operaciones de Firestore
  const walletRef = () => doc(db, 'users', currentUser.uid, 'wallets', 'current');

  // Aplica el cambio de saldo dentro del mismo lote para que sea atómico
  const addWalletEffect = (batch, effect) => {
    const update = {};
    Object.entries(effect).forEach(([k, v]) => {
      if (v) update[k] = increment(v);
    });
    if (Object.keys(update).length) batch.set(walletRef(), update, { merge: true });
  };

  const handleSaveTransaction = async (entry) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    if (editingTx) {
      const ref = doc(db, 'users', currentUser.uid, 'transactions', editingTx.id);
      batch.update(ref, entry);
      addWalletEffect(batch, mergeEffects(walletEffect(editingTx, -1), walletEffect(entry)));
    } else {
      const ref = doc(collection(db, 'users', currentUser.uid, 'transactions'));
      batch.set(ref, { ...entry, createdAt: Date.now() });
      addWalletEffect(batch, walletEffect(entry));
    }
    await batch.commit();
  };

  const handleDeleteTransaction = async (tx) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', currentUser.uid, 'transactions', tx.id));
    addWalletEffect(batch, walletEffect(tx, -1));
    await batch.commit();
  };

  const handleEditTransaction = (tx) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveWallet = async (type, amount) => {
    if (!currentUser) return;
    await setDoc(walletRef(), { [type]: amount }, { merge: true });
  };

  const handleSaveBudget = async (category, amount) => {
    if (!currentUser) return;
    const next = { ...budgets };
    if (amount > 0) next[category] = amount;
    else delete next[category];
    await setDoc(doc(db, 'users', currentUser.uid, 'settings', 'budgets'), { limits: next });
  };

  const handleOpenBudgetModal = (category) => {
    setBudgetCategory(category);
    setIsBudgetModalOpen(true);
  };

  const handleAddGoal = async (goal) => {
    if (!currentUser) return;
    const colRef = collection(db, 'users', currentUser.uid, 'savings');
    await addDoc(colRef, goal);
  };

  const handleDeleteGoal = async (id) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'savings', id);
    await deleteDoc(docRef);
  };

  const handleUpdateGoalAmount = async (id, newSaved) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'savings', id);
    await updateDoc(docRef, { saved: newSaved });
  };

  const handleOpenDepositModal = (goal) => {
    setSelectedGoal(goal);
    setIsDepositModalOpen(true);
  };

  const handleOpenWalletModal = (type = 'card') => {
    setWalletModalType(type);
    setIsWalletModalOpen(true);
  };

  // Cálculos reactivos para el mes seleccionado y el anterior
  const monthTx = txOfMonth(allTx, viewYear, viewMonth);
  const totalIngreso = sumBy(monthTx, 'ingreso');
  const totalEgreso = sumBy(monthTx, 'egreso');
  const prevTx = txOfMonth(allTx, ...prevMonthOf(viewYear, viewMonth));
  const prevIngreso = sumBy(prevTx, 'ingreso');
  const prevEgreso = sumBy(prevTx, 'egreso');

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f5f6fa] dark:bg-[#0b0f19]">
        <Logo className="w-12 h-12 animate-pulse" />
        <div className="w-6 h-6 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  })();
  const userName = (currentUser.displayName || currentUser.email || '').split('@')[0];
  const showMonth = activeTab !== 'ahorros';
  const activeLabel = TABS.find((t) => t.id === activeTab)?.label;

  return (
    <div className="min-h-screen pb-28 md:pb-16 bg-[#f5f6fa] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      <Header
        onLogout={() => signOut(auth)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userEmail={currentUser.email}
        amountsHidden={amountsHidden}
        onToggleAmounts={handleToggleAmounts}
        tabs={TABS}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Encabezado de página con selector de mes */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'resumen' ? `${greeting}, ${userName}` : 'Finanzas'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {activeTab === 'resumen' ? 'Tu resumen' : activeLabel}
            </h1>
          </div>
          {showMonth && (
            <MonthSwitcher
              viewYear={viewYear}
              viewMonth={viewMonth}
              onChangeMonth={handleChangeMonth}
              onToday={handleGoToToday}
            />
          )}
        </div>

        {/* Vista: Resumen */}
        {activeTab === 'resumen' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <BalanceHero
                  viewMonth={viewMonth}
                  totalIngreso={totalIngreso}
                  totalEgreso={totalEgreso}
                  prevIngreso={prevIngreso}
                  prevEgreso={prevEgreso}
                />
              </div>
              <WalletsSection wallets={wallets} onOpenWalletModal={handleOpenWalletModal} />
            </div>

            <BudgetAlerts budgets={budgets} monthTx={monthTx} onOpen={() => setActiveTab('presupuestos')} />

            <InsightsSection monthTx={monthTx} viewYear={viewYear} viewMonth={viewMonth} prevEgreso={prevEgreso} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <ChartsSection monthTx={monthTx} allTx={allTx} viewYear={viewYear} viewMonth={viewMonth} isDark={isDark} />
              </div>
              <div className="lg:col-span-2">
                <RecentTransactions
                  monthTx={monthTx}
                  onEdit={handleEditTransaction}
                  onSeeAll={() => setActiveTab('movimientos')}
                  onAdd={openNewTx}
                />
              </div>
            </div>
          </div>
        )}

        {/* Vista: Movimientos */}
        {activeTab === 'movimientos' && (
          <div className="max-w-3xl">
            <TransactionList
              monthTx={monthTx}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              isDark={isDark}
            />
          </div>
        )}

        {/* Vista: Presupuestos */}
        {activeTab === 'presupuestos' && (
          <BudgetsSection budgets={budgets} monthTx={monthTx} onEditBudget={handleOpenBudgetModal} />
        )}

        {/* Vista: Metas de Ahorro */}
        {activeTab === 'ahorros' && (
          <SavingsSection
            savingsGoals={savingsGoals}
            onOpenNewGoalModal={() => setIsGoalModalOpen(true)}
            onOpenDepositModal={handleOpenDepositModal}
            onDeleteGoal={handleDeleteGoal}
            isDark={isDark}
          />
        )}
      </main>

      {/* Botón Flotante (solo escritorio; en móvil está en la barra inferior) */}
      <button
        onClick={openNewTx}
        type="button"
        className="hidden md:flex fixed bottom-6 right-6 h-14 pl-4 pr-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white items-center gap-2.5 shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 z-40 focus:outline-none focus:ring-4 focus:ring-indigo-400/40"
        aria-label="Registrar nuevo movimiento (tecla N)"
        title="Nuevo movimiento (Atajo: tecla 'N')"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
        <span className="text-xs font-bold tracking-wide">Nuevo</span>
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/20 leading-none">N</span>
      </button>

      <BottomNav tabs={TABS} activeTab={activeTab} onChangeTab={setActiveTab} onAdd={openNewTx} />

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        editing={editingTx}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        defaultYear={viewYear}
        defaultMonth={viewMonth}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        initialType={walletModalType}
        wallets={wallets}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleSaveWallet}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        initialCategory={budgetCategory}
        budgets={budgets}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        goal={selectedGoal}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleUpdateGoalAmount}
      />
    </div>
  );
}
