export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const MESES_CORTO = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const CATS_INGRESO = ["Salario", "Freelance", "Inversión", "Regalo", "Otro"];
export const CATS_EGRESO = ["Comida", "Transporte", "Vivienda", "Servicios", "Salud", "Entretenimiento", "Compras", "Educación", "Suscripciones", "Otro"];

export const CATEGORY_PALETTE = {
  "Comida": { color: "#f59e0b", icon: "Utensils", bg: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/25" },
  "Transporte": { color: "#38bdf8", icon: "Car", bg: "bg-blue-50 dark:bg-sky-500/15 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-sky-500/25" },
  "Vivienda": { color: "#a855f7", icon: "Home", bg: "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/25" },
  "Servicios": { color: "#eab308", icon: "Zap", bg: "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/25" },
  "Salud": { color: "#f43f5e", icon: "HeartPulse", bg: "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/25" },
  "Entretenimiento": { color: "#ec4899", icon: "Film", bg: "bg-pink-50 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/25" },
  "Compras": { color: "#fb923c", icon: "ShoppingBag", bg: "bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/25" },
  "Educación": { color: "#0ea5e9", icon: "GraduationCap", bg: "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/25" },
  "Suscripciones": { color: "#6366f1", icon: "Repeat", bg: "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25" },
  "Salario": { color: "#10b981", icon: "Briefcase", bg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25" },
  "Freelance": { color: "#14b8a6", icon: "Laptop", bg: "bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/25" },
  "Inversión": { color: "#818cf8", icon: "TrendingUp", bg: "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/25" },
  "Regalo": { color: "#c084fc", icon: "Gift", bg: "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/25" },
  "Otro": { color: "#94a3b8", icon: "CircleDollarSign", bg: "bg-slate-50 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/25" }
};

export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

// Fecha local (no UTC) para que de noche no se registre con el día siguiente
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKeyOf = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

export const sumBy = (txs, type) =>
  txs.filter((t) => t.type === type).reduce((s, t) => s + (t.amount || 0), 0);

export const txOfMonth = (allTx, y, m) => {
  const key = monthKeyOf(y, m);
  return allTx.filter((t) => t.date && t.date.slice(0, 7) === key);
};

export const prevMonthOf = (y, m) => (m === 0 ? [y - 1, 11] : [y, m - 1]);

// Variación porcentual; null cuando no hay base de comparación
export const pctChange = (current, previous) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// "Hoy", "Ayer" o "Lunes 14 de octubre"
export function dayLabel(iso) {
  if (!iso) return "";
  const today = todayISO();
  const [y, m, d] = iso.split("-").map(Number);
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestISO = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  if (iso === today) return "Hoy";
  if (iso === yestISO) return "Ayer";
  const dow = DIAS[new Date(y, m - 1, d).getDay()];
  return `${dow} ${d} de ${MESES[m - 1].toLowerCase()}`;
}

export function traducirError(code) {
  const map = {
    "auth/invalid-email": "Ese correo no es válido.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/email-already-in-use": "Ya existe una cuenta con ese correo.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
  };
  return map[code] || "Ocurrió un error. Intenta de nuevo.";
}
