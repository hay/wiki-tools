import Vue from 'vue';
import { getLanguage, getLocation, getIframeSrc } from './api.js';

new Vue({
    el : "#app",

    data : {
        iframeSrc : null,
        language : getLanguage(),
        loading : false,
        radius : 1
    },

    methods : {
        async go() {
            this.loading = true;

            const location = await getLocation();

            this.iframeSrc = getIframeSrc({
                location,
                language : this.language,
                radius : parseFloat(this.radius)
            });
        }
    }
});