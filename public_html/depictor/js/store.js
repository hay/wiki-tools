import { randInt, sample } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import {
    POSSIBLE_CANDIDATE_STATES, CANDIDATE_SKIP,
    DEFAULT_LOCALE, THUMB_SIZE, MAX_API_TRIES
} from './const.js';
import Api from './api.js';

Vue.use(Vuex);

export default function createStore() {
    const api = new Api(DEFAULT_LOCALE);

    function getInitialState() {
        return {
            birthYear : null,
            candidate : null,
            candidates : [],
            category : null,
            loading : false,
            locale : DEFAULT_LOCALE,
            people : [],
            person : null,
            screen : 'intro'
        };
    }

    return new Vuex.Store({
        state : getInitialState(),

        getters : {
            hasRemainingCandidates(state, getters) {
                return getters.remainingCandidates.length > 0;
            },

            remainingCandidates(state) {
                return state.candidates.filter(c => !c.done);
            },

            remainingPeople(state) {
                return state.people.filter(p => !p.done);
            }
        },

        mutations : {
            birthYear(state, birthYear) {
                state.birthYear = birthYear;
            },

            candidate(state, candidate) {
                state.candidate = candidate;
            },

            candidates(state, candidates) {
                state.candidates = candidates.map((candidate) => {
                    // Add resized thumbnail here
                    candidate.done = false;
                    return candidate;
                });
            },

            category(state, category) {
                state.category = category;
            },

            doneLoading(state) {
                state.loading = false;
            },

            hash(state, opts) {
                // Transform opts to a URL and set the hash, after that
                // a hashchange will trigger start
                // Probably could be done more elegantly, but at least
                // in this way we can easily expand and prevent errors
                window.location.hash = window.encodeURIComponent(JSON.stringify(opts));
            },

            isLoading(state) {
                state.loading = true;
            },

            people(state, people) {
                state.people = people.map((person) => {
                    person.thumb = `${person.image}?width=${THUMB_SIZE}`;
                    person.done = false;
                    return person;
                });
            },

            person(state, person) {
                state.person = person;
            },

            processCandidate(state) {
                state.candidates = state.candidates.map((candidate) => {
                    if (candidate.mid === state.candidate.mid) {
                        candidate.done = true;
                    }

                    return candidate;
                });
            },

            screen(state, screen) {
                state.screen = screen;
            }
        },

        actions : {
            async handleCandidate({ commit, dispatch, state }, status) {
                if (
                    !POSSIBLE_CANDIDATE_STATES.includes(status)
                ) {
                    throw new Error("Invalid candidate status: " + status);
                }

                if (status !== CANDIDATE_SKIP) {
                    await api.addDbItem({
                        action : 'choice',
                        type : 'item',
                        itemid : state.candidate.mid,
                        status : status
                    });
                }

                commit('processCandidate');

                await dispatch('nextCandidate');
            },

            async nextCandidate({ commit, getters, dispatch }) {
                // First check if there are remaining candidates, and if so,
                // pick one of those, otherwise pick a new person
                if (getters.hasRemainingCandidates) {
                    console.log("Getting a new candidate");
                    const candidate = sample(getters.remainingCandidates);
                    commit('candidate', candidate);
                } else {
                    console.log('No more candidates, getting new person');
                    await dispatch("nextPerson");
                }
            },

            async nextPerson({ commit, getters, dispatch }) {
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

                    person.thumb = nextPerson.thumb;
                    commit('person', person);

                    // Now get candidates
                    let candidates;
                    try {
                        candidates = await api.getCandidates(
                            nextPerson.qid, nextPerson.category
                        );
                    } catch (e) {
                        console.error(e);
                        continue;
                    }

                    commit('candidates', candidates);
                    commit('category', nextPerson.category);

                    // All went well, let's get out of the loop
                    console.log('Okay, i think that went well');
                    break;
                }

                await dispatch("nextCandidate");
            },

            query({ commit, dispatch }, query) {
                // TOOD: Expand with the other query options
                if (query.year) {
                    commit('birthYear', query.year)
                } else {
                    console.error('No valid query options');
                    return;
                }

                dispatch('start');
            },

            async start({ commit, dispatch, state }) {
                commit('isLoading');
                const people = await api.getPeople(state.birthYear);
                commit('people', people);
                await dispatch("nextPerson");
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}