import "regenerator-runtime/runtime.js";
import { $ } from 'donot';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import createStore from './store.js';
import { getJson } from './util.js';

async function createApp() {
    Vue.use(VueI18n);

    const locales = await getJson('./locales.json');
    const store = createStore({
        locales
    });

    const i18n = new VueI18n({
        fallbackLocale: store.state.defaultLocale,
        locale : store.state.locale,
        messages : store.state.locales.messages,
        silentTranslationWarn : true
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
    $('html').classList.add('has-' + inputDevice);
}

addTouchClasses();
createApp();