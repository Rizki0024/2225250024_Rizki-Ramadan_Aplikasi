import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  // Three.js (±1 MB) dimuat lazy hanya saat gambar 3D dibuka, jadi batas peringatan dinaikkan.
  build: { chunkSizeWarningLimit: 1300 },
  test: { environment: 'node' },
});
