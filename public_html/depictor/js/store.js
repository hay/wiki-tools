import { randInt, sample, timeout } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import {
    DEFAULT_LOCALE, THUMB_SIZE, MAX_API_TRIES, MAX_API_CHECK_TRIES
} from './const.js';
import Api from './api.js';

Vue.use(Vuex);

export default function createStore(opts) {
    const api = new Api(DEFAULT_LOCALE);

    function getInitialState() {
        return {
            authenticatedUser : opts.authenticatedUser,
            birthYear : null,
            candidate : null,
            candidates : [],
            category : null,
            errorMessage : null,
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

            hasRemainingItems(state, getters) {
                return getters.remainingItems.length > 0;
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

            candidateDone(state, mid) {
                state.candidates = state.candidates.map((candidate) => {
                    if (candidate.mid === mid) {
                        candidate.done = true;
                    }

                    return candidate;
                });
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

            errorMessage(state, message) {
                state.errorMessage = message;
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

            itemDone(state, qid) {
                state.items = state.items.map((item) => {
                    if (item.qid === qid) {
                        item.done = true;
                    }

                    return item;
                });
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
                await api.addFile({
                    mid : state.candidate.mid,
                    qid : state.item.qid,
                    category : state.category,
                    user : state.authenticatedUser,
                    status : status
                });

                commit('processCandidate');

                await dispatch('nextCandidate');
            },

            async itemDone({ state, commit }, qid) {
                await api.itemDone({
                    user : state.authenticatedUser,
                    qid
                });

                commit('itemDone', qid);
            },

            async nextCandidate({ state, commit, getters, dispatch }) {
                // First check if there are remaining candidates, and if so,
                // pick one of those, otherwise pick a new item
                if (getters.hasRemainingCandidates) {
                    console.log("Getting a new candidate");
                    const candidate = sample(getters.remainingCandidates);

                    // Check if the candidate has been processed earlier
                    const exists = await api.fileExists(candidate.mid);
                    console.log(`${candidate.mid} exists: ${exists}`);

                    if (exists) {
                        commit('candidateDone', candidate.mid);
                        console.log('Candidate exists in database, skipping');
                        dispatch('nextCandidate');
                    } else {
                        // Candidate does not exist, put it up
                        commit('candidate', candidate);
                    }
                } else {
                    console.log('No more candidates, getting new item');

                    // Set item to done
                    await dispatch('itemDone', state.item.id);
                    await dispatch("nextItem");
                }
            },

            async nextItem({ commit, getters, dispatch }) {
                if (!getters.hasRemainingItems) {
                    console.log('No more remaining items');
                    commit('errorMessage', 'Seems there are no more items to process. Try again with a different query.');
                    return;
                }

                const nextItem = sample(getters.remainingItems);

                // Check if this item is 'done', and if so go on
                const exists = await api.itemExists(nextItem.qid);
                console.log(`${nextItem.qid} exists: ${exists}`);

                if (exists) {
                    console.log('Item is done');
                    await dispatch('itemDone', nextItem.qid);
                    dispatch('nextItem');
                    return;
                }

                // Get candidates
                let candidates;
                try {
                    candidates = await api.getCandidates(
                        nextItem.qid, nextItem.category
                    );
                } catch (e) {
                    console.log(`Could not get candidates for ${nextItem.qid}`);
                    await dispatch('itemDone', nextItem.qid);
                    dispatch('nextItem');
                    return;
                }

                // Get more item info
                let item;

                try {
                    item = await api.getItem(nextItem.qid);
                } catch (e) {
                    console.log(e);
                    return;
                }

                item.thumb = nextItem.thumb;
                commit('item', item);
                commit('candidates', candidates);
                commit('category', nextItem.category);

                // All went well, let's get out of the loop
                console.log('Got candidates and item');
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
                    console.log('No valid query options');
                    return;
                }

                if (!items.length) {
                    commit('errorMessage', 'No items for this query. Try another query.');
                    return;
                }

                commit('items', items);
                await dispatch("nextItem");
                commit('screen', 'game');
                commit('doneLoading');
            },

            reset() {
                // TODO: this is a bit rude, but oh well
                window.location.search = '';
            }
        }
    });
}