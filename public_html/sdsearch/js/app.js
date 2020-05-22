import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import locales from './locales.json';
import { getLocale } from './util.js';

Vue.use(VueI18n);

const $ = document.querySelector.bind(document);

const i18n = new VueI18n({
    locale : getLocale(),
    fallbackLocale: 'en',
    messages : locales
});

Vue.component('wm-button', WmButton);

new Vue({
    el : "#app",

    i18n : i18n,

    components : { App }
});

function addTouchClasses() {
    const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
    $('html').classList.add('has-' + inputDevice);
}

function addTitleDescription() {
    $("#app-title").innerHTML = i18n.t('structured_search');
    $("#app-lead").innerHTML = i18n.t('tool_description');
}

addTitleDescription();
addTouchClasses();