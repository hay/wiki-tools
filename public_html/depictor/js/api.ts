import { getJson } from "./util";
import { IMAGE_SIZE, LOCAL_API_ENDPOINT, THUMB_SIZE } from "./const";
import { buildUrlQuery, postJson } from "./util";
import CommonsApi from "./mwapi/commons";
import WikidataApi from "./mwapi/wikidata";
import WikidataQuery, { SparqlBinding } from "./mwapi/query";

export interface Challenge {
    id: string;
    querytype?: string;
    queryvalue?: string;
    user?: string;
    title?: string;
    short_description?: string;
    long_description?: string;
    archived?: string;
    itemcount?: string;
}

interface CandidateItem {
    mid: string;
    title: string;
    thumb?: string;
    done?: boolean;
}

interface ItemWithClaims {
    claims?: Record<
        string,
        { mainsnak: { datavalue?: { value: { id?: string } } } }[]
    >;
    descriptions?: Record<string, { value: string }>;
    labels?: Record<string, { value: string }>;
    sitelinks?: Record<string, { title: string }>;
}

export default class Api {
    locale: string;

    constructor(locale: string) {
        this.locale = locale;
    }

    async addFile(file: unknown) {
        const req = await this.call<{ error?: string; ok?: boolean }>(
            "add-file",
            file as Record<string, unknown>,
        );

        if (req.error || !req.ok) {
            throw new Error(req.error || "Could not add depicts statement");
        }

        return req;
    }

    async call<T>(
        action: string,
        opts: Record<string, unknown> = {},
    ): Promise<T> {
        opts.action = action;
        const query = buildUrlQuery(
            opts as Record<string, string | number | boolean | undefined>,
        );
        const url = `${LOCAL_API_ENDPOINT}?${query}`;
        const req = await getJson(url);
        return req;
    }

    async post<T>(
        action: string,
        opts: Record<string, unknown> = {},
    ): Promise<T> {
        opts.action = action;
        const req = await postJson(LOCAL_API_ENDPOINT, opts);
        return req as T;
    }

    async createChallenge(data: Record<string, unknown>) {
        const req = await this.post("create-challenge", data) as {
            error?: { info?: string };
            id?: string;
        };

        if (req.error || !req.id) {
            throw new Error(
                (req.error as { info?: string })?.info ?? "Unknown error",
            );
        }

        return req.id;
    }

    async editChallenge(id: string, data: Record<string, unknown>) {
        data.id = id;

        const req = await this.post("edit-challenge", data) as {
            error?: { info?: string };
            id?: string;
        };

        if (req.error || !req.id) {
            throw new Error(
                (req.error as { info?: string })?.info ?? "Unknown error",
            );
        }

        return req.id;
    }

    async fileExists(mid: string) {
        const req = await this.call<{ status?: boolean }>("file-exists", {
            mid,
        });
        return req.status ?? false;
    }

    async filesExist(mids: string[]) {
        const req = await this.post("files-exists", { mids }) as Record<
            string,
            boolean
        >;
        return req;
    }

    async getCandidates(qid: string, category: string) {
        const api = new CommonsApi(this.locale, {
            thumbSize: IMAGE_SIZE,
        });

        // Find only bitmaps that don't have a P180 statement for the person in the stated category
        const query =
            `-haswbstatement:P180=${qid} incategory:"${category}" filetype:bitmap`;
        const req = await api.search(query, {
            "namespace": 6, // Only get the File: namespace
        }) as { error?: { info?: string }; items: CandidateItem[] };

        if (req.error) {
            throw new Error((req.error as { info?: string })?.info);
        }

        if (!req.items.length) {
            throw new Error(`No candidates for ${qid}`);
        }

        return req.items;
    }

    async getCandidateItem(qid: string) {
        const api = new WikidataApi(this.locale);

        const req = await api.call<
            { error?: unknown; entities?: Record<string, ItemWithClaims> }
        >({
            "action": "wbgetentities",
            "ids": qid,
            "languages": this.locale,
            "props": "claims|descriptions|labels|sitelinks",
            "format": "json",
        });

        if (req.error) {
            console.error(req.error);
            return null;
        }

        const item = req.entities?.[qid];
        if (!item) return null;

        let thumb: string | undefined;

        if (item.claims && "P18" in item.claims) {
            const file =
                (item.claims.P18[0] as {
                    mainsnak: { datavalue?: { value: string } };
                }).mainsnak.datavalue?.value;
            if (file) {
                const commonsApi = new CommonsApi(this.locale);
                thumb = commonsApi.getThumb(file, THUMB_SIZE);
            }
        }

        const sitelinkCode = `${this.locale}wiki`;
        const hasSitelink = !!(item.sitelinks && item.sitelinks[sitelinkCode]);
        const sitelinkTitle = hasSitelink && item.sitelinks?.[sitelinkCode]
            ? item.sitelinks[sitelinkCode].title
            : null;

        return {
            _item: item,
            description: this.locale in (item.descriptions ?? {})
                ? item.descriptions![this.locale].value
                : null,
            hasSitelink: hasSitelink,
            id: qid,
            label: this.locale in (item.labels ?? {})
                ? item.labels![this.locale].value
                : null,
            qid: qid,
            sitelinkTitle: sitelinkTitle,
            thumb: thumb,
            url: `https://www.wikidata.org/wiki/${qid}`,
        };
    }

    async getChallenge(id: string) {
        const req = await this.call<Challenge & { error?: string }>(
            "challenge",
            { id },
        );

        if ((req as { error?: string }).error) {
            throw new Error(req.error);
        }

        return req;
    }

