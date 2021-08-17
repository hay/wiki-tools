import { getJson } from 'donot';

export default class WikidataQuery {
    constructor() {
        this.endpoint = 'https://query.wikidata.org/sparql';
    }

    async call(sparql) {
        const params = {
            format : 'json',
            query : sparql
        };

        return await getJson(this.endpoint, params);
    }
}