import React, { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  updateProfile
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
  increment,
  runTransaction,
  deleteField
} from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { sumBy, txOfMonth, prevMonthOf, setHideAmounts, todayISO } from './utils/formatters';
import { nextOccurrence, alignBiweekly } from './utils/recurring';
import { setAccounts, setCustomCategories, getAccounts, getAccount, DEFAULT_ACCOUNTS } from './utils/registry';
import useOnline from './hooks/useOnline';
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
import CategoriesSection from './components/CategoriesSection';
import SavingsSection from './components/SavingsSection';
import DebtsSection from './components/DebtsSection';
import RecurringSection from './components/RecurringSection';
import OfflineBanner from './components/OfflineBanner';
import UndoToast from './components/UndoToast';
import Logo from './components/Logo';

// Modales
import TransactionModal from './modals/TransactionModal';
import AccountModal from './modals/AccountModal';
import CategoryModal from './modals/CategoryModal';
import GoalModal from './modals/GoalModal';
import DepositModal from './modals/DepositModal';
import DebtModal from './modals/DebtModal';
import DebtPaymentModal from './modals/DebtPaymentModal';
import ProfileModal from './modals/ProfileModal';
import BudgetModal from './modals/BudgetModal';

// Iconos
import { LayoutDashboard, ReceiptText, Gauge, PiggyBank, HandCoins, Plus } from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'movimientos', label: 'Movimientos', icon: ReceiptText },
  { id: 'presupuestos', label: 'Presupuestos', icon: Gauge },
  { id: 'ahorros', label: 'Metas', icon: PiggyBank },
  { id: 'deudas', label: 'Deudas', icon: HandCoins },
];

// Pestañas que no dependen del mes seleccionado
const TABS_WITHOUT_MONTH = ['ahorros', 'deudas'];

// Efecto de un movimiento sobre los saldos: { [cuenta]: +x }
function walletEffect(tx, sign = 1) {
  if (!tx) return {};
  if (tx.type === 'transferencia') {
    if (!tx.from || !tx.to || tx.from === tx.to) return {};
    return { [tx.from]: -tx.amount * sign, [tx.to]: tx.amount * sign };
  }
  if (!tx.affectsWallet || !tx.method) return {};
  const delta = (tx.type === 'ingreso' ? tx.amount : -tx.amount) * sign;
  return { [tx.method]: delta };
}

// Cerrar sesión tras este tiempo sin usar la app
const INACTIVITY_LIMIT_MS = 8 * 60 * 60 * 1000;
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

// Sin conexión, Firestore guarda el cambio en el celular y la promesa no termina hasta
// sincronizar; en ese caso no hacemos esperar a la pantalla.
const settle = (promise) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    promise.catch(() => {});
    return Promise.resolve();
  }
  return promise;
};

