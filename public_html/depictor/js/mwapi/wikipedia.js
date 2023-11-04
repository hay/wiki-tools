import { getJson } from 'donot';
import { encodeWikiTitle } from '../util.js';

export class WikipediaApi {
    constructor(language) {
        this.language = language;
        this.endpoint = `https://${this.language}.wikipedia.org/api/rest_v1`;
    }

    async getSummary(title) {
        const url = `${this.endpoint}/page/summary/${encodeWikiTitle(title)}`;
        const req = await getJson(url);
        return req;
    }
}