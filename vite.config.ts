import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://emporium-dashboard.vercel.app', // Tu servidor real
        changeOrigin: true,
        secure: false,
      },
    },
  },
});