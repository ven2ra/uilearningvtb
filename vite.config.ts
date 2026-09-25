import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { passwordGate } from './password-gate';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'PREVIEW_');
  return {
    base: '/',
    plugins: [passwordGate(process.env.PREVIEW_PASSWORD || env.PREVIEW_PASSWORD || ''), react(), tailwindcss()],
    server: { host: '0.0.0.0', port: parseInt(process.env.PORT || '5173') },
  };
});
