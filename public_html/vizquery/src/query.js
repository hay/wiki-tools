import { SPARQL_ENDPOINT, WIKIDATA_ITEM, WIKIDATA_PROPERTY } from "./conf";
import getBaseQuery from "./baseQuery";
import SparqlJs from "sparqljs";
import { clone, hashString } from "./util";

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
            subject : "?item",
            predicate : predicate.replace('wdt:', WIKIDATA_PROPERTY),
            object : object.replace('wd:', WIKIDATA_ITEM)
        });
    }

    hashTriple(triple) {
        const string = Object.values(triple).join('-');
        return hashString(string);
    }

    removeTriple(triple) {
        this.triples = this.triples.filter((t) => t !== triple);
    }

    stringify() {
        return this.generator.stringify(this.query);
    }

    get subjects() {
        if (!this.triples) {
            return [];
        } else {
            const subjects = [];

            this.triples.forEach((t) => {
                Object.values(t).forEach((d) => {
                    if (d && d[0] === '?' && !subjects.includes(d)) {
                        subjects.push(d);
                    }
                });
            });

            return subjects;
        }
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