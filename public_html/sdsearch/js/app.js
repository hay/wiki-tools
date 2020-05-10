import Vue from 'vue';
import App from './components/app.vue';

new Vue({
    el : "#app",

    components : { App }
});

const inputDevice = 'ontouchend' in window ? 'touch' : 'mouse';
document.querySelector('html').classList.add('has-' + inputDevice);