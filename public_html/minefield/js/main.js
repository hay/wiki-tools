if (import.meta.env.MODE !== 'development') {
    import('vite/modulepreload-polyfill');
}
import '../scss/style.scss';
import { createApp } from 'vue';
import App from './app.vue';

createApp(App).mount("#app");