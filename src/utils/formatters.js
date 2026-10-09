export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const MESES_CORTO = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export const CATS_INGRESO = ["Salario", "Freelance", "Inversión", "Regalo", "Otro"];
export const CATS_EGRESO = ["Comida", "Transporte", "Vivienda", "Servicios", "Salud", "Entretenimiento", "Otro"];

export const CATEGORY_PALETTE = {
  "Comida": { color: "#f59e0b", icon: "Utensils", bg: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  "Transporte": { color: "#38bdf8", icon: "Car", bg: "bg-sky-500/15 text-sky-400 border-sky-500/25" },
  "Vivienda": { color: "#a855f7", icon: "Home", bg: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  "Servicios": { color: "#eab308", icon: "Zap", bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  "Salud": { color: "#f43f5e", icon: "HeartPulse", bg: "bg-rose-500/15 text-rose-400 border-rose-500/25" },
  "Entretenimiento": { color: "#ec4899", icon: "Film", bg: "bg-pink-500/15 text-pink-400 border-pink-500/25" },
  "Salario": { color: "#10b981", icon: "Briefcase", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  "Freelance": { color: "#14b8a6", icon: "Laptop", bg: "bg-teal-500/15 text-teal-400 border-teal-500/25" },
  "Inversión": { color: "#818cf8", icon: "TrendingUp", bg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25" },
  "Regalo": { color: "#c084fc", icon: "Gift", bg: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
  "Otro": { color: "#94a3b8", icon: "CircleDollarSign", bg: "bg-slate-500/15 text-slate-400 border-slate-500/25" }
};

export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const monthKeyOf = (y, m) => `${y}-${String(m + 1).padStart(2, "0")}`;

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
