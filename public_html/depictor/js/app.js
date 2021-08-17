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