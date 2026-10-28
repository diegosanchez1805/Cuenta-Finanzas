import React from 'react';

// Marca de Finanzas: barras ascendentes dentro de un cuadro redondeado
export default function Logo({ className = 'w-9 h-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="finanzas-logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#finanzas-logo-bg)" />
      <rect x="10" y="21" width="5" height="9" rx="2" fill="#fff" fillOpacity="0.55" />
      <rect x="17.5" y="15" width="5" height="15" rx="2" fill="#fff" fillOpacity="0.8" />
      <rect x="25" y="9" width="5" height="21" rx="2" fill="#fff" />
    </svg>
  );
}
