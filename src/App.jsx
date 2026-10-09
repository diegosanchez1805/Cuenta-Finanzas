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
  setDoc
} from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { monthKeyOf } from './utils/formatters';

// Componentes
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import BalanceHero from './components/BalanceHero';
import WalletsSection from './components/WalletsSection';
import ChartsSection from './components/ChartsSection';
import TransactionList from './components/TransactionList';
import SavingsSection from './components/SavingsSection';

// Modales
import TransactionModal from './modals/TransactionModal';
import WalletModal from './modals/WalletModal';
import GoalModal from './modals/GoalModal';
import DepositModal from './modals/DepositModal';

// Iconos
import { ReceiptText, PiggyBank, Plus } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Estados de datos
  const [allTx, setAllTx] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [wallets, setWallets] = useState({ card: 0, cash: 0 });

  // Navegación temporal y pestañas
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [activeTab, setActiveTab] = useState('movimientos'); // 'movimientos' | 'ahorros'

  // Tema: 'dark' | 'light' (por defecto 'dark', persistido en localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Estados de modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalType, setWalletModalType] = useState('card');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Escuchar Firestore en tiempo real cuando hay usuario autenticado
  useEffect(() => {
    if (!currentUser) {
      setAllTx([]);
      setSavingsGoals([]);
      setWallets({ card: 0, cash: 0 });
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

    return () => {
      unsubscribeTx();
      unsubscribeSavings();
      unsubscribeWallets();
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

  // Operaciones de Firestore
  const handleAddTransaction = async (entry) => {
    if (!currentUser) return;
    const colRef = collection(db, 'users', currentUser.uid, 'transactions');
    await addDoc(colRef, entry);
  };

  const handleDeleteTransaction = async (id) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'transactions', id);
    await deleteDoc(docRef);
  };

  const handleSaveWallet = async (type, amount) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid, 'wallets', 'current');
    await setDoc(docRef, { [type]: amount }, { merge: true });
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

  // Cálculos reactivos para el mes seleccionado
  const currentMonthKey = monthKeyOf(viewYear, viewMonth);
  const monthTx = allTx.filter((t) => t.date && t.date.slice(0, 7) === currentMonthKey);
  const totalIngreso = monthTx
    .filter((t) => t.type === 'ingreso')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const totalEgreso = monthTx
    .filter((t) => t.type === 'egreso')
    .reduce((s, t) => s + (t.amount || 0), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  return (
    <div className="min-h-screen pb-28 bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      {/* Header global con selector de Modo Oscuro / Claro y Logout */}
      <Header
        onLogout={() => signOut(auth)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* Balance Hero con selector de meses */}
        <BalanceHero
          viewYear={viewYear}
          viewMonth={viewMonth}
          onChangeMonth={handleChangeMonth}
          totalIngreso={totalIngreso}
          totalEgreso={totalEgreso}
        />

        {/* Sección de Tarjeta y Efectivo */}
        <WalletsSection
          wallets={wallets}
          onOpenWalletModal={handleOpenWalletModal}
        />

        {/* Pestañas: Segmented Control adaptativo para Modo Claro y Oscuro */}
        <div className="flex p-1 bg-slate-200/80 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800 rounded-2xl mb-6 max-w-sm shadow-sm dark:shadow-md transition-colors">
          <button
            onClick={() => setActiveTab('movimientos')}
            type="button"
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'movimientos'
                ? 'bg-white text-indigo-700 dark:bg-slate-800 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ReceiptText className={`w-4 h-4 ${activeTab === 'movimientos' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Movimientos</span>
          </button>
          <button
            onClick={() => setActiveTab('ahorros')}
            type="button"
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              activeTab === 'ahorros'
                ? 'bg-white text-indigo-700 dark:bg-slate-800 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700/70'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PiggyBank className={`w-4 h-4 ${activeTab === 'ahorros' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Metas de Ahorro</span>
          </button>
        </div>

        {/* Vista: Movimientos */}
        {activeTab === 'movimientos' && (
          <div className="space-y-6">
            <ChartsSection
              monthTx={monthTx}
              allTx={allTx}
              viewYear={viewYear}
              viewMonth={viewMonth}
              isDark={isDark}
            />
            <TransactionList
              monthTx={monthTx}
              onDeleteTransaction={handleDeleteTransaction}
              isDark={isDark}
            />
          </div>
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

      {/* Botón Flotante (FAB) para nuevo movimiento */}
      {activeTab === 'movimientos' && (
        <button
          onClick={() => setIsTxModalOpen(true)}
          type="button"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 z-40 focus:outline-none focus:ring-4 focus:ring-indigo-400/40 ring-1 ring-white/20"
          aria-label="Registrar nuevo movimiento"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleAddTransaction}
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        initialType={walletModalType}
        wallets={wallets}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleSaveWallet}
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
