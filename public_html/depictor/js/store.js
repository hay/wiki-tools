import { randInt, sample } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import {
    DEFAULT_LOCALE, MIN_BIRTH_YEAR, MAX_BIRTH_YEAR, THUMB_SIZE, MAX_API_TRIES
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
            currentPerson : null,
            currentPersonImage : null,
            loading : false,
            locale : DEFAULT_LOCALE,
            people : [],
            processedCandidates : [],
            processedPeople : [],
            screen : 'intro'
        };
    }

    function getRandomBirthYear() {
        return randInt(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR);
    }

    return new Vuex.Store({
        state : getInitialState(),

        getters : {
            hasRemainingCandidates(state, getters) {
                return !!getters.remainingCandidates.length;
            },

            remainingCandidates(state) {
                // Get all candidates that have not been done yet
                return state.candidates.filter((candidate) => {
                    return !state.processedCandidates.includes(candidate.mid);
                });
            },

            remainingPeople(state) {
                return state.people.filter((person) => {
                    return !state.processedPeople.includes(person.qid);
                });
            }
        },

        mutations : {
            candidates(state, candidates) {
                state.candidates = candidates;
            },

            currentCandidate(state, candidate) {
                state.currentCandidate = candidate;
            },

            currentPerson(state, person) {
                state.currentPerson = person;
            },

            currentPersonImage(state, image) {
                state.currentPersonImage = `${image}?width=${THUMB_SIZE}`;
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

            processCandidate(state) {
                state.processedCandidates.push(state.currentCandidate.mid);
            },

            processPerson(state) {
                state.processedPeople.push(state.currentPerson.qid);
            },

            refreshProcessedCandidates(state) {
                state.processedCandidates = [];
            },

            screen(state, screen) {
                state.screen = screen;
            }
        },

        actions : {
            acceptCandidate({ commit, dispatch }) {
                commit('processCandidate');
                // TODO: write this to a database
                dispatch('nextCandidate');
            },

            async nextCandidate({ commit, getters, dispatch }) {
                // First check if there are remaining candidates, and if so,
                // pick one of those
                if (getters.hasRemainingCandidates) {
                    console.log("Getting a new candidate");
                    const candidate = sample(getters.remainingCandidates);
                    commit('currentCandidate', candidate);
                } else {
                    console.log('No more candidates, getting new person');
                    await dispatch("nextPerson");
                }
            },

            async nextPerson({ commit, getters }) {
                // Refresh the array of processed candidates
                commit('refreshProcessedCandidates');

                // Do this a couple of times to prevent errors
                for (let i = 0; i < MAX_API_TRIES; i++) {
                    console.log(`Trying to get candidates, try: ${i}`);
                    const nextPerson = sample(getters.remainingPeople);

                    let person;
                    try {
                        person = await api.getPerson(nextPerson.qid);
                    } catch (e) {
                        console.error(e);
                        continue;
                    }

                    commit('currentPerson', person);
                    commit('processPerson');

                    // Note how we need to do this seperately because it is from
                    // the SPARQL query, not from the lookup on Wikidata
                    commit('currentPersonImage', nextPerson.image);

                    // Now get candidates
                    let candidates;
                    try {
                        candidates = await api.getCandidates(nextPerson.qid, nextPerson.category);
                    } catch (e) {
                        console.error(e);
                        continue;
                    }

                    commit('candidates', candidates);

                    // All went well, let's get out of the loop
                    console.log('Okay, i think that went well');
                    break;
                }
            },

            rejectCandidate({ commit, dispatch }) {
                commit('processCandidate');
                // TODO: write this to a database
                dispatch('nextCandidate');
            },

            skipCandidate({ commit, dispatch }) {
                commit('processCandidate');
                // TODO: DO NOT write this to a database
                dispatch('nextCandidate');
            },

            async start({ commit, dispatch, state }) {
                commit('isLoading');
                const people = await api.getPeople(state.birthYear);
                commit('people', people);
                await dispatch("nextPerson");
                dispatch('nextCandidate');
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}