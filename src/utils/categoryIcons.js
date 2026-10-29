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
  ShoppingBag,
  GraduationCap,
  Repeat,
  ArrowLeftRight,
} from 'lucide-react';

const ICONS = {
  Comida: Utensils,
  Transporte: Car,
  Vivienda: Home,
  Servicios: Zap,
  Salud: HeartPulse,
  Entretenimiento: Film,
  Compras: ShoppingBag,
  Educación: GraduationCap,
  Suscripciones: Repeat,
  Salario: Briefcase,
  Freelance: Laptop,
  Inversión: TrendingUp,
  Regalo: Gift,
  Transferencia: ArrowLeftRight,
};

export function getCategoryIcon(catName) {
  return ICONS[catName] || CircleDollarSign;
}
