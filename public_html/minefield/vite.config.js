import vue from '@vitejs/plugin-vue';

export default {
    build : {
        manifest : true,
        rollupOptions : {
            input : './js/main.js'
        }
    },
    plugins: [ vue() ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    }
}