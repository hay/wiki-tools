import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    build : {
        manifest : true,
        rollupOptions : {
            input : './js/app.js'
        }
    },
    plugins: [ vue() ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    }
});
