import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  build: {
    rolldownOptions: {
      input: 'js/app.ts',
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        ...(mode === 'production' && {
          minify: {
            compress: {
              dropConsole: true,
              dropDebugger: true,
            },
          },
        }),
      },
    },
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'oxc' : false,
  },
}));
