import { randInt, sample } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import {
    DEFAULT_LOCALE, MIN_BIRTH_YEAR, MAX_BIRTH_YEAR, THUMB_SIZE
} from './const.js';
import { getPeople, getPerson } from './api.js';

Vue.use(Vuex);

export default function createStore() {
    function getInitialState() {
        return {
            birthYear : getRandomBirthYear(),
            currentCategory : null,
            currentItem : null,
            currentQid : null,
            currentRefImage : null,
            loading : false,
            locale : DEFAULT_LOCALE,
            people : [],
            screen : 'intro'
        };
    }

    function getRandomBirthYear() {
        return randInt(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
    }

    return new Vuex.Store({
        state : getInitialState(),

        mutations : {
            currentItem(state, item) {
                state.currentItem = item;
            },

            currentQid(state, qid) {
                state.currentQid = qid;
            },

            doneLoading(state) {
                state.loading = false;
            },

            isLoading(state) {
                state.loading = true;
            },

            people(state, people) {
                state.people = people;
            },

            randomPerson(state) {
                // TODO: this should be an action, not a mutation
                const person = sample(state.people);
                state.currentQid = person.qid;
                state.currentCategory = person.category;
                state.currentRefImage = `${person.image}?width=${THUMB_SIZE}`;
            },

            screen(state, screen) {
                state.screen = screen;
            }
        },

        actions : {
            async start({ commit, state }) {
                commit('isLoading');
                const people = await getPeople(state.birthYear);
                commit('people', people);
                commit('randomPerson');
                const person = await getPerson(state.currentQid);
                commit('currentItem', person);
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}