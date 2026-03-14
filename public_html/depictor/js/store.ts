import { createStore as createVuexStore } from 'vuex';
import Api from './api';
import {
    DEFAULT_LOCALE, THUMB_SIZE, IMAGE_SIZE, COMMONS_USER_PREFIX,
    MIN_CANDIDATES_FOR_CHALLENGE, MIN_ITEMS_FOR_CHALLENGE, MAX_PRELOAD_BATCH
} from './const';
import { getLocale } from './util';

interface DepictorStoreOptions {
    authUrl?: string;
    isAccessTokenRequest?: boolean;
    isDebug?: boolean;
    isInvalidAccessTokenRequest?: boolean;
    isLoggedIn?: boolean;
    isLoggedOut?: boolean;
    rootUrl?: string;
    userName?: string;
    locales?: {
        messages?: Record<string, Record<string, string>>;
        languages?: { code: string; label: string }[];
    };
}

interface Candidate {
    mid: string;
    title: string;
    thumb?: string;
    done?: boolean;
}

interface Item {
    qid: string;
    category?: string;
    image?: string;
    thumb?: string;
    done?: boolean;
}

interface Challenge {
    id: string;
    querytype?: string;
    queryvalue?: string;
    user?: string;
}

interface State {
    api: Api;
    authUrl?: string;
    birthYear: number | null;
    candidate: Candidate | null;
    candidates: Candidate[];
    category: string | null;
    challenge: Challenge | null;
    defaultLocale: string;
    errorMessage: string | null;
    initLocale: string;
    isAccessTokenRequest?: boolean;
    isDebug?: boolean;
    isInvalidAccessTokenRequest?: boolean;
    isLoggedIn?: boolean;
    isLoggedOut?: boolean;
    item: unknown | null;
    items: Item[];
    loading: boolean;
    locale: string;
    locales?: {
        messages?: Record<string, Record<string, string>>;
        languages?: { code: string; label: string }[];
    };
    lockActions: boolean;
    rootUrl?: string;
    query: { type?: string; value?: string };
    screen: string;
    userName?: string;
    userPage?: string;
}

