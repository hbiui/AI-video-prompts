import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

export default defineConfig(({ mode }) => {
  const isElectron = process.env.IS_ELECTRON === 'true' || process.env.ELECTRON === 'true';

  return {
    plugins: [
      react(), 
      tailwindcss(),
      ...(isElectron ? [
        electron({
          main: {
            entry: 'electron/main.ts',
          },
          preload: {
            input: path.join(__dirname, 'electron/preload.ts'),
          },
          renderer: {},
        })
      ] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
