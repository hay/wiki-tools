import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js',
    },
  },
  build: {
    rollupOptions: {
      input: 'js/app.js',
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'terser' : false,
    terserOptions:
      mode === 'production'
        ? { compress: { drop_console: true, drop_debugger: true } }
        : undefined,
  },
}));
