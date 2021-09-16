import { randInt, sample, timeout } from 'donot';
import Vue from 'vue'
import Vuex from 'vuex'
import Api from './api.js';
import {
    DEFAULT_LOCALE, THUMB_SIZE, MAX_API_TRIES, MAX_API_CHECK_TRIES,
    IMAGE_SIZE
} from './const.js';
import log from './log.js';
import { getLocale } from './util.js';

Vue.use(Vuex);

export default function createStore(opts) {
    const locale = getLocale( DEFAULT_LOCALE );
    const api = new Api(locale);

    function getInitialState() {
        return {
            api : api,
            authUrl: opts.authUrl,
            birthYear : null,
            candidate : null,
            candidates : [],
            category : null,
            challenge : null,
            defaultLocale : DEFAULT_LOCALE,
            errorMessage : null,
            initLocale : getLocale( DEFAULT_LOCALE ),
            isAccessTokenRequest: opts.isAccessTokenRequest,
            isDebug: opts.isDebug,
            isInvalidAccessTokenRequest : opts.isInvalidAccessTokenRequest,
            isLoggedIn: opts.isLoggedIn,
            isLoggedOut: opts.isLoggedOut,
            item : null,
            items : [],
            loading : false,
            locale : getLocale( DEFAULT_LOCALE ),
            locales : opts.locales,
            rootUrl: opts.rootUrl,
            screen : 'intro',
            userName: opts.userName,
            userPage: `https://commons.wikimedia.org/wiki/User:${opts.userName}`
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
            },

            screenState(state) {
                if (state.errorMessage) {
                    return 'error';
                } else if (state.loading) {
                    return 'loading';
                } else if (!state.isLoggedIn) {
                    // None of the regular screens are shown when not logged in
                    return 'logged-out';
                } else {
                    return state.screen;
                }
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
                state.candidates = candidates;
            },

            category(state, category) {
                state.category = category;
            },

            challenge(state, challenge) {
                state.challenge = challenge;
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

                // For some reason, using newlines in GET requests give a HTTP 400
                // on Toolforge, so let's replace newlines with spaces in values,
                // especially needed on SPARQL queries
                let value = opts[opts.type];

                if (typeof value === 'string') {
                    value = value.trim().replace(/\n/g, ' ').replace(/ +/g, ' ');
                }

                let queryValue = window.encodeURIComponent(value);

                // If we have 'deep' categories we also need to add the depth level
                if (queryType === 'category' && opts.catdeep) {
                    queryValue = `${queryValue}|${opts.catdepth}`;
                }

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
                state.items = items;
            },

            locale(state, locale) {
                const url = new window.URL(window.location);
                url.searchParams.set("locale", locale);
                window.location.search = url.searchParams.toString();
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
            async challenge({ commit }, id) {
                const challenge = await api.getChallenge(id);
                commit('challenge', challenge);
                commit('screen', 'challenge');
            },

            async handleCandidate({ commit, dispatch, state }, status) {
                await api.addFile({
                    mid : state.candidate.mid,
                    qid : state.item.qid,
                    category : state.category,
                    user : state.userName,
                    status : status
                });

                commit('processCandidate');

                await dispatch('nextCandidate');
            },

            async itemDone({ state, commit }, qid) {
                await api.itemDone({
                    user : state.userName,
                    qid
                });

                commit('itemDone', qid);
            },

            async newFiles({ commit }, files) {
                // Pass an API call and see if the items have already been done
                const status = await api.filesExist(files.map(f => f.mid));

                files = files.map((file) => {
                    file.done = file[file.mid];
                    return file;
                })

                commit('candidates', files);
            },

            async newItems({ commit }, items) {
                // Pass an API call and see if the items have already been done
                const status = await api.itemsExist(items.map(i => i.qid));

                items = items.map((item) => {
                    item.thumb = `${item.image}?width=${THUMB_SIZE}`;
                    item.done = status[item.qid];
                    return item;
                })

                commit('items', items);
            },

            async nextCandidate({ state, commit, getters, dispatch }) {
                // First check if there are remaining candidates, and if so,
                // pick one of those, otherwise pick a new item
                if (getters.hasRemainingCandidates) {
                    log.debug("Getting a new candidate");
                    const candidate = sample(getters.remainingCandidates);

                    // Now get the proper thumbnail
                    const thumb = await api.getImageThumb(candidate.title, IMAGE_SIZE);
                    candidate.thumb = thumb;

                    commit('candidate', candidate);
                } else {
                    log.debug('No more candidates, getting new item');

                    // Set item to done
                    await dispatch('itemDone', state.item.id);
                    await dispatch("nextItem");
                }
            },

            async nextItem({ commit, getters, dispatch }) {
                if (!getters.hasRemainingItems) {
                    log.debug('No more remaining items');
                    commit('errorMessage', 'Seems there are no more items to process. Try again with a different query.');
                    return;
                }

                const nextItem = sample(getters.remainingItems);

                // Get more item info
                let item;

                try {
                    item = await api.getCandidateItem(nextItem.qid);
                } catch (e) {
                    log.debug(e);
                    return;
                }

                if (!api.isValidItem(item)) {
                    log.debug(`Item ${item.qid} is invalid, skipping`);

                    // Note how we only commit, not dispatch, so that the
                    // DB doesn't get cluttered with items without labels and the like
                    commit("itemDone", nextItem.qid);
                    dispatch("nextItem");
                    return;
                }

                // Get candidates
                let candidates;
                try {
                    candidates = await api.getCandidates(
                        nextItem.qid, nextItem.category
                    );
                } catch (e) {
                    log.debug(`Could not get candidates for ${nextItem.qid}`);
                    await dispatch('itemDone', nextItem.qid);
                    dispatch('nextItem');
                    return;
                }

                commit('item', item);
                await dispatch("newFiles", candidates);
                commit('candidates', candidates);
                commit('category', nextItem.category);

                // All went well, let's get out of the loop
                log.debug('Got candidates and item');
                await dispatch("nextCandidate");
            },

            async query({ commit, dispatch }, query) {
                const { type, value } = query;
                commit('isLoading');

                let items = null;

                if (type === 'year') {
                    items = await api.getPeopleByBirthyear(value).catch((err) => {
                        log.error(err);
                        commit('errorMessage', 'Invalid birth year');
                    });
                } else if (type === 'category') {
                    // Check if this is a deep search (indicated by a pipe|)
                    if (value.includes('|')) {
                        const [category, depth] = value.split('|');

                        items = await api
                            .getItemsByCommonsCategory(value, parseInt(depth))
                            .catch((err) => {
                                log.error(err);
                                commit("errorMessage", "Invalid category or depth");
                            });
                    } else {
                        items = await api
                            .getItemByCommonsCategory(value)
                            .catch((err) => {
                                log.error(err);
                                commit('errorMessage', 'Invalid category');
                            });
                    }
                } else if (type == 'qid') {
                    // This is mainly used for debugging and testing purposes,
                    // hence it's not available in the main interface
                    items = await api.getItemByQid(value).catch((err) => {
                        log.error(err);
                        commit('errorMessage', 'Invalid QID');
                    });;
                } else if (type === 'sparql') {
                    items = await api.getItemsWithSparql(value).catch((err) => {
                        log.error(err);
                        commit('errorMessage', 'The SPARQL query was invalid.');
                    });
                } else {
                    log.error('No valid query options');
                    commit("errorMessage", "No valid query options");
                    return;
                }

                if (!items.length) {
                    commit('errorMessage', 'No items for this query. Try another query.');
                    return;
                }

                await dispatch('newItems', items);
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