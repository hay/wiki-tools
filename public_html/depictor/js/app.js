import "regenerator-runtime/runtime.js";
import { $ } from 'donot';
import Vue from 'vue';
import App from './components/app.vue';
import createStore from './store.js';

async function createApp() {
    const store = createStore();

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
                const hash = window.location.hash.slice(1);

                if (!!hash) {
                    try {
                        const query = JSON.parse(window.decodeURIComponent(hash));
                        this.$store.dispatch('query', query);
                    } catch (e) {
                        console.error("Could not parse URL hash options");
                    }
                }
            }
        },

        mounted() {
            window.addEventListener('hashchange', this.parseHash.bind(this));
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