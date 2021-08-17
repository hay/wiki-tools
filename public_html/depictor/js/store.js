import { randInt } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import { MIN_BIRTH_YEAR, MAX_BIRTH_YEAR } from './const.js';

Vue.use(Vuex);

export default function createStore() {
    function getInitialState() {
        return {
            birthYear : getRandomBirthYear(),
            currentQid : null,
            loading : false,
            screen : 'intro'
        };
    }

    function getRandomBirthYear() {
        return randInt(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
    }

    return new Vuex.Store({
        state : getInitialState(),

        mutations : {            
            currentQid(state, qid) {
                state.currentQid = qid;
            },

            doneLoading(state) {
                state.loading = false;
            },

            isLoading(state) {
                state.loading = true;
            },

            screen(state, screen) {
                state.screen = screen;
            }
        },

        actions : {
            async start({ commit }) {
                commit('isLoading');
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}