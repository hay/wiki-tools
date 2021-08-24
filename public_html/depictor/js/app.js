import "regenerator-runtime/runtime.js";
import { $ } from 'donot';
import Vue from 'vue';
import App from './components/app.vue';
import createStore from './store.js';

async function createApp() {
    const userEl = $('meta[name="authenticated-user"]');
    const store = createStore({
        authenticatedUser : userEl ? userEl.getAttribute('content') : null
    });

    new Vue({
        el : "#app",

        components : { App },

        computed : {
            screen() {
                return this.$store.state.screen;
            }
        },

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