import { getJson } from '../util';

export default class MediawikiApi {
    endpoint: string;
    language: string;

    constructor(endpoint: string, language: string = 'en') {
        this.endpoint = endpoint;
        this.language = language;
    }

    async call<T>(params: Record<string, unknown>): Promise<T> {
        params = Object.assign(params, {
            origin : '*',
            format : 'json'
        });

        return await getJson(this.endpoint, params as Record<string, string>);
    }
}
