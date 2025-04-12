import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'routes.js': path.resolve(__dirname, './src/routes.jsx'),
      'assets': path.resolve(__dirname, './src/assets'),
      'pages': path.resolve(__dirname, './src/pages'),
      'utils': path.resolve(__dirname, './src/utils'),
      'views': path.resolve(__dirname, './src/pages/AdminPage/views'),
      'variables': path.resolve(__dirname, './src/pages/AdminPage/variables'),
      'context': path.resolve(__dirname, './src/context')

    }
  }
});