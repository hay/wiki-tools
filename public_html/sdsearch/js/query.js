import CommonsApi from './commons-api.js';

export default class Query {
    constructor() {
        this.api = new CommonsApi();
    }

    async search(query, offset = 0) {
        const results = await this.api.search(query, {
            namespace : 6,
            limit : 20,
            sroffset : offset
        });

        return results;
    }
}