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
            item : null,
            items : [],
            loading : false,
            locale : DEFAULT_LOCALE,
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

            remainingItems(state) {
                return state.items.filter(item => !item.done);
            }
        },

        mutations : {
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
                const queryType = window.encodeURIComponent(opts.type);
                const queryValue = window.encodeURIComponent(opts[opts.type]);
                const search = `queryType=${queryType}&queryValue=${queryValue}`;
                window.location.search = search;
            },

            isLoading(state) {
                state.loading = true;
            },

            item(state, item) {
                state.item = item;
            },

            items(state, items) {
                if (!items.length) {
                    throw new Error("No items given");
                }

                state.items = items.map((item) => {
                    item.thumb = `${item.image}?width=${THUMB_SIZE}`;
                    item.done = false;
                    return item;
                });
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
                // pick one of those, otherwise pick a new item
                if (getters.hasRemainingCandidates) {
                    console.log("Getting a new candidate");
                    const candidate = sample(getters.remainingCandidates);
                    commit('candidate', candidate);
                } else {
                    console.log('No more candidates, getting new item');
                    await dispatch("nextItem");
                }
            },

            async nextItem({ commit, getters, dispatch }) {
                // Do this a couple of times to prevent errors
                for (let i = 0; i < MAX_API_TRIES; i++) {
                    console.log(`Trying to get candidates, try: ${i}`);
                    const nextItem = sample(getters.remainingItems);

                    let item;

                    try {
                        item = await api.getItem(nextItem.qid);
                    } catch (e) {
                        console.error(e);
                        continue;
                    }

                    item.thumb = nextItem.thumb;
                    commit('item', item);

                    // Now get candidates
                    let candidates;
                    try {
                        candidates = await api.getCandidates(
                            nextItem.qid, nextItem.category
                        );
                    } catch (e) {
                        console.error(e);

                        // Make sure to skip this item as well on any
                        // next turns
                        item.done = true;
                        commit('item', item);
                        continue;
                    }

                    commit('candidates', candidates);
                    commit('category', nextItem.category);

                    // All went well, let's get out of the loop
                    console.log('Okay, i think that went well');
                    break;
                }

                await dispatch("nextCandidate");
            },

            async query({ commit, dispatch }, query) {
                const { type, value } = query;
                commit('isLoading');

                let items = null;

                if (type === 'year') {
                    items = await api.getPeopleByBirthyear(value);
                } else if (type == 'qid') {
                    items = await api.getItemByQid(value);
                } else if (type === 'category') {
                    items = await api.getItemByCommonsCategory(value);
                } else if (type === 'sparql') {
                    items = await api.getItemsWithSparql(value);
                } else {
                    console.error('No valid query options');
                    return;
                }

                commit('items', items);
                await dispatch("nextItem");
                commit('doneLoading');
                commit('screen', 'game');
            }
        }
    });
}