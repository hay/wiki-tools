import MediawikiApi from './mediawiki.js';

export default class WikidataApi extends MediawikiApi {
    constructor(language) {
        super('https://www.wikidata.org/w/api.php', language);
    }

    async get(type, q) {
        // This is just using 'search' and getting the first item
        const items = await this.search(type, q);
        return items.length ? items[0] : null;
    }

    async search(type, q) {
        const results = await this.call({
            action : 'wbsearchentities',
            language : this.language,
            uselang : this.language,
            search : q,
            type : type
        });

        return results.search && results.search.length ? results.search : [];
    };
}