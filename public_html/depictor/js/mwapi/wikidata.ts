import MediawikiApi from './mediawiki';

export default class WikidataApi extends MediawikiApi {
    constructor(language: string) {
        super('https://www.wikidata.org/w/api.php', language);
    }

    async get(type: string, q: string) {
        // This is just using 'search' and getting the first item
        const items = await this.search(type, q);
        return items.length ? items[0] : null;
    }

    async search(type: string, q: string) {
        const results = await this.call({
            action : 'wbsearchentities',
            language : this.language,
            uselang : this.language,
            search : q,
            type : type
        }) as { search?: unknown[] };

        return results.search && results.search.length ? results.search : [];
    }
}