    async getChallenges<T>() {
        return await this.call<T & { error?: string }>("challenges");
    }

    async getImageThumb(title: string, width: number) {
        const api = new CommonsApi(this.locale);
        return api.getImageThumb(title, width);
    }

    // Same as getImageThumb, but also preloads the image
    getPreloadedImageThumb(title: string, width: number) {
        return new Promise<string | null>((resolve) => {
            const api = new CommonsApi(this.locale);
            api.getImageThumb(title, width).then((url) => {
                const img = new Image();

                img.addEventListener("load", () => {
                    console.log(`Loaded ${title}`);
                    resolve(url);
                });

                img.src = url ?? "";
            });
        });
    }

    // Note difference with the plural (itemS) function
    async getItemByCommonsCategory(category: string) {
        const sparql = `
            select ?item ?image ?cat where {
              ?item wdt:P18 ?image;
                    wdt:P373 "${category}";
                    wdt:P373 ?cat.
            }
        `;

        let items = await this.getItemsWithSparql(sparql);
        return items;
    }

    // This uses PetScan instead of SPARQL, as with the single api call above
    async getItemsByCommonsCategory(category: string, depth: number = 0) {
        const opts: Record<string, string | number> = {
            "categories": category,
            "depth": depth,
            "wikidata_item": "with",
            "project": "wikimedia",
            "language": "commons",
            "format": "json",
            "ns[14]": "1",
            "search_max_results": "500",
            "doit": "1",
        };

        const req = await getJson(
            "https://petscan.wmcloud.org/",
            opts as Record<string, string>,
        ) as {
            error?: unknown;
            "*"?: { a?: { "*"?: { title: string; q: string }[] } }[];
        };

        if (req.error) {
            return [];
        }

        let results: { title: string; q: string }[];

        try {
            // The PetScan JSON definitely leaves something to be desired
            results = req["*"]?.[0]?.["a"]?.["*"] ?? [];
        } catch {
            return [];
        }

        return results.map((item) => {
            return {
                "category": item.title,
                "image": null,
                "qid": item.q,
            };
        });
    }

    // Only used for debugging purposes, not exposed in the main interface
    async getItemByQid(qid: string) {
        const sparql = `
          select ?item ?image ?cat where {
            wd:${qid} wdt:P373 ?cat;
                      wdt:P18 ?image.
            ?item wdt:P373 ?cat.
          }
        `;

        return await this.getItemsWithSparql(sparql);
    }

    async getItemsWithSparql(sparql: string) {
        const wdQuery = new WikidataQuery();
        const query = await wdQuery.call<
            { results?: { bindings: SparqlBinding[] } }
        >(sparql);

        if (!query.results) {
            throw new Error("Did not get any results");
        }

        // Throw out anything that doesn't have a category or image
        const results = query.results.bindings.filter((binding) => {
            return binding.cat && binding.image && binding.item;
        });

        return results.map((binding) => {
            return {
                "category": binding.cat!.value,
                "image": binding.image!.value.replace("http://", "https://"),
                "qid": binding.item!.value.replace(
                    "http://www.wikidata.org/entity/",
                    "",
                ),
            };
        });
    }

    async getLeaderboard(challenge: string | null = null) {
        const opts = !!challenge ? { id: challenge } : {};
        return await this.call<{
            total: number;
            stats: Array<{ user: string; edits: number }>;
        }>("leaderboard", opts);
    }

    async getPeopleByBirthyear(birthYear: number | string) {
        birthYear = parseInt(String(birthYear));

        const sparql = `
          select ?item ?image ?cat where {
            ?item wdt:P31 wd:Q5;
                  wdt:P18 ?image;
                  wdt:P373 ?cat;
                  wdt:P569 ?dateOfBirth. hint:Prior hint:rangeSafe true.
            FILTER("${birthYear}-00-00"^^xsd:dateTime <= ?dateOfBirth &&
                   ?dateOfBirth < "${birthYear + 1}-00-00"^^xsd:dateTime)
          } limit 2000
        `;

        return await this.getItemsWithSparql(sparql);
    }

    // We can only use items that have an image, a category
    // and are not a category themselves
    isValidItem(
        item: {
            qid: string;
            thumb?: string;
            label?: string | null;
            _item: ItemWithClaims;
        },
    ) {
        if (!item.thumb) {
            console.log(`candidateItem ${item.qid} has no thumb`);
            return false;
        }

        if (!item.label) {
            console.log(
                `candidateItem ${item.qid} has no label in the given language`,
            );
            return false;
        }

        const claims = item._item.claims;

        if (!claims || !("P373" in claims)) {
            console.log(`candidateItem ${item.qid} has no category`);
            return false;
        }

        if ("P31" in claims) {
            for (const claim of claims.P31) {
                const value =
                    (claim as {
                        mainsnak?: { datavalue?: { value?: { id?: string } } };
                    }).mainsnak?.datavalue?.value;
                if (value?.id === "Q4167836") {
                    console.log(`candidateItem ${item.qid} is a category`);
                    return false;
                }
            }
        }

        return true;
    }

    async itemDone(opts: Record<string, unknown>) {
        const req = await this.call<{ error?: string }>("item-done", opts);
        return req;
    }

    async itemsExist(qids: string[]) {
        const req = await this.post<Record<string, boolean>>("items-done", {
            qids: qids,
        });
        return req;
    }

    async itemExists(qid: string) {
        const req = await this.call<{ status?: boolean }>("item-exists", {
            qid,
        });
        return req.status ?? false;
    }

    async preloadImageBatch(titles: string[], size: number) {
        for (const title of titles) {
            await this.getPreloadedImageThumb(title, size);
        }
    }
}
