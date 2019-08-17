import Vue from 'vue';
import { getLocation, getIframeSrc } from './api.js';

new Vue({
    el : "#app",

    data : {
        iframeSrc : null,
        loading : false
    },

    methods : {
        async go() {
            this.loading = true;

            const location = await getLocation();

            this.iframeSrc = getIframeSrc({
                location
            });
        }
    }
});