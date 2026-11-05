import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Firebase con datos sin conexión pesa ~550 kB (130 kB comprimido); se carga una vez y queda en caché
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separar librerías grandes para que el navegador las guarde en caché aparte
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          charts: ['chart.js', 'react-chartjs-2'],
          vendor: ['react', 'react-dom', 'sweetalert2', 'lucide-react'],
        },
      },
    },
  },
});
