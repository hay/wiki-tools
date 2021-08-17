import { randInt, sample } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import {
    DEFAULT_LOCALE, MIN_BIRTH_YEAR, MAX_BIRTH_YEAR, THUMB_SIZE
} from './const.js';
import Api from './api.js';

Vue.use(Vuex);

export default function createStore() {
    const api = new Api(DEFAULT_LOCALE);

    function getInitialState() {
        return {
            birthYear : getRandomBirthYear(),
            candidates : [],
            currentCandidate : null,
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
            candidates(state, candidates) {
                state.candidates = candidates;
            },

            currentCandidate(state, candidate) {
                state.currentCandidate = candidate;
            },

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
            randomCandidate({ state, commit }) {
                commit('isLoading');
                const candidate = sample(state.candidates)
                commit('currentCandidate', candidate);
                commit('doneLoading');
            },

            async start({ commit, dispatch, state }) {
                commit('isLoading');
                const people = await api.getPeople(state.birthYear);
                commit('people', people);
                commit('randomPerson');
                const person = await api.getPerson(state.currentQid);
                commit('currentItem', person);
                const candidates = await api.getCandidates(state.currentQid, state.currentCategory);
                commit('candidates', candidates);
                dispatch('randomCandidate');
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}