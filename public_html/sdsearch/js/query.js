export default class Query {
    constructor(query) {
        this.query = query;
    }

    search() {
        console.log(this.query);
    }
}