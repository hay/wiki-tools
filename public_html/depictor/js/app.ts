import '../scss/style.scss';
import { $ } from 'donot';
import { getJson } from './util';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Vuex from 'vuex';
import App from './components/app.vue';
import WmButton from './components/wm-button.vue';
import createStore from './store';
import { test } from './test';

async function createApp() {
    Vue.use(Vuex);
    Vue.use(VueI18n);

    const locales = await getJson('./locales.json') as { messages?: Record<string, Record<string, string>> };
    const ctx = window.__ctx__;

    if (ctx?.isDebug) {
        console.log("In debug mode");
    }

    const storeOptions = Object.assign({}, window.__ctx__, {
        locales : locales
    });
    const store = createStore(storeOptions);

    const i18n = new VueI18n({
        fallbackLocale: store.state.defaultLocale,
        locale : store.state.locale,
        messages : store.state.locales?.messages ?? {},
        silentTranslationWarn : !store.state.isDebug
    });

    Vue.component('wm-button', WmButton);

    Vue.config.errorHandler = function(err: Error) {
        console.error(err);
    };

    new Vue({
        el : "#app",

        components : { App },

        computed : {
            screen() {
                return (this as unknown as { $store: typeof store }).$store.state.screen;
            }
        },

        i18n : i18n,

        methods : {
            parseSearch() {
                const url = new window.URL(window.location.href);
                const $store = (this as unknown as { $store: typeof store }).$store;

                if (
                    url.searchParams.has("queryType") &&
                    url.searchParams.has("queryValue")
                ) {
                    $store.dispatch('query', {
                        type : url.searchParams.get('queryType')!,
                        value : url.searchParams.get('queryValue')!
                    });
                }

                if (url.searchParams.has("challenge")) {
                    const id = url.searchParams.get("challenge")!;
                    const action = url.searchParams.get("action")!;

                    $store.dispatch("challenge", { id, action });
                }

                if (url.searchParams.has("test")) {
                    test();
                }
            }
        },

        mounted() {
            this.parseSearch();
        },

        store,

        watch : {
            screen(screen: string) {
                const wrapper = $("#wrapper");
                if (wrapper) {
                    if (screen === 'game') {
                        wrapper.setAttribute('is-fullscreen', '');
                    } else {
                        wrapper.removeAttribute('is-fullscreen');
                    }
                }
            }
        }
    } as any);
}

function addTouchClasses() {
    const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
    const html = $('html');
    if (html) {
        html.classList.add('has-' + inputDevice);
    }
}

addTouchClasses();
createApp();