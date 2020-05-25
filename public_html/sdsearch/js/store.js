import Vue from 'vue'
import Vuex from 'vuex'
import { DEFAULT_LOCALE } from './const.js';
import { getLocale } from './util.js';

Vue.use(Vuex);

export default function createStore(data) {
    function getInitialState() {
        return {
            defaultLocale : DEFAULT_LOCALE,
            initLocale : getLocale( DEFAULT_LOCALE ),
            locale : getLocale( DEFAULT_LOCALE ),
            locales : data.locales
        };
    }

    return new Vuex.Store({
        state : getInitialState(),

        mutations : {
            locale: (state, locale) => state.locale = locale
        }
    });
}