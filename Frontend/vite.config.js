import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
  // The React and Tailwind plugins are both required for Make, even if
  // Tailwind is not being actively used – do not remove them
  react(),
  tailwindcss()],

  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src')
    }
  },

  // File types to support raw imports. Never add .css, .jsx, or .js files to this.
  assetsInclude: ['**/*.svg', '**/*.csv']
});