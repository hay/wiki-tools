import { SPARQL_ENDPOINT } from "./conf";
import getBaseQuery from "./baseQuery";
import SparqlJs from "sparqljs";
import { clone } from "./util";

function getEmptyTriple() {
    return {
        "subject": "?item",
        "predicate": null,
        "object": null
    };
}

export default class Query {
    constructor(query = false) {
        this.generator = new SparqlJs.Generator();
        this.parser = new SparqlJs.Parser();
        this.query = query ? this.parser.parse(query) : getBaseQuery();
    }

    addEmptyTriple() {
        this.triples.push( getEmptyTriple() );
    }

    addRule(predicate, object) {
        this.triples.push({
            "subject" : "?item",
            predicate,
            object
        });
    }

    fetch() {
        const query = this.stringify();
        const url = SPARQL_ENDPOINT.replace('%s', encodeURIComponent(query));

        return new Promise((resolve, reject) => {
            fetch(url).then(function(res) {
                return res.json();
            }).then(function(results) {
                resolve(results.results.bindings);
            });
        });
    }

    removeTriple(triple) {
        this.triples = this.triples.filter((t) => t !== triple);
    }

    stringify() {
        // FIXME: this could be easier
        const query = clone(this.query);

        query.where = query.where.map((d) => {
            if (d.triples) {
                d.triples = d.triples.map((t) => {
                    t.object = t.object.replace('wd:', this.query.prefixes.wd);
                    t.predicate = t.predicate.replace('wdt:', this.query.prefixes.wdt);
                    return t;
                });
            }

            return d;
        });

        return this.generator.stringify(query);
    }

    get triples() {
        const triples = this.query.where.filter((d) => d.triples);
        return !!triples.length ? triples[0].triples : null;
    }

    set triples(triples) {
        this.query.where.forEach(function(d) {
            if (d.triples) {
                d.triples = triples;
            }
        })
    }

    get limit() { return this.query.limit; }

    set limit(limit) { this.query.limit = limit }
}