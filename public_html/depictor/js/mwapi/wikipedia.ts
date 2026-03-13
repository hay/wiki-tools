import { getJson } from '../util';
import { encodeWikiTitle } from '../util';

export class WikipediaApi {
    language: string;
    endpoint: string;

    constructor(language: string) {
        this.language = language;
        this.endpoint = `https://${this.language}.wikipedia.org/api/rest_v1`;
    }

    async getSummary(title: string) {
        const url = `${this.endpoint}/page/summary/${encodeWikiTitle(title)}`;
        const req = await getJson(url);
        return req;
    }
}
