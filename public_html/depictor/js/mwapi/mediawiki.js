import { getJson } from '../util.js';

export default class MediawikiApi {
    constructor(endpoint, language = 'en') {
        this.endpoint = endpoint;
        this.language = language;
    }

    async call(params) {
        params = Object.assign(params, {
            origin : '*',
            format : 'json'
        });

        return await getJson(this.endpoint, params);
    }
}