import MediawikiApi from "./mediawiki";

interface CommonsApiOpts {
    thumbSize?: number;
}

interface SearchItem {
    title: string;
    pageid: number;
}

interface SearchResults {
    error?: { info?: string };
    query?: {
        search: SearchItem[];
        searchinfo?: { totalhits?: number };
        pages?: Record<string, { imageinfo?: { thumburl?: string }[] }>;
    };
    continue?: { sroffset?: number };
}

// Wikibase EntityData JSON structure (Special:EntityData/{id}.json)
interface WikibaseEntityIdValue {
    id?: string;
}

interface WikibaseTimeValue {
    time?: string;
}

interface WikibaseGlobeCoordinateValue {
    latitude?: number;
    longitude?: number;
}

type WikibaseDataValue =
    | { type: "wikibase-entityid"; value: WikibaseEntityIdValue }
    | { type: "time"; value: WikibaseTimeValue }
    | { type: "globecoordinate"; value: WikibaseGlobeCoordinateValue };

interface WikibaseUnknownDataValue {
    type: string;
    value: unknown;
}

type WikibaseRawDataValue = WikibaseDataValue | WikibaseUnknownDataValue;

const isKnownDataValue = (dv: WikibaseRawDataValue): dv is WikibaseDataValue =>
    ["wikibase-entityid", "time", "globecoordinate"].includes(dv.type);

interface WikibaseMainsnak {
    datavalue?: WikibaseRawDataValue;
}

interface WikibaseStatement {
    mainsnak?: WikibaseMainsnak;
}

interface WikibaseEntity {
    statements?: Record<string, WikibaseStatement[]>;
}

interface EntityDataResponse {
    entities: Record<string, WikibaseEntity>;
}

export default class CommonsApi extends MediawikiApi {
    thumbSize: number;

    constructor(language: string, opts: CommonsApiOpts = {}) {
        super("https://commons.wikimedia.org/w/api.php", language);
        this.thumbSize = opts.thumbSize || 300;
    }

    async entityData(mid: string): Promise<EntityDataResponse> {
        // Note that this endpoint is different than the regular API endpoint
        const endpoint =
            `https://commons.wikimedia.org/wiki/Special:EntityData/${mid}.json`;
        const req = await window.fetch(endpoint);
        const data = (await req.json()) as EntityDataResponse;
        return data;
    }

    async entityStatements(mid: string) {
        const entity = await this.entityData(mid);
        const data: Record<string, unknown> = {};
        const entities: string[] = [];

        // First collect all of the statements
        const stats = entity.entities[mid].statements;

        for (const prop in stats) {
            data[prop] = [];
            entities.push(prop);

            for (const stat of stats[prop]) {
                const mainsnak = stat.mainsnak;
                // Non-datavalues are not supported yet
                if (!mainsnak?.datavalue) {
                    continue;
                }

                const rawDatavalue = mainsnak.datavalue;

                if (!isKnownDataValue(rawDatavalue)) {
                    (data[prop] as unknown[]).push({
                        type: "unsupported",
                        value: null,
                    });
                    continue;
                }

                switch (rawDatavalue.type) {
                    case "wikibase-entityid": {
                        const qid = rawDatavalue.value.id;
                        (data[prop] as unknown[]).push({
                            type: rawDatavalue.type,
                            value: qid,
                        });
                        entities.push(qid!);
                        break;
                    }
                    case "time":
                        (data[prop] as unknown[]).push({
                            type: rawDatavalue.type,
                            value: rawDatavalue.value.time,
                        });
                        break;
                    case "globecoordinate":
                        (data[prop] as unknown[]).push({
                            type: rawDatavalue.type,
                            value:
                                `${rawDatavalue.value.latitude},${rawDatavalue.value.longitude}`,
                        });
                        break;
                }
            }
        }

        // Get labels for all entities
        const labels = await this.getEntityLabels(entities);

        // And now, repopulate with the labels
        for (const prop in data) {
            const items = data[prop] as {
                type: string;
                value: string | null;
            }[];

            data[prop] = {
                propLabel: labels[prop],
                items: items.map((item) => {
                    let label: string;

                    if (item.type === "wikibase-entityid") {
                        label = labels[item.value!] ?? "";
                    } else {
                        label = String(item.value);
                    }

                    return {
                        label: label,
                        type: item.type,
                        value: item.value,
                    };
                }),
            };
        }

        return data;
    }

    async getEntityLabels(entities: string[]) {
        const opts = {
            action: "wbgetentities",
            ids: entities.filter((e) => !!e).join("|"),
            props: "labels",
            languages: this.language === "en" ? "en" : `${this.language}|en`,
        };

        const results = await this.call<
            {
                entities: Record<
                    string,
                    { labels?: Record<string, { value: string }> }
                >;
            }
        >(opts);
        const labels: Record<string, string> = {};

        for (const entity in results.entities) {
            const allLabels = results.entities[entity].labels;

            if (allLabels?.[this.language]) {
                labels[entity] = allLabels[this.language].value;
            } else {
                labels[entity] = allLabels?.["en"]?.value ?? "";
            }
        }

        return labels;
    }

    // This uses imageinfo instead of the filepath hack
    async getImageThumb(title: string, width: number) {
        const results = await this.imageinfo(title, {
            "iiprop": "url",
            "iiurlwidth": width,
        });

        if (results.error) {
            throw new Error(String(results.error));
        }

        if (!results.query) {
            return null;
        }

        const page = Object.values(results.query.pages ?? {})[0];
        return page?.imageinfo?.[0]?.thumburl ?? null;
    }

    getThumb(title: string, size: number | null = null) {
        // So many HTTP 429 requests, even if we use the imageinfo API call
        size = size ?? this.thumbSize;
        const encodedTitle = window.encodeURIComponent(title);
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedTitle}?width=${size}`;
    }

    async imageinfo(
        titles: string | string[],
        opts: Record<string, unknown> = {},
    ) {
        const titleArray = typeof titles === "string" ? [titles] : titles;

        opts = Object.assign({
            action: "query",
            prop: "imageinfo",
            titles: titleArray.join("|"),
            iiextmetadatalanguage: this.language,
        }, opts);

        const results = await this.call<SearchResults>(opts);
        return results;
    }

    async opensearch(query: string, opts: Record<string, unknown> = {}) {
        opts = Object.assign({
            action: "opensearch",
            namespace: "*",
            limit: 10,
            search: query,
        }, opts);

        const results = await this.call<[string, string[], string[], string[]]>(
            opts,
        );
        const arr = Array.isArray(results)
            ? results as [string, string[], string[], string[]]
            : [[], [], [], []];

        return {
            query: query,
            results: arr[1].map((label: string, index: number) => ({
                label: label,
                description: arr[2][index] ?? "",
                url: arr[3][index] ?? "",
            })),
        };
    }

    async search(
        query: string,
        opts: Partial<
            {
                namespace: number;
                limit: number;
                sroffset: number;
                thumbSize: number;
            }
        > = {},
    ) {
        opts = Object.assign({
            limit: 500,
            namespace: "*",
            sroffset: 0,
            thumbSize: this.thumbSize,
        }, opts);

        const results = await this.call<SearchResults>({
            action: "query",
            list: "search",
            srlimit: opts.limit,
            srnamespace: opts.namespace,
            sroffset: opts.sroffset,
            srsearch: query,
        });

        if (results.error) {
            throw new Error(results.error.info ?? "Unknown error");
        }

        const items = (results.query?.search ?? []).map((item: SearchItem) => {
            const title = item.title.replace("File:", "");
            return {
                ...item,
                filename: title,
                mid: `M${item.pageid}`,
                thumb: this.getThumb(title, opts.thumbSize),
                url: `https://commons.wikimedia.org/wiki/${item.title}`,
            };
        });

        const hasNext = !!results.continue;

        return {
            count: results.query?.searchinfo?.totalhits ?? 0,
            hasNext: hasNext,
            items: items,
            limit: opts.limit,
            // Note how we substract the limit from the offset, the Mediawiki API
            // really makes no sense
            offset: hasNext
                ? (results.continue!.sroffset ?? 0) - (opts.limit as number)
                : 0,
        };
    }
}
