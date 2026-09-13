import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Electron file:// 프로토콜 호환성 필수
  server: {
    port: 5173,
    strictPort: true,
  },
});
