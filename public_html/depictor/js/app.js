import "regenerator-runtime/runtime.js";
import { $, getJson } from 'donot';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import createStore from './store.js';
import { test } from './test.js';

async function createApp() {
    Vue.use(VueI18n);

    const userEl = $('meta[name="authenticated-user"]');
    const locales = await getJson('./locales.json');
    const ctx = window.__ctx__;

    if (ctx.isDebug) {
        console.log("In debug mode");
    }

    const storeOptions = Object.assign(window.__ctx__, {
        locales : locales
    });
    const store = createStore(storeOptions);

    const i18n = new VueI18n({
        fallbackLocale: store.state.defaultLocale,
        locale : store.state.locale,
        messages : store.state.locales.messages,
        silentTranslationWarn : !store.state.isDebug
    });

    Vue.component('wm-button', WmButton);

    Vue.config.errorHandler = function(err) {
        console.error(err);
    }

    new Vue({
        el : "#app",

        components : { App },

        computed : {
            screen() {
                return this.$store.state.screen;
            }
        },

        i18n : i18n,

        methods : {
            parseSearch() {
                const url = new window.URL(window.location);

                if (
                    url.searchParams.has("queryType") &&
                    url.searchParams.has("queryValue")
                ) {
                    this.$store.dispatch('query', {
                        type : url.searchParams.get('queryType'),
                        value : url.searchParams.get('queryValue')
                    });
                }

                if (url.searchParams.has("challenge")) {
                    const id = url.searchParams.get("challenge");
                    const action = url.searchParams.get("action");

                    this.$store.dispatch("challenge", { id, action });
                }

                // TODO: i think we could probably think of a more elegant
                // way to do testing
                if (url.searchParams.has("test")) {
                    test();
                }
            }
        },

        mounted() {
            this.parseSearch();
        },

        store : store,

        watch : {
            screen(screen) {
                if (screen === 'game') {
                    $("#wrapper").setAttribute('is-fullscreen', '');
                } else {
                    $("#wrapper").removeAttribute('is-fullscreen');
                }
            }
        }
    });
}

function addTouchClasses() {
    const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
    $('html').classList.add('has-' + inputDevice);
}

addTouchClasses();
createApp();