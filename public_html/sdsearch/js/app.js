import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import { getJson, getLocale } from './util.js';

async function createApp() {
    const locales = await getJson('./js/locales.json');

    Vue.use(VueI18n);

    const LOCALE = getLocale();

    const i18n = new VueI18n({
        locale : LOCALE,
        fallbackLocale: 'en',
        messages : locales.messages
    });

    Vue.component('wm-button', WmButton);

    new Vue({
        el : "#app",

        i18n : i18n,

        components : { App }
    });
}

function addTouchClasses() {
    const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
    document.querySelector('html').classList.add('has-' + inputDevice);
}

addTouchClasses();
createApp();