import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, Loader2, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { traducirError } from '../utils/formatters';
import Swal from 'sweetalert2';
import Logo from './Logo';

// El registro de cuentas nuevas está apagado: es una app personal.
// Para permitirlo, define VITE_ALLOW_SIGNUP=true en las variables de entorno.
const ALLOW_SIGNUP = import.meta.env.VITE_ALLOW_SIGNUP === 'true';

export default function AuthScreen({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Swal.fire({
        icon: 'info',
        text: 'Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".',
        confirmButtonColor: '#6366f1'
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err) {
      // No revelamos si el correo existe o no
    }
    Swal.fire({
      icon: 'success',
      title: 'Revisa tu correo',
      text: 'Si existe una cuenta con ese correo, te enviamos un enlace para cambiar tu contraseña.',
      confirmButtonColor: '#6366f1'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, escribe tu correo y contraseña.',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    setLoading(true);
    try {
      // Reiniciar el contador de inactividad antes de entrar
      try {
        localStorage.setItem('lastActivity', String(Date.now()));
      } catch {
        /* sin almacenamiento local */
      }
      if (isRegisterMode && ALLOW_SIGNUP) {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Bienvenido a Finanzas',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de acceso',
        text: traducirError(err.code),
        confirmButtonColor: '#f43f5e'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#f5f6fa] dark:bg-[#0b0f19] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">
      {/* Botón de alternar tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Modo oscuro</span>
            </>
          )}
        </button>
      </div>

      {/* Luces difusas de fondo */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl dark:shadow-black/40 transition-colors duration-200">
          
          <div className="text-center mb-8">
            <Logo className="w-14 h-14 mx-auto mb-4 drop-shadow-[0_10px_24px_rgba(99,102,241,0.45)]" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Finanzas</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tu dinero, claro y bajo control.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-600 dark:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 dark:shadow-indigo-600/30 transition-all duration-200 hover:shadow-indigo-600/40 active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isRegisterMode ? 'Crear cuenta' : 'Entrar'}</span>
            </button>

            <div className="pt-2 flex flex-col items-center gap-2">
              {!isRegisterMode && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              {ALLOW_SIGNUP && (
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors focus:outline-none"
                >
                  {isRegisterMode ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Créala aquí'}
                </button>
              )}
            </div>
          </form>

        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Datos sincronizados de forma segura con Firebase</span>
        </p>
      </div>
    </div>
  );
}
