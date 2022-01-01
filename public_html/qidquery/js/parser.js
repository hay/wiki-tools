export default class Parser {
    constructor(input, opts) {
        this.input = input;
        this.opts = opts;
    }

    getQuery() {
        const lines = this.input.trim().split('\n').map((line) => {
            line = line.trim();

            // Check if we have an URL and try to extract the QID
            if (line.startsWith('http')) {
                line = line.split('/').pop();
            }

            if (line.charAt(0) !== 'Q') {
                // If we're skipping invalid QIDs, just remove it
                // Otherwise throw an error
                if (this.opts.skipInvalid) {
                    line = '';
                } else {
                    throw new Error(`Invalid QID: ${line}`);
                }
            } else {
                line = `wd:${line}`;
            }

            return line;
        }).filter(l => !!l);

        // Now create the query
        const values = lines.join(' ');

        let labels = [];

        if (this.opts.addLabel) {
            labels.push('?itemLabel');
        }

        if (this.opts.addDescription) {
            labels.push('?itemDescription');
        }

return `select ?item ${labels.join(' ')} where {
    values ?item { ${values} }.
    service wikibase:label { bd:serviceParam wikibase:language "${this.opts.language}". }
}`;
    }

    getQueryUrl() {
        const query = this.getQuery().trim();
        const q = window.encodeURIComponent(query);
        const url = `https://query.wikidata.org/#${q}`;
        return url;
    }
}