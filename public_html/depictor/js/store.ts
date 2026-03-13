import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { sample } from 'donot';
import Api, { Challenge } from './api';
import {
    DEFAULT_LOCALE, THUMB_SIZE, IMAGE_SIZE, COMMONS_USER_PREFIX,
    MIN_CANDIDATES_FOR_CHALLENGE, MIN_ITEMS_FOR_CHALLENGE, MAX_PRELOAD_BATCH
} from './const';
import { getLocale } from './util';

export interface StoreOptions {
    authUrl?: string;
    isAccessTokenRequest?: boolean;
    isDebug?: boolean;
    isInvalidAccessTokenRequest?: boolean;
    isLoggedIn?: boolean;
    isLoggedOut?: boolean;
    rootUrl?: string;
    userName?: string;
    locales?: { messages?: Record<string, Record<string, string>>; languages?: { code: string; label: string }[] };
}

interface Candidate {
    mid: string;
    title: string;
    thumb?: string;
    done?: boolean;
    url?: string;
}

interface Item {
    qid: string;
    category?: string;
    image?: string;
    thumb?: string;
    done?: boolean;
}

let storeOptions: StoreOptions = {};

export const initStore = (opts: StoreOptions) => (storeOptions = opts);

export const useDepictorStore = defineStore('depictor', () => {
    const opts = storeOptions;
    const locale = getLocale(DEFAULT_LOCALE);
    const api = new Api(locale);

    // State
    const authUrl = ref(opts.authUrl);
    const candidate = ref<Candidate | null>(null);
    const candidates = ref<Candidate[]>([]);
    const category = ref<string | null>(null);
    const challenge = ref<Challenge | null>(null);
    const defaultLocale = ref(DEFAULT_LOCALE);
    const errorMessage = ref<string | null>(null);
    const isAccessTokenRequest = ref(opts.isAccessTokenRequest);
    const isDebug = ref(opts.isDebug);
    const isInvalidAccessTokenRequest = ref(opts.isInvalidAccessTokenRequest);
    const isLoggedIn = ref(opts.isLoggedIn);
    const isLoggedOut = ref(opts.isLoggedOut);
    const item = ref<unknown | null>(null);
    const items = ref<Item[]>([]);
    const loading = ref(false);
    const localeState = ref(getLocale(DEFAULT_LOCALE));
    const locales = ref(opts.locales);
    const lockActions = ref(false);
    const rootUrl = ref(opts.rootUrl);
    const query = ref<{ type?: string; value?: string }>({});
    const screen = ref('intro');
    const userName = ref(opts.userName);
    const userPage = ref(opts.userName ? COMMONS_USER_PREFIX + opts.userName : undefined);

    // Getters
    const remainingCandidates = computed(() =>
        candidates.value.filter(c => !c.done)
    );

    const remainingItems = computed(() =>
        items.value.filter(i => !i.done)
    );

    const hasRemainingCandidates = computed(() =>
        remainingCandidates.value.length > 0
    );

    const hasRemainingItems = computed(() =>
        remainingItems.value.length > 0
    );

    const homeLink = computed(() =>
        challenge.value ? `${rootUrl.value}/?challenge=${challenge.value.id}` : (rootUrl.value ?? '')
    );

    const isEditableChallenge = computed(() =>
        !!challenge.value && !!userName.value && challenge.value.user === userName.value
    );

    const isPossibleChallenge = computed(() => {
        if (challenge.value) return false;
        if (query.value?.type === 'year') return false;
        return (remainingCandidates.value.length >= MIN_CANDIDATES_FOR_CHALLENGE) ||
               (remainingItems.value.length >= MIN_ITEMS_FOR_CHALLENGE);
    });

    const screenState = computed(() => {
        if (errorMessage.value) return 'error';
        if (loading.value) return 'loading';
        if (!isLoggedIn.value) return 'logged-out';
        return screen.value;
    });

    const setHash = (optsHash: { type: string; catdeep?: boolean; catdepth?: number; [key: string]: unknown }) => {
        const queryType = window.encodeURIComponent(optsHash.type);
        let value = optsHash[optsHash.type];
        if (typeof value === 'string') {
            value = value.trim().replace(/\n/g, ' ').replace(/ +/g, ' ');
        }
        let queryValue = window.encodeURIComponent(String(value ?? ''));
        if (queryType === 'category' && optsHash.catdeep) {
            queryValue = `${queryValue}|${optsHash.catdepth ?? 0}`;
        }
        window.location.search = `queryType=${queryType}&queryValue=${queryValue}`;
    };

    const setItemDone = (qid: string) =>
        (items.value = items.value.map(it =>
            it.qid === qid ? { ...it, done: true } : it
        ));

    const setLockActions = () => {
        console.log('🔒 Lock actions');
        lockActions.value = true;
    };

    const setLocale = (loc: string) => {
        const url = new window.URL(window.location.href);
        url.searchParams.set('locale', loc);
        window.location.search = url.searchParams.toString();
    };

    const processCandidate = () => {
        if (!candidate.value) return;
        candidates.value = candidates.value.map(c =>
            c.mid === candidate.value!.mid ? { ...c, done: true } : c
        );
    };

    const setUnlockActions = () => {
        console.log('🔓 Unlock actions');
        lockActions.value = false;
    };

    // Actions
    const loadChallenge = async (payload: { id: string; action: string }) => {
        const { id, action } = payload;
        console.log('challenge', { id, action });
        const ch = await api.getChallenge(id);
        challenge.value = ch;
        if (action === 'start') {
            await runQuery({ type: ch.querytype ?? '', value: ch.queryvalue ?? '' });
        } else {
            screen.value = 'challenge';
        }
    };

    const createChallenge = async (payload: {
        title: string;
        shortDescription: string;
        longDescription: string;
        archived: boolean;
    }) => api.createChallenge({
            querytype: query.value.type ?? '',
            queryvalue: query.value.value ?? '',
            title: payload.title,
            short_description: payload.shortDescription,
            long_description: payload.longDescription,
            user: userName.value ?? '',
            itemcount: remainingItems.value.length,
            archived: payload.archived
        });

    const editChallenge = async (payload: {
        title: string;
        shortDescription: string;
        longDescription: string;
        archived: boolean;
    }) => {
        if (!challenge.value) return;
        return api.editChallenge(challenge.value.id, {
            title: payload.title,
            short_description: payload.shortDescription,
            long_description: payload.longDescription,
            archived: payload.archived
        });
    };

    const handleCandidate = async (status: string) => {
        const optsPayload: Record<string, unknown> = {
            mid: candidate.value?.mid,
            qid: (item.value as { qid?: string })?.qid,
            category: category.value,
            user: userName.value,
            status
        };
        if (challenge.value?.id) {
            optsPayload.challenge = challenge.value.id;
        }
        try {
            await api.addFile(optsPayload);
        } catch (e) {
            console.error(e);
            errorMessage.value =
                (e as Error).message ||
                'Could not add the depicts statement. There might be an issue with Wikimedia Commons. Try again later.';
        }
        processCandidate();
        await nextCandidate();
    };

    const itemDone = async (qid: string) => {
        await api.itemDone({ user: userName.value, qid });
        setItemDone(qid);
    };

    const newFiles = async (files: Candidate[]) => {
        const status = await api.filesExist(files.map(f => f.mid));
        const mapped = files.map(f => ({ ...f, done: status[f.mid] }));
        const titles = mapped.map(f => f.title).slice(0, MAX_PRELOAD_BATCH);
        api.preloadImageBatch(titles, IMAGE_SIZE);
        candidates.value = mapped;
    };

    const newItems = async (itemsPayload: { qid: string; category?: string; image?: string }[]) => {
        const status = await api.itemsExist(itemsPayload.map(i => i.qid));
        const mapped: Item[] = itemsPayload.map(it => ({
            ...it,
            thumb: it.image ? `${it.image}?width=${THUMB_SIZE}` : undefined,
            done: status[it.qid]
        }));
        items.value = mapped;
    };

    const nextCandidate = async () => {
        if (hasRemainingCandidates.value) {
            const c = remainingCandidates.value[0];
            console.log(`Got new candidate '${c.title}'`);
            if (remainingCandidates.value.length > 1) {
                const next = remainingCandidates.value[1];
                console.log(`Preloading nextCandidate image '${next.title}'`);
                api.getPreloadedImageThumb(next.title, IMAGE_SIZE);
            }
            console.log(`Now loading candidate image '${c.title}`);
            setLockActions();
            const thumb = await api.getPreloadedImageThumb(c.title, IMAGE_SIZE);
            setUnlockActions();
            console.log(`Done '${c.title}`);
            candidate.value = { ...c, thumb: thumb ?? undefined };
        } else {
            console.log('No more candidates, getting new item');
            setLockActions();
            await itemDone((item.value as { qid: string }).qid);
            await nextItem();
            setUnlockActions();
        }
    };

    const nextItem = async () => {
        if (!hasRemainingItems.value) {
            console.log('No more remaining items');
            errorMessage.value = 'Seems there are no more items to process. Try again with a different query.';
            return;
        }
        const nextItemRef = sample(remainingItems.value);
        let itemData;
        try {
            itemData = await api.getCandidateItem(nextItemRef.qid);
        } catch (e) {
            console.log(e);
            return;
        }
        if (!itemData || !api.isValidItem(itemData)) {
            console.log(`Item ${nextItemRef.qid} is invalid, skipping`);
            setItemDone(nextItemRef.qid);
            nextItem();
            return;
        }
        let cands: Candidate[];
        try {
            cands = await api.getCandidates(itemData.qid, nextItemRef.category ?? '');
        } catch (e) {
            console.log(`Could not get candidates for ${nextItemRef.qid}`);
            await itemDone(nextItemRef.qid);
            nextItem();
            return;
        }
        item.value = itemData;
        await newFiles(cands);
        category.value = nextItemRef.category ?? null;
        console.log('Got candidates and item');
        await nextCandidate();
    };

    const runQuery = async (q: { type: string; value: string }) => {
        const { type, value } = q;
        console.log('query', q);
        loading.value = true;
        let itemsData: { category?: string; image?: string | null; qid: string }[] | null = null;

        if (type === 'year') {
            itemsData = await api.getPeopleByBirthyear(value).catch((err) => {
                console.error(err);
                errorMessage.value = 'Invalid birth year';
                return [];
            });
        } else if (type === 'category') {
            if (value.includes('|')) {
                const [, depth] = value.split('|');
                itemsData = await api.getItemsByCommonsCategory(value, parseInt(depth)).catch((err) => {
                    console.error(err);
                    errorMessage.value = 'Invalid category or depth';
                    return [];
                });
            } else {
                itemsData = await api.getItemByCommonsCategory(value).catch((err) => {
                    console.error(err);
                    errorMessage.value = 'Invalid category';
                    return [];
                });
            }
        } else if (type === 'qid') {
            itemsData = await api.getItemByQid(value).catch((err) => {
                console.error(err);
                errorMessage.value = 'Invalid QID';
                return [];
            });
        } else if (type === 'sparql') {
            itemsData = await api.getItemsWithSparql(value).catch((err) => {
                console.error(err);
                errorMessage.value = 'The SPARQL query was invalid.';
                return [];
            });
        } else {
            console.error('No valid query options');
            errorMessage.value = 'No valid query options';
            return;
        }

        if (!itemsData?.length) {
            errorMessage.value = 'No items for this query. Try another query.';
            return;
        }

        await newItems(itemsData.map(i => ({ qid: i.qid, category: i.category, image: i.image ?? undefined })));
        await nextItem();
        query.value = q;
        screen.value = 'game';
        loading.value = false;
    };

    return {
        api,
        authUrl,
        candidate,
        candidates,
        category,
        challenge,
        defaultLocale,
        errorMessage,
        isAccessTokenRequest,
        isDebug,
        isLoggedIn,
        isLoggedOut,
        item,
        items,
        locale: localeState,
        locales,
        lockActions,
        rootUrl,
        query,
        screen,
        userName,
        userPage,
        hasRemainingCandidates,
        hasRemainingItems,
        homeLink,
        isEditableChallenge,
        isPossibleChallenge,
        remainingCandidates,
        remainingItems,
        screenState,
        setHash,
        setItemDone,
        setLockActions,
        setLocale,
        processCandidate,
        setUnlockActions,
        loadChallenge,
        createChallenge,
        editChallenge,
        handleCandidate,
        itemDone,
        newFiles,
        newItems,
        nextCandidate,
        nextItem,
        runQuery
    };
});
