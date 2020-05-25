import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import createStore from './store.js';
import { getJson } from './util.js';

async function createApp() {
    Vue.use(VueI18n);

    const locales = await getJson('./js/locales.json');
    const store = createStore({
        locales
    });

    const i18n = new VueI18n({
        locale : store.state.locale,
        fallbackLocale: store.state.defaultLocale,
        messages : store.state.locales.messages
    });

    Vue.component('wm-button', WmButton);

    new Vue({
        el : "#app",

        components : { App },

        i18n : i18n,

        store : store
    });
}

function addTouchClasses() {
    const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
    document.querySelector('html').classList.add('has-' + inputDevice);
}

addTouchClasses();
createApp();