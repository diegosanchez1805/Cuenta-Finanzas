import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner({ online }) {
  if (online) return null;
  return (
    <div className="sticky top-16 z-20 flex justify-center px-4 pt-2 pointer-events-none" role="status">
      <div className="tab-title-in flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 shadow-sm">
        <WifiOff className="w-3.5 h-3.5" />
        Sin conexión · tus cambios se guardarán al reconectar
      </div>
    </div>
  );
}
