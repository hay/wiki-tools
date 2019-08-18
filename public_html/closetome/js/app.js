import Vue from 'vue';
import LanguageSelector from '../components/language-selector.vue';
import { getLanguage, getLocation, getIframeSrc } from './api.js';

new Vue({
    el : "#app",

    components : {
        LanguageSelector
    },

    data : {
        iframeSrc : null,
        language : getLanguage(),
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