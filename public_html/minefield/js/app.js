if (import.meta.env.MODE !== 'development') {
    import('vite/modulepreload-polyfill');
}
import '../scss/style.scss';
import { createApp } from 'vue';
import ScreenApp from './screen-app.vue';

createApp({
    components : { ScreenApp }
}).mount("#app");