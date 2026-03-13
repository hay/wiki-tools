import { getJson } from '../util';


export interface SparqlBinding {
    item?: { value: string };
    image?: { value: string };
    cat?: { value: string };
  }

export default class WikidataQuery {
    endpoint: string;

    constructor() {
        this.endpoint = 'https://query.wikidata.org/sparql';
    }

    async call<T>(sparql: string): Promise<T> {
        const params = {
            format : 'json',
            query : sparql
        };

        return await getJson(this.endpoint, params) as T;
    }
}