const stripId = ({ id, ...rest }) => rest;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const online = useOnline();

  // Estados de datos
  const [allTx, setAllTx] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [wallets, setWallets] = useState({ card: 0, cash: 0 });
  const [budgets, setBudgets] = useState({});
  const [recurring, setRecurring] = useState([]);
  const [accountsList, setAccountsList] = useState(DEFAULT_ACCOUNTS);
  const [customCats, setCustomCats] = useState([]);
  const [debts, setDebts] = useState([]);

  // Cuentas y categorías disponibles para todos los componentes de este render
  setAccounts(accountsList);
  setCustomCategories(customCats);

  // Navegación temporal y pestañas
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [activeTab, setActiveTab] = useState('resumen');
  // Dirección de la animación: hacia la derecha si la nueva pestaña está después
  const [tabDirection, setTabDirection] = useState('right');

  const goToTab = (id) => {
    if (id === activeTab) return;
    const from = TABS.findIndex((t) => t.id === activeTab);
    const to = TABS.findIndex((t) => t.id === id);
    setTabDirection(to > from ? 'right' : 'left');
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tema: 'dark' | 'light' (por defecto 'dark', persistido en localStorage)
  const [theme, setTheme] = useState(() => {
    return readStorage('theme') || 'dark';
  });

  const isDark = theme === 'dark';

  // Nombre a mostrar (perfil de Firebase); nunca se muestra el correo
  const [displayName, setDisplayName] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSaveName = async (name) => {
    if (!currentUser) return;
    await updateProfile(currentUser, { displayName: name });
    setDisplayName(name);
  };

  // Modo privado: oculta las cantidades (se aplica antes de pintar los componentes)
  const [amountsHidden, setAmountsHidden] = useState(() => readStorage('hideAmounts') === '1');
  setHideAmounts(amountsHidden);

  const handleToggleAmounts = () => {
    setAmountsHidden((prev) => {
      writeStorage('hideAmounts', prev ? '0' : '1');
      return !prev;
    });
  };

  // Aviso con "Deshacer" tras borrar algo
  const [undoToast, setUndoToast] = useState(null);
  const showUndo = (message, undo) => setUndoToast({ id: Date.now(), message, undo });

  // Estados de modales
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [txInitialType, setTxInitialType] = useState('egreso');
  const [txInitialTo, setTxInitialTo] = useState(null);
  const [accountModal, setAccountModal] = useState({ open: false, id: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null, type: 'egreso', onCreated: null });
  const [goalModal, setGoalModal] = useState({ open: false, goal: null });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [debtModal, setDebtModal] = useState({ open: false, debt: null });
  const [payingDebt, setPayingDebt] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    writeStorage('theme', theme);

    // Sincronizar color de la barra del navegador móvil
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0b0f19' : '#f5f6fa');
  }, [theme]);

  const openNewTx = (type = 'egreso', to = null) => {
    setEditingTx(null);
    setEditingRule(null);
    setTxInitialType(type);
    setTxInitialTo(to);
    setIsTxModalOpen(true);
  };

  // Atajos de teclado: 'N' para nuevo movimiento, 'Escape' para cerrar modales
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTxModalOpen(false);
        setAccountModal({ open: false, id: null });
        setCategoryModal((m) => ({ ...m, open: false }));
        setGoalModal({ open: false, goal: null });
        setIsDepositModalOpen(false);
        setDebtModal({ open: false, debt: null });
        setPayingDebt(null);
        setIsBudgetModalOpen(false);
        setIsProfileModalOpen(false);
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
      setDisplayName(user?.displayName || '');
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
      setRecurring([]);
      setAccountsList(DEFAULT_ACCOUNTS);
      setCustomCats([]);
      setDebts([]);
      return;
    }

    const uid = currentUser.uid;
    const listCol = (name, setter) =>
      onSnapshot(
        collection(db, 'users', uid, name),
        (snapshot) => setter(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
        () => setter([])
      );

    const unsubs = [
      // Movimientos, metas, recurrentes y deudas
      listCol('transactions', setAllTx),
      listCol('savings', setSavingsGoals),
      listCol('recurring', setRecurring),
      listCol('debts', setDebts),

      // Saldos por cuenta: { [idCuenta]: saldo }
      onSnapshot(doc(db, 'users', uid, 'wallets', 'current'), (docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : {};
        const balances = { card: 0, cash: 0 };
        Object.entries(data).forEach(([k, v]) => {
          balances[k] = Number(v) || 0;
        });
        setWallets(balances);
      }),

      // Presupuestos por categoría
      onSnapshot(
        doc(db, 'users', uid, 'settings', 'budgets'),
        (docSnap) => setBudgets(docSnap.exists() ? docSnap.data().limits || {} : {}),
        () => setBudgets({})
      ),

      // Cuentas (si nunca se han editado, se usan Tarjeta y Efectivo)
      onSnapshot(
        doc(db, 'users', uid, 'settings', 'accounts'),
        (docSnap) => {
          const items = docSnap.exists() ? docSnap.data().items : null;
          setAccountsList(items && items.length ? items : DEFAULT_ACCOUNTS);
        },
        () => setAccountsList(DEFAULT_ACCOUNTS)
      ),

      // Categorías personalizadas
      onSnapshot(
        doc(db, 'users', uid, 'settings', 'categories'),
        (docSnap) => setCustomCats(docSnap.exists() ? docSnap.data().items || [] : []),
        () => setCustomCats([])
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, [currentUser]);

  // Registra los movimientos recurrentes que ya vencieron. Se hace en una transacción
  // que vuelve a leer la regla, así otro dispositivo abierto no los duplica.
  // Las transacciones necesitan internet: al reconectar se vuelve a intentar.
  useEffect(() => {
    if (!currentUser || !online) return;
    const uid = currentUser.uid;
    const today = todayISO();
    const due = recurring.filter((r) => r.active && r.nextDate && r.nextDate <= today);

    due.forEach((rule) => {
      const rRef = doc(db, 'users', uid, 'recurring', rule.id);
      runTransaction(db, async (t) => {
        const snap = await t.get(rRef);
        if (!snap.exists()) return;
        const r = snap.data();
        if (!r.active || !r.nextDate || r.nextDate > today) return;

        let next = r.nextDate;
        let effect = {};
        // Tope de seguridad por si la app estuvo mucho tiempo sin abrirse
        for (let i = 0; next && next <= today && i < 60; i++) {
          const entry = {
            type: r.type,
            amount: r.amount,
            category: r.category,
            description: r.description || '',
            date: next,
            method: r.method,
            affectsWallet: !!r.affectsWallet,
            recurringId: rule.id,
            createdAt: Date.now(),
          };
          t.set(doc(collection(db, 'users', uid, 'transactions')), entry);
          effect = mergeEffects(effect, walletEffect(entry));
          next = nextOccurrence(next, r.frequency, r.day);
        }

        const update = {};
        Object.entries(effect).forEach(([k, v]) => {
          if (v) update[k] = increment(v);
        });
        if (Object.keys(update).length) t.set(doc(db, 'users', uid, 'wallets', 'current'), update, { merge: true });
        t.update(rRef, { nextDate: next });
      }).catch(() => {});
    });
  }, [currentUser, recurring, online]);

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
  const userDoc = (...path) => doc(db, 'users', currentUser.uid, ...path);
  const userCol = (name) => collection(db, 'users', currentUser.uid, name);
  const walletRef = () => userDoc('wallets', 'current');

  // Aplica el cambio de saldo dentro del mismo lote o transacción para que sea atómico
  const addWalletEffect = (writer, effect) => {
    const update = {};
    Object.entries(effect).forEach(([k, v]) => {
      if (v) update[k] = increment(v);
    });
    if (Object.keys(update).length) writer.set(walletRef(), update, { merge: true });
  };

  const ruleRef = (id) => userDoc('recurring', id);

  const ruleFromEntry = (entry, frequency) => {
    const { date, ...rest } = entry;
    return {
      ...rest,
      frequency,
      day: Number(date.slice(8, 10)),
      nextDate: frequency === 'biweekly' ? alignBiweekly(date) : date,
    };
  };

  /* ---------- Movimientos ---------- */

  const handleSaveTransaction = async (entry, frequency = 'none') => {
    if (!currentUser) return;

    if (editingRule) {
      await settle(updateDoc(ruleRef(editingRule.id), ruleFromEntry(entry, frequency)));
      return;
    }
    if (!editingTx && frequency !== 'none') {
      await settle(
        addDoc(userCol('recurring'), {
          ...ruleFromEntry(entry, frequency),
          active: true,
          createdAt: Date.now(),
        })
      );
      return;
    }

    const batch = writeBatch(db);
    if (editingTx) {
      batch.update(userDoc('transactions', editingTx.id), entry);
      addWalletEffect(batch, mergeEffects(walletEffect(editingTx, -1), walletEffect(entry)));
    } else {
      batch.set(doc(userCol('transactions')), { ...entry, createdAt: Date.now() });
      addWalletEffect(batch, walletEffect(entry));
    }
    await settle(batch.commit());
  };

  // Restaurar un movimiento borrado con el mismo id y volver a aplicar su efecto en los saldos
  const restoreTransaction = (tx) => {
    const batch = writeBatch(db);
    batch.set(userDoc('transactions', tx.id), stripId(tx));
    addWalletEffect(batch, walletEffect(tx));
    settle(batch.commit()).catch(() => {});
  };

  const handleDeleteTransaction = async (tx) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.delete(userDoc('transactions', tx.id));
    addWalletEffect(batch, walletEffect(tx, -1));
    showUndo(`Se borró "${tx.description || tx.category}"`, () => restoreTransaction(tx));
    await settle(batch.commit());
  };

  const handleEditTransaction = (tx) => {
    setEditingRule(null);
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  /* ---------- Recurrentes ---------- */

  const handleEditRule = (rule) => {
    setEditingTx(null);
    setEditingRule(rule);
    setIsTxModalOpen(true);
  };

  // Al reanudar, saltar las fechas que pasaron mientras estuvo en pausa
  const handleToggleRule = async (rule) => {
    if (!currentUser) return;
    if (rule.active) {
      await settle(updateDoc(ruleRef(rule.id), { active: false }));
      return;
    }
    const today = todayISO();
    let next = rule.nextDate;
    for (let i = 0; next && next < today && i < 1000; i++) {
      next = nextOccurrence(next, rule.frequency, rule.day);
    }
    await settle(updateDoc(ruleRef(rule.id), { active: true, nextDate: next }));
  };

  const handleDeleteRule = async (rule) => {
    if (!currentUser) return;
    showUndo(`Se borró el recurrente "${rule.description || rule.category}"`, () => {
      settle(setDoc(ruleRef(rule.id), stripId(rule))).catch(() => {});
    });
    await settle(deleteDoc(ruleRef(rule.id)));
  };

  /* ---------- Cuentas ---------- */

  const handleSaveAccount = async (data, balance) => {
    if (!currentUser) return;
    const editingId = accountModal.id;
    const id = editingId || `acc_${Date.now().toString(36)}`;
    const items = editingId
      ? accountsList.map((a) => (a.id === editingId ? { ...a, ...data } : a))
      : [...accountsList, { id, ...data }];

    const batch = writeBatch(db);
    batch.set(userDoc('settings', 'accounts'), { items });
    batch.set(walletRef(), { [id]: balance }, { merge: true });
    await settle(batch.commit());
  };

  const handleDeleteAccount = async (account) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.set(userDoc('settings', 'accounts'), { items: accountsList.filter((a) => a.id !== account.id) });
    batch.set(walletRef(), { [account.id]: deleteField() }, { merge: true });
    await settle(batch.commit());
  };

  /* ---------- Categorías ---------- */

  const openCategoryModal = (category = null, type = 'egreso', onCreated = null) =>
    setCategoryModal({ open: true, category, type, onCreated });

  const handleSaveCategory = async (data, original) => {
    if (!currentUser) return;
    const items = original
      ? customCats.map((c) => (c.name === original.name ? data : c))
      : [...customCats, data];

    // Si cambió el nombre, se actualiza donde ya se usaba (en lotes de hasta 450 escrituras)
    const writes = [(b) => b.set(userDoc('settings', 'categories'), { items })];
    if (original && original.name !== data.name) {
      allTx
        .filter((t) => t.category === original.name)
        .forEach((t) => writes.push((b) => b.update(userDoc('transactions', t.id), { category: data.name })));
      recurring
        .filter((r) => r.category === original.name)
        .forEach((r) => writes.push((b) => b.update(ruleRef(r.id), { category: data.name })));
      if (budgets[original.name]) {
        const limits = { ...budgets, [data.name]: budgets[original.name] };
        delete limits[original.name];
        writes.push((b) => b.set(userDoc('settings', 'budgets'), { limits }));
      }
    }

    const commits = [];
    for (let i = 0; i < writes.length; i += 450) {
      const batch = writeBatch(db);
      writes.slice(i, i + 450).forEach((w) => w(batch));
      commits.push(batch.commit());
    }
    await settle(Promise.all(commits));
  };

  const handleDeleteCategory = async (category) => {
    if (!currentUser) return;
    await settle(setDoc(userDoc('settings', 'categories'), { items: customCats.filter((c) => c.name !== category.name) }));
  };

  /* ---------- Presupuestos ---------- */

  const handleSaveBudget = async (category, amount) => {
    if (!currentUser) return;
    const next = { ...budgets };
    if (amount > 0) next[category] = amount;
    else delete next[category];
    await settle(setDoc(userDoc('settings', 'budgets'), { limits: next }));
  };

  const handleOpenBudgetModal = (category) => {
    setBudgetCategory(category);
    setIsBudgetModalOpen(true);
  };

  /* ---------- Metas ---------- */

  const handleSaveGoal = async (data, goal) => {
    if (!currentUser) return;
    if (goal) await settle(updateDoc(userDoc('savings', goal.id), data));
    else await settle(addDoc(userCol('savings'), data));
  };

  // Borrar una meta; returnTo (id de cuenta) regresa lo ahorrado a ese saldo
  const handleDeleteGoal = async (goal, returnTo) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.delete(userDoc('savings', goal.id));
    if (returnTo) addWalletEffect(batch, { [returnTo]: goal.saved || 0 });
    await settle(batch.commit());
  };

  // walletDelta mueve el dinero entre la meta y una cuenta
  const handleUpdateGoalAmount = async (id, newSaved, walletDelta) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(userDoc('savings', id), { saved: newSaved });
    if (walletDelta) addWalletEffect(batch, walletDelta);
    await settle(batch.commit());
  };

  const handleOpenDepositModal = (goal) => {
    setSelectedGoal(goal);
    setIsDepositModalOpen(true);
  };

  /* ---------- Deudas ---------- */

  // accountId: cuenta por la que pasó el dinero al pedir (entra) o hacer (sale) el préstamo
  const handleSaveDebt = async (data, debt, accountId) => {
    if (!currentUser) return;
    if (debt) {
      await settle(updateDoc(userDoc('debts', debt.id), data));
      return;
    }
    const batch = writeBatch(db);
    batch.set(doc(userCol('debts')), { ...data, paid: 0, createdAt: Date.now() });
    if (accountId) addWalletEffect(batch, { [accountId]: data.direction === 'owe' ? data.total : -data.total });
    await settle(batch.commit());
  };

  const handlePayDebt = async (debt, amount, accountId) => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    batch.update(userDoc('debts', debt.id), { paid: increment(amount) });
    if (accountId) addWalletEffect(batch, { [accountId]: debt.direction === 'owe' ? -amount : amount });
    await settle(batch.commit());
  };

  const handleDeleteDebt = async (debt) => {
    if (!currentUser) return;
    showUndo(`Se borró la deuda con ${debt.name}`, () => {
      settle(setDoc(userDoc('debts', debt.id), stripId(debt))).catch(() => {});
    });
    await settle(deleteDoc(userDoc('debts', debt.id)));
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
  const showMonth = !TABS_WITHOUT_MONTH.includes(activeTab);
  const activeLabel = TABS.find((t) => t.id === activeTab)?.label;
  const editingAccount = accountModal.id ? getAccount(accountModal.id) : null;

  return (
    <div className="min-h-screen pb-40 lg:pb-16 bg-[#f5f6fa] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      <Header
        onLogout={() => signOut(auth)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        displayName={displayName}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        amountsHidden={amountsHidden}
        onToggleAmounts={handleToggleAmounts}
        tabs={TABS}
        activeTab={activeTab}
        onChangeTab={goToTab}
      />

      <OfflineBanner online={online} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Encabezado de página con selector de mes */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'resumen' ? (displayName ? `${greeting}, ${displayName}` : greeting) : 'Finanzas'}
            </p>
            <h1 key={`title-${activeTab}`} className="tab-title-in text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
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

        <div
          key={activeTab}
          className={`${tabDirection === 'left' ? 'tab-enter-left' : 'tab-enter-right'} ${
            activeTab === 'resumen' || activeTab === 'presupuestos'
              ? 'space-y-5'
              : activeTab === 'movimientos'
              ? 'max-w-3xl space-y-4'
              : ''
          }`}
        >
        {/* Vista: Resumen */}
        {activeTab === 'resumen' && (
          <>
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
              <WalletsSection
                wallets={wallets}
                onEditAccount={(id) => setAccountModal({ open: true, id })}
                onNewAccount={() => setAccountModal({ open: true, id: null })}
                onTransfer={() => openNewTx('transferencia')}
                onPayCard={(id) => openNewTx('transferencia', id)}
              />
            </div>

            <BudgetAlerts budgets={budgets} monthTx={monthTx} onOpen={() => goToTab('presupuestos')} />

            <InsightsSection monthTx={monthTx} viewYear={viewYear} viewMonth={viewMonth} prevEgreso={prevEgreso} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <ChartsSection monthTx={monthTx} allTx={allTx} viewYear={viewYear} viewMonth={viewMonth} isDark={isDark} />
              </div>
              <div className="lg:col-span-2">
                <RecentTransactions
                  monthTx={monthTx}
                  onEdit={handleEditTransaction}
                  onSeeAll={() => goToTab('movimientos')}
                  onAdd={() => openNewTx()}
                />
              </div>
            </div>
          </>
        )}

        {/* Vista: Movimientos */}
        {activeTab === 'movimientos' && (
          <>
            <RecurringSection
              rules={recurring}
              onEdit={handleEditRule}
              onToggle={handleToggleRule}
              onDelete={handleDeleteRule}
            />
            <TransactionList
              monthTx={monthTx}
              allTx={allTx}
              viewYear={viewYear}
              viewMonth={viewMonth}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </>
        )}

        {/* Vista: Presupuestos y categorías */}
        {activeTab === 'presupuestos' && (
          <>
            <BudgetsSection budgets={budgets} monthTx={monthTx} onEditBudget={handleOpenBudgetModal} />
            <CategoriesSection onEdit={(c) => openCategoryModal(c, c.type)} onNew={() => openCategoryModal(null, 'egreso')} />
          </>
        )}

        {/* Vista: Metas de Ahorro */}
        {activeTab === 'ahorros' && (
          <SavingsSection
            savingsGoals={savingsGoals}
            onOpenNewGoalModal={() => setGoalModal({ open: true, goal: null })}
            onOpenDepositModal={handleOpenDepositModal}
            onEditGoal={(goal) => setGoalModal({ open: true, goal })}
            onDeleteGoal={handleDeleteGoal}
            isDark={isDark}
          />
        )}

        {/* Vista: Deudas y préstamos */}
        {activeTab === 'deudas' && (
          <DebtsSection
            debts={debts}
            onNew={() => setDebtModal({ open: true, debt: null })}
            onPay={(debt) => setPayingDebt(debt)}
            onEdit={(debt) => setDebtModal({ open: true, debt })}
            onDelete={handleDeleteDebt}
          />
        )}
        </div>
      </main>

      {/* Botón flotante de nuevo movimiento (en celular, arriba de la barra inferior) */}
      <button
        onClick={() => openNewTx()}
        type="button"
        className="fab-pos flex fixed w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 z-40 focus:outline-none focus:ring-4 focus:ring-indigo-400/40"
        aria-label="Registrar nuevo movimiento (tecla N)"
        title="Nuevo movimiento (Atajo: tecla 'N')"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      <BottomNav tabs={TABS} activeTab={activeTab} onChangeTab={goToTab} />

      <UndoToast
        toast={undoToast}
        onUndo={() => {
          undoToast?.undo();
          setUndoToast(null);
        }}
        onClose={() => setUndoToast(null)}
      />

      {/* Modales */}
      <TransactionModal
        isOpen={isTxModalOpen}
        editing={editingTx}
        editingRule={editingRule}
        initialType={txInitialType}
        initialTo={txInitialTo}
        onNewCategory={(type, onCreated) => openCategoryModal(null, type, onCreated)}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
          setEditingRule(null);
          setTxInitialTo(null);
        }}
        onSave={handleSaveTransaction}
        defaultYear={viewYear}
        defaultMonth={viewMonth}
      />

      <AccountModal
        isOpen={accountModal.open}
        account={editingAccount}
        balance={editingAccount ? wallets[editingAccount.id] || 0 : 0}
        canDelete={getAccounts().length > 1}
        onClose={() => setAccountModal({ open: false, id: null })}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        isDark={isDark}
      />

      <CategoryModal
        isOpen={categoryModal.open}
        category={categoryModal.category}
        initialType={categoryModal.type}
        onClose={(createdName) => {
          if (createdName && !categoryModal.category && categoryModal.onCreated) categoryModal.onCreated(createdName);
          setCategoryModal({ open: false, category: null, type: 'egreso', onCreated: null });
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        isDark={isDark}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        initialCategory={budgetCategory}
        budgets={budgets}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
      />

      <GoalModal
        isOpen={goalModal.open}
        goal={goalModal.goal}
        onClose={() => setGoalModal({ open: false, goal: null })}
        onSave={handleSaveGoal}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        currentName={displayName}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveName}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        goal={selectedGoal}
        wallets={wallets}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleUpdateGoalAmount}
      />

      <DebtModal
        isOpen={debtModal.open}
        debt={debtModal.debt}
        onClose={() => setDebtModal({ open: false, debt: null })}
        onSave={handleSaveDebt}
      />

      <DebtPaymentModal
        isOpen={!!payingDebt}
        debt={payingDebt}
        wallets={wallets}
        onClose={() => setPayingDebt(null)}
        onSave={handlePayDebt}
      />
    </div>
  );
}
