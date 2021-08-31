import "regenerator-runtime/runtime.js";
import { $, getJson } from 'donot';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/app.vue';
import createStore from './store.js';

async function createApp() {
    Vue.use(VueI18n);

    const userEl = $('meta[name="authenticated-user"]');
    const locales = await getJson('./locales.json');
    const ctx = window.__ctx__;
    const storeOptions = Object.assign(window.__ctx__, {
        locales : locales
    });
    const store = createStore(storeOptions);

    const i18n = new VueI18n({
        fallbackLocale: store.state.defaultLocale,
        locale : store.state.locale,
        messages : store.state.locales.messages,
        silentTranslationWarn : true
    });

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
            parseHash() {
                if (!!window.location.search) {
                    try {
                        const url = new window.URL(window.location);

                        this.$store.dispatch('query', {
                            type : url.searchParams.get('queryType'),
                            value : url.searchParams.get('queryValue')
                        });
                    } catch (e) {
                        console.error("Could not parse URL hash options");
                    }
                }
            }
        },

        mounted() {
            this.parseHash();
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