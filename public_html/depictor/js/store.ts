import { defineStore } from "pinia";
import { computed, reactive, toRefs } from "vue";
import Api from "./api";
import {
    COMMONS_USER_PREFIX,
    DEFAULT_LOCALE,
    IMAGE_SIZE,
    MAX_PRELOAD_BATCH,
    MIN_CANDIDATES_FOR_CHALLENGE,
    MIN_ITEMS_FOR_CHALLENGE,
    THUMB_SIZE,
} from "./const";
import { getLocale } from "./util";

export interface DepictorStoreOptions {
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
    title?: string;
    short_description?: string;
    long_description?: string;
    archived?: string;
    itemcount?: string | number;
}

let storeOptions: DepictorStoreOptions = {};

export const setDepictorStoreOptions = (opts: DepictorStoreOptions) => {
    storeOptions = opts;
};

const createInitialState = () => {
    const locale = getLocale(DEFAULT_LOCALE);
    const api = new Api(locale);
    return {
        api,
        authUrl: storeOptions.authUrl,
        birthYear: null as number | null,
        candidate: null as Candidate | null,
        candidates: [] as Candidate[],
        category: null as string | null,
        challenge: null as Challenge | null,
        defaultLocale: DEFAULT_LOCALE,
        errorMessage: null as string | null,
        initLocale: getLocale(DEFAULT_LOCALE),
        isAccessTokenRequest: storeOptions.isAccessTokenRequest,
        isDebug: storeOptions.isDebug,
        isInvalidAccessTokenRequest: storeOptions.isInvalidAccessTokenRequest,
        isLoggedIn: storeOptions.isLoggedIn,
        isLoggedOut: storeOptions.isLoggedOut,
        item: null as unknown,
        items: [] as Item[],
        loading: false,
        locale: getLocale(DEFAULT_LOCALE),
        locales: storeOptions.locales,
        lockActions: false,
        rootUrl: storeOptions.rootUrl,
        query: {} as { type?: string; value?: string },
        screen: "intro",
        userName: storeOptions.userName,
        userPage: storeOptions.userName
            ? COMMONS_USER_PREFIX + storeOptions.userName
            : undefined,
    };
};

export const useDepictorStore = defineStore("depictor", () => {
    const state = reactive(createInitialState());

    // Getters
    const remainingCandidates = computed(() =>
        state.candidates.filter((c) => !c.done)
    );
    const remainingItems = computed(() =>
        state.items.filter((item) => !item.done)
    );
    const hasRemainingCandidates = computed(
        () => remainingCandidates.value.length > 0,
    );
    const hasRemainingItems = computed(
        () => remainingItems.value.length > 0,
    );
    const homeLink = computed(() =>
        state.challenge
            ? `${state.rootUrl}/?challenge=${state.challenge.id}`
            : state.rootUrl
    );
    const isEditableChallenge = computed(
        () =>
            !!(
                state.challenge &&
                state.userName &&
                state.challenge.user === state.userName
            ),
    );
    const isPossibleChallenge = computed(() => {
        if (state.challenge) return false;
        if (state.query?.type === "year") return false;
        return (
            remainingCandidates.value.length >= MIN_CANDIDATES_FOR_CHALLENGE ||
            remainingItems.value.length >= MIN_ITEMS_FOR_CHALLENGE
        );
    });
    const screenState = computed(() => {
        if (state.errorMessage) return "error";
        if (state.loading) return "loading";
        if (!state.isLoggedIn) return "logged-out";
        return state.screen;
    });

    // Mutations (only those with non-trivial logic or side effects)
    const setItemDone = (qid: string) => {
        state.items = state.items.map((item) =>
            item.qid === qid ? { ...item, done: true } : item
        );
    };
    const setLocale = (locale: string) => {
        const url = new window.URL(window.location.href);
        url.searchParams.set("locale", locale);
        window.location.search = url.searchParams.toString();
    };
    const processCandidate = () => {
        if (!state.candidate) return;
        state.candidates = state.candidates.map((c) =>
            c.mid === state.candidate!.mid ? { ...c, done: true } : c
        );
    };
    const hash = (opts: {
        type: string;
        catdeep?: boolean;
        catdepth?: number;
        [key: string]: unknown;
    }) => {
        const queryType = window.encodeURIComponent(opts.type);
        let value = opts[opts.type];
        if (typeof value === "string") {
            value = value.trim().replace(/\n/g, " ").replace(/ +/g, " ");
        }
        let queryValue = window.encodeURIComponent(String(value ?? ""));
        if (queryType === "category" && opts.catdeep) {
            queryValue = `${queryValue}|${opts.catdepth ?? 0}`;
        }
        window.location.search =
            `queryType=${queryType}&queryValue=${queryValue}`;
    };

    // Actions
    const loadChallenge = async (payload: { id: string; action: string }) => {
        const { id, action } = payload;
        console.log("challenge", { id, action });
        const challenge = (await state.api.getChallenge(id)) as Challenge;
        state.challenge = challenge;

        if (action === "start") {
            await runQuery({
                type: challenge.querytype ?? "",
                value: challenge.queryvalue ?? "",
            });
        } else {
            state.screen = "challenge";
        }
    };

    const createChallenge = (payload: {
        title: string;
        shortDescription: string;
        longDescription: string;
        archived?: boolean;
    }) =>
        state.api.createChallenge({
            querytype: state.query.type,
            queryvalue: state.query.value,
            title: payload.title,
            short_description: payload.shortDescription,
            long_description: payload.longDescription,
            user: state.userName,
            itemcount: remainingItems.value.length,
            archived: payload.archived,
        });

    const editChallenge = async (payload: {
        title: string;
        shortDescription: string;
        longDescription: string;
        archived?: boolean;
    }) => {
        if (!state.challenge) return;
        return await state.api.editChallenge(state.challenge.id, {
            title: payload.title,
            short_description: payload.shortDescription,
            long_description: payload.longDescription,
            archived: payload.archived,
        });
    };

    const handleCandidate = async (status: string) => {
        const opts: Record<string, unknown> = {
            mid: state.candidate?.mid,
            qid: (state.item as { qid?: string })?.qid,
            category: state.category,
            user: state.userName,
            status,
        };
        if (state.challenge?.id) opts.challenge = state.challenge.id;

        try {
            await state.api.addFile(opts);
        } catch (e) {
            console.error(e);
            state.errorMessage = (e as Error).message ||
                "Could not add the depicts statement. There might be an issue with Wikimedia Commons. Try again later.";
        }

        processCandidate();
        await nextCandidate();
    };

    const itemDone = async (qid: string) => {
        await state.api.itemDone({ user: state.userName, qid });
        setItemDone(qid);
    };

    const newFiles = async (
        files: { mid: string; title: string; done?: boolean }[],
        qid: string,
    ) => {
        const status = await state.api.filesExist(files.map((f) => f.mid), qid);
        const withStatus = files.map((f) => ({
            ...f,
            done: status[f.mid],
        }));
        const titles = withStatus
            .map((f) => f.title)
            .slice(0, MAX_PRELOAD_BATCH);
        state.api.preloadImageBatch(titles, IMAGE_SIZE);
        state.candidates = withStatus;
    };

    const newItems = async (items: {
        qid: string;
        category?: string;
        image?: string;
    }[]) => {
        const status = await state.api.itemsExist(items.map((i) => i.qid));
        const mappedItems: Item[] = items.map((item) => ({
            ...item,
            thumb: item.image ? `${item.image}?width=${THUMB_SIZE}` : undefined,
            done: status[item.qid],
        }));
        state.items = mappedItems;
    };

    const nextCandidate = async () => {
        if (hasRemainingCandidates.value) {
            const candidate = remainingCandidates.value[0];
            console.log(`Got new candidate '${candidate.title}'`);

            if (remainingCandidates.value.length > 1) {
                const nextCandidate = remainingCandidates.value[1];
                if (nextCandidate) {
                    console.log(
                        `Preloading nextCandidate image '${nextCandidate.title}'`,
                    );
                    state.api.getPreloadedImageThumb(
                        nextCandidate.title,
                        IMAGE_SIZE,
                    );
                }
            }

            console.log(`Now loading candidate image '${candidate.title}'`);
            console.log("🔒 Lock actions");
            state.lockActions = true;
            const thumb = await state.api.getPreloadedImageThumb(
                candidate.title,
                IMAGE_SIZE,
            );
            console.log("🔓 Unlock actions");
            state.lockActions = false;
            console.log(`Done '${candidate.title}'`);
            candidate.thumb = thumb as string | undefined;
            state.candidate = candidate;
        } else {
            console.log("No more candidates, getting new item");
            console.log("🔒 Lock actions");
            state.lockActions = true;
            await itemDone((state.item as { qid: string }).qid);
            await nextItem();
            console.log("🔓 Unlock actions");
            state.lockActions = false;
        }
    };

    const nextItem = async () => {
        if (!hasRemainingItems.value) {
            console.log("No more remaining items");
            state.errorMessage =
                "Seems there are no more items to process. Try again with a different query.";
            return;
        }

        const items = remainingItems.value;
        const selectedItem = items[Math.floor(Math.random() * items.length)];

        let item;
        try {
            item = await state.api.getCandidateItem(selectedItem.qid);
        } catch (e) {
            console.log(e);
            return;
        }

        if (!state.api.isValidItem(item)) {
            console.log(`Item ${item.qid} is invalid, skipping`);
            setItemDone(selectedItem.qid);
            nextItem();
            return;
        }

        try {
            const candidates = await state.api.getCandidates(
                selectedItem.qid,
                selectedItem.category ?? "",
            );

            state.item = item;
            await newFiles(candidates, selectedItem.qid);
        } catch (e) {
            console.log(`Could not get candidates for ${selectedItem.qid}`);
            await itemDone(selectedItem.qid);
            nextItem();
            return;
        }

        state.category = selectedItem.category ?? null;
        console.log("Got candidates and item");
        await nextCandidate();
    };

    const runQuery = async (query: { type: string; value: string }) => {
        console.log("query", query);
        const { type, value } = query;
        state.loading = true;

        let items: {
            category?: string;
            image?: string | null;
            qid: string;
        }[] | null = null;

        if (type === "year") {
            items = await state.api.getPeopleByBirthyear(value).catch((err) => {
                console.error(err);
                state.errorMessage = "Invalid birth year";
                return [];
            });
        } else if (type === "category") {
            if (value.includes("|")) {
                const [, depth] = value.split("|");
                items = await state.api
                    .getItemsByCommonsCategory(value, parseInt(depth))
                    .catch((err) => {
                        console.error(err);
                        state.errorMessage = "Invalid category or depth";
                        return [];
                    });
            } else {
                items = await state.api
                    .getItemByCommonsCategory(value)
                    .catch((err) => {
                        console.error(err);
                        state.errorMessage = "Invalid category";
                        return [];
                    });
            }
        } else if (type === "qid") {
            items = await state.api.getItemByQid(value).catch((err) => {
                console.error(err);
                state.errorMessage = "Invalid QID";
                return [];
            });
        } else if (type === "sparql") {
            items = await state.api.getItemsWithSparql(value).catch((err) => {
                console.error(err);
                state.errorMessage = "The SPARQL query was invalid.";
                return [];
            });
        } else {
            console.error("No valid query options");
            state.errorMessage = "No valid query options";
            return;
        }

        if (!items?.length) {
            state.errorMessage = "No items for this query. Try another query.";
            return;
        }

        await newItems(
            items.map((i) => ({
                qid: i.qid,
                category: i.category,
                image: i.image ?? undefined,
            })),
        );
        await nextItem();
        state.query = query;
        state.screen = "game";
        state.loading = false;
    };

    return {
        // State (toRefs preserves reactivity when destructured)
        ...toRefs(state),
        // Getters
        hasRemainingCandidates,
        hasRemainingItems,
        homeLink,
        isEditableChallenge,
        isPossibleChallenge,
        remainingCandidates,
        remainingItems,
        screenState,
        // Actions
        createChallenge,
        editChallenge,
        handleCandidate,
        hash,
        itemDone,
        loadChallenge,
        newFiles,
        newItems,
        nextCandidate,
        nextItem,
        processCandidate,
        runQuery,
        setItemDone,
        setLocale,
    };
});
