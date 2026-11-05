// Registro de cuentas y categorías personalizadas del usuario.
// App los actualiza en cada render (igual que el modo privado), así cualquier
// componente puede consultarlos sin pasar props por toda la app.
import {
  CreditCard,
  Banknote,
  Landmark,
  PawPrint,
  Dumbbell,
  Fuel,
  Shirt,
  Baby,
  Plane,
  Coffee,
  Gamepad2,
  Music,
  Smartphone,
  Wrench,
  Beer,
  BookOpen,
  Scissors,
  Bus,
  Pizza,
  Tag,
  Sparkles,
  PiggyBank,
} from 'lucide-react';
import { CATS_EGRESO, CATS_INGRESO, CATEGORY_PALETTE } from './formatters';
import { getCategoryIcon } from './categoryIcons';

/* ---------------- Cuentas ---------------- */

// Las cuentas originales conservan sus ids ('card' y 'cash') para no tocar datos existentes
export const DEFAULT_ACCOUNTS = [
  { id: 'card', name: 'Tarjeta', type: 'debit', color: '#6366f1' },
  { id: 'cash', name: 'Efectivo', type: 'cash', color: '#10b981' },
];

export const ACCOUNT_TYPES = {
  debit: { label: 'Débito', icon: Landmark },
  credit: { label: 'Crédito', icon: CreditCard },
  cash: { label: 'Efectivo', icon: Banknote },
};

export const ACCOUNT_COLORS = ['#6366f1', '#10b981', '#0ea5e9', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

let accounts = DEFAULT_ACCOUNTS;
export const setAccounts = (list) => {
  accounts = list && list.length ? list : DEFAULT_ACCOUNTS;
};
export const getAccounts = () => accounts;
export const getAccount = (id) => accounts.find((a) => a.id === id);
export const accountLabel = (id) => getAccount(id)?.name || 'Cuenta eliminada';
export const accountIcon = (id) => {
  const acc = getAccount(id);
  if (!acc) return CreditCard;
  // La cuenta "Tarjeta" original se sigue viendo como tarjeta
  if (acc.id === 'card') return CreditCard;
  return ACCOUNT_TYPES[acc.type]?.icon || CreditCard;
};
// Cuentas con dinero propio (las de crédito guardan deuda, no dinero disponible)
export const moneyAccounts = () => accounts.filter((a) => a.type !== 'credit');

// Próxima fecha (ISO) en que cae el día `day` del mes, a partir de hoy
export function nextDayOfMonth(day) {
  if (!day) return null;
  const now = new Date();
  const build = (y, m) => {
    const last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(day, last));
  };
  let d = build(now.getFullYear(), now.getMonth());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d < today) d = build(now.getFullYear(), now.getMonth() + 1);
  const daysLeft = Math.round((d - today) / 86400000);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { iso, daysLeft };
}

/* ---------------- Categorías ---------------- */

export const CUSTOM_ICONS = {
  Tag,
  PawPrint,
  Dumbbell,
  Fuel,
  Shirt,
  Baby,
  Plane,
  Coffee,
  Gamepad2,
  Music,
  Smartphone,
  Wrench,
  Beer,
  BookOpen,
  Scissors,
  Bus,
  Pizza,
  Sparkles,
  PiggyBank,
};

export const CATEGORY_COLORS = ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1', '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#64748b'];

let customCategories = [];
export const setCustomCategories = (list) => {
  customCategories = list || [];
};
export const getCustomCategories = () => customCategories;

// Categorías de un tipo: las de la app, las tuyas y "Otro" al final
export function getCategories(type) {
  const base = (type === 'ingreso' ? CATS_INGRESO : CATS_EGRESO).filter((c) => c !== 'Otro');
  const mine = customCategories.filter((c) => c.type === type).map((c) => c.name);
  return [...base, ...mine, 'Otro'];
}

export const isBuiltInCategory = (name) =>
  CATS_EGRESO.includes(name) || CATS_INGRESO.includes(name) || name === 'Transferencia';

// Color, clases y estilo para pintar una categoría (de la app o tuya)
export function getCategoryMeta(name) {
  const builtIn = CATEGORY_PALETTE[name];
  if (builtIn) return { color: builtIn.color, bg: builtIn.bg, style: undefined, Icon: getCategoryIcon(name) };

  const mine = customCategories.find((c) => c.name === name);
  if (mine) {
    const c = mine.color || '#64748b';
    return {
      color: c,
      bg: '',
      style: { backgroundColor: `${c}24`, color: c, borderColor: `${c}55` },
      Icon: CUSTOM_ICONS[mine.icon] || Tag,
    };
  }

  const other = CATEGORY_PALETTE['Otro'];
  return { color: other.color, bg: other.bg, style: undefined, Icon: getCategoryIcon('Otro') };
}