export default function createStore(opts: DepictorStoreOptions) {
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
            initLocale : getLocale(DEFAULT_LOCALE),
            isAccessTokenRequest: opts.isAccessTokenRequest,
            isDebug: opts.isDebug,
            isInvalidAccessTokenRequest : opts.isInvalidAccessTokenRequest,
            isLoggedIn: opts.isLoggedIn,
            isLoggedOut: opts.isLoggedOut,
            item : null,
            items : [],
            loading : false,
            locale : getLocale(DEFAULT_LOCALE),
            locales : opts.locales,
            lockActions : false,
            rootUrl: opts.rootUrl,
            query : {},
            screen : 'intro',
            userName: opts.userName,
            userPage: opts.userName ? COMMONS_USER_PREFIX + opts.userName : undefined
        };
    }

    return createVuexStore<State>({
        state : getInitialState(),

        getters : {
            hasRemainingCandidates(state, getters) {
                return getters.remainingCandidates.length > 0;
            },

            hasRemainingItems(state, getters) {
                return getters.remainingItems.length > 0;
            },

            homeLink(state) {
                if (state.challenge) {
                    return `${state.rootUrl}/?challenge=${state.challenge.id}`
                } else {
                    return state.rootUrl;
                }
            },

            isEditableChallenge(state) {
                // A challenge is editable if the logged-in user is the
                // same as the user who made the challenge
                return state.challenge && state.userName &&
                       state.challenge.user === state.userName;
            },

            isPossibleChallenge(state, getters) {
                // Check if a challenge is possible here.
                // That means we either have
                // 1) A minimum of remainingCandidates in a single category
                // 2) A minimum of remainingItems totally
                // 3) We're not in a challenge at the moment
                // 4) We're not using the year queryType
                //    (to prevent inexperienced users from creating challenges)

                // Check 3
                if (state.challenge) {
                    return false;
                }

                // Check 4
                if (state.query && state.query.type === "year") {
                    return false;
                }

                // Check 1 and 2

                return (getters.remainingCandidates &&
                        getters.remainingCandidates.length >= MIN_CANDIDATES_FOR_CHALLENGE)
                       ||
                       (getters.remainingItems &&
                        getters.remainingItems.length >= MIN_ITEMS_FOR_CHALLENGE);
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

            hash(state, opts: { type: string; catdeep?: boolean; catdepth?: number; [key: string]: unknown }) {
                const queryType = window.encodeURIComponent(opts.type);

                let value = opts[opts.type];

                if (typeof value === 'string') {
                    value = value.trim().replace(/\n/g, ' ').replace(/ +/g, ' ');
                }

                let queryValue = window.encodeURIComponent(String(value ?? ''));

                if (queryType === 'category' && opts.catdeep) {
                    queryValue = `${queryValue}|${opts.catdepth ?? 0}`;
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

            lockActions(state) {
                console.log('🔒 Lock actions');
                state.lockActions = true;
            },

            locale(state, locale: string) {
                const url = new window.URL(window.location.href);
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

            query(state, query) {
                state.query = query;
            },

            screen(state, screen) {
                state.screen = screen;
            },

            unlockActions(state) {
                console.log('🔓 Unlock actions');
                state.lockActions = false;
            }
        },

        actions : {
            async challenge({ commit, dispatch }, { id, action }: { id: string; action: string }) {
                console.log('challenge', { id, action });
                const challenge = await api.getChallenge(id) as Challenge;
                commit('challenge', challenge);

                if (action === 'start') {
                    dispatch('query', {
                        type : challenge.querytype,
                        value : challenge.queryvalue
                    });
                } else {
                    commit('screen', 'challenge');
                }
            },

            async createChallenge({state, getters}, payload) {
                return await api.createChallenge({
                    querytype : state.query.type,
                    queryvalue : state.query.value,
                    title : payload.title,
                    short_description : payload.shortDescription,
                    long_description : payload.longDescription,
                    user : state.userName,
                    itemcount : getters.remainingItems.length,
                    archived : payload.archived
                });
            },

            async editChallenge({state, getters}, payload) {
                if (!state.challenge) return;
                return await api.editChallenge(state.challenge.id, {
                    title : payload.title,
                    short_description : payload.shortDescription,
                    long_description : payload.longDescription,
                    archived : payload.archived
                });
            },

            async handleCandidate({ commit, dispatch, state }, status: string) {
                const opts: Record<string, unknown> = {
                    mid : state.candidate?.mid,
                    qid : (state.item as { qid?: string })?.qid,
                    category : state.category,
                    user : state.userName,
                    status : status
                };

                if (state.challenge?.id) {
                    opts.challenge = state.challenge.id;
                }

                try {
                    await api.addFile(opts);
                } catch (e) {
                    console.error(e);
                    commit(
                        "errorMessage",
                        (e as Error).message || "Could not add the depicts statement. There might be an issue with Wikimedia Commons. Try again later."
                    );
                }

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
                    file.done = status[file.mid];
                    return file;
                });

                // Let's just preload the first batch of images to speed
                // things up
                const titles = files.map(f => f.title).slice(0, MAX_PRELOAD_BATCH);
                api.preloadImageBatch(titles, IMAGE_SIZE);

                commit('candidates', files);
            },

            async newItems({ commit }, items: { qid: string; category?: string; image?: string }[]) {
                const status = await api.itemsExist(items.map(i => i.qid));

                const mappedItems: Item[] = items.map((item) => {
                    return {
                        ...item,
                        thumb: item.image ? `${item.image}?width=${THUMB_SIZE}` : undefined,
                        done: status[item.qid]
                    };
                });

                commit('items', mappedItems);
            },

            async nextCandidate({ state, commit, getters, dispatch }) {
                // First check if there are remaining candidates, and if so,
                // pick one of those, otherwise pick a new item
                if (getters.hasRemainingCandidates) {
                    // #93 - switched this from 'sample' to 'head' to be
                    // able to preload images
                    const candidate = getters.remainingCandidates[0];
                    console.log(`Got new candidate '${candidate.title}'`);

                    // Preload the next image if we have more than one
                    // remaining candidate
                    if (getters.remainingCandidates.length > 1) {
                        const nextCandidate = getters.remainingCandidates.at(1);
                        console.log(`Preloading nextCandidate image '${nextCandidate.title}'`);
                        api.getPreloadedImageThumb(nextCandidate.title, IMAGE_SIZE);
                    }

                    // Now get the proper thumbnail
                    // First preload the image so we can lock the interface
                    // until the image is shown, preventing mashing the
                    // buttons and breaking the API (#127)
                    console.log(`Now loading candidate image '${candidate.title}`);
                    commit('lockActions');
                    const thumb = await api.getPreloadedImageThumb(candidate.title, IMAGE_SIZE);
                    commit('unlockActions');
                    console.log(`Done '${candidate.title}`);
                    candidate.thumb = thumb;

                    commit('candidate', candidate);
                } else {
                    console.log('No more candidates, getting new item');

                    // Set item to done
                    commit('lockActions');
                    await dispatch('itemDone', (state.item as { qid: string }).qid);
                    await dispatch("nextItem");
                    commit('unlockActions');
                }
            },

            async nextItem({ commit, getters, dispatch }) {
                if (!getters.hasRemainingItems) {
                    console.log('No more remaining items');
                    commit('errorMessage', 'Seems there are no more items to process. Try again with a different query.');
                    return;
                }

                // #93 - We're still making this random to prevent
                // race conditions for multiple people using the same challenge
                const items = getters.remainingItems;
                const nextItem = items[Math.floor(Math.random() * items.length)];

                // Get more item info
                let item;

                try {
                    item = await api.getCandidateItem(nextItem.qid);
                } catch (e) {
                    console.log(e);
                    return;
                }

                if (!api.isValidItem(item)) {
                    console.log(`Item ${item.qid} is invalid, skipping`);

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
                    console.log(`Could not get candidates for ${nextItem.qid}`);
                    await dispatch('itemDone', nextItem.qid);
                    dispatch('nextItem');
                    return;
                }

                commit('item', item);
                await dispatch("newFiles", candidates);
                commit('category', nextItem.category);

                // All went well, let's get out of the loop
                console.log('Got candidates and item');
                await dispatch("nextCandidate");
            },

            async query({ commit, dispatch }, query: { type: string; value: string }) {
                console.log('query', query);
                const { type, value } = query;
                commit('isLoading');

                let items: { category?: string; image?: string | null; qid: string }[] | null = null;

                if (type === 'year') {
                    items = await api.getPeopleByBirthyear(value).catch((err) => {
                        console.error(err);
                        commit('errorMessage', 'Invalid birth year');
                        return [];
                    });
                } else if (type === 'category') {
                    if (value.includes('|')) {
                        const [, depth] = value.split('|');

                        items = await api
                            .getItemsByCommonsCategory(value, parseInt(depth))
                            .catch((err) => {
                                console.error(err);
                                commit("errorMessage", "Invalid category or depth");
                                return [];
                            });
                    } else {
                        items = await api
                            .getItemByCommonsCategory(value)
                            .catch((err) => {
                                console.error(err);
                                commit('errorMessage', 'Invalid category');
                                return [];
                            });
                    }
                } else if (type === 'qid') {
                    items = await api.getItemByQid(value).catch((err) => {
                        console.error(err);
                        commit('errorMessage', 'Invalid QID');
                        return [];
                    });
                } else if (type === 'sparql') {
                    items = await api.getItemsWithSparql(value).catch((err) => {
                        console.error(err);
                        commit('errorMessage', 'The SPARQL query was invalid.');
                        return [];
                    });
                } else {
                    console.error('No valid query options');
                    commit("errorMessage", "No valid query options");
                    return;
                }

                if (!items?.length) {
                    commit('errorMessage', 'No items for this query. Try another query.');
                    return;
                }

                await dispatch('newItems', items.map(i => ({ qid: i.qid, category: i.category, image: i.image ?? undefined })));
                await dispatch("nextItem");
                commit('query', query); // Save for use later in challenges
                commit('screen', 'game');
                commit('doneLoading');
            }
        }
    });
}