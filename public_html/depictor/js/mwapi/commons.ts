import MediawikiApi from "./mediawiki";

const COMMONS_NAMESPACE = 6;
const LIMIT = 500;

interface CommonsApiOpts {
    thumbSize?: number;
}

interface ImageSearchResults {
    error: { info: string };
    query: {
        search: {
            title: string;
            pageid: number;
        }[];
        searchinfo: { totalhits: number };
    };
    continue: { sroffset: number };
}

interface SearchResults {
    error: { info: string };
    query: {
        pages: Record<string, { imageinfo: { thumburl: string }[] }>;
    };
    continue: { sroffset: number };
}

export default class CommonsApi extends MediawikiApi {
    thumbSize: number;

    constructor(language: string, opts: CommonsApiOpts = {}) {
        super("https://commons.wikimedia.org/w/api.php", language);
        this.thumbSize = opts.thumbSize || 300;
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

        return await this.call(opts) as SearchResults;
    }

    async search(query: string) {
        const results = await this.call({
            action: "query",
            list: "search",
            srnamespace: COMMONS_NAMESPACE,
            srsearch: query,
        }) as ImageSearchResults;

        if (results.error) {
            throw new Error((results.error as { info?: string }).info);
        }

        const items = (results.query?.search ?? []).map((item) => {
            const title = item.title.replace("File:", "");
            return {
                ...item,
                filename: title,
                mid: `M${item.pageid}`,
                thumb: this.getThumb(title, this.thumbSize),
                url: `https://commons.wikimedia.org/wiki/${item.title}`,
            };
        });

        const hasNext = !!results.continue;

        return {
            count: results.query?.searchinfo?.totalhits ?? 0,
            hasNext,
            items,
            limit: LIMIT,
            // Note how we substract the limit from the offset, the Mediawiki API
            // really makes no sense
            offset: hasNext ? (results.continue!.sroffset ?? 0) - LIMIT : 0,
        };
    }
}
