import { getJson } from '../util';
import type { SparqlBinding } from '../types';

export default class WikidataQuery {
    endpoint: string;

    constructor() {
        this.endpoint = 'https://query.wikidata.org/sparql';
    }

    async call(sparql: string) {
        const params = {
            format : 'json',
            query : sparql
        };

        return await getJson(this.endpoint, params) as Promise<{ results?: { bindings: SparqlBinding[] } }>;
    }
}
