import { every, values } from 'lodash';
import {
    WIKIDATA_ITEM,
    WIKIDATA_PROPERTY
} from "./conf";
import { BASE_QUERY } from "./queries.js";
import SparqlJs from "sparqljs";
import { hashString } from "./util";

function getEmptyTriple() {
    return {
        "object": null,
        "predicate": null,
        "subject": "?item"
    };
}

export default class Query {
    constructor(query = BASE_QUERY) {
        this.generator = new SparqlJs.Generator();
        this.parser = new SparqlJs.Parser();
        this.query = this.parser.parse(query);
    }

    addEmptyTriple() {
        // Add the necessary structure for having triples if there are none
        if (this.triples.length === 0) {
            this.query.where.unshift({
                triples : [],
                type : 'bgp'
            })
        }

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

    get limit() {
        return this.query.limit;
    }

    set limit(limit) {
        this.query.limit = limit;
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
        // For now we only show the bgp stuff, and nothing else
        const triples = this.query.where.filter((d) => d.triples);
        return !!triples.length ? triples[0].triples : [];
    }

    set triples(triples) {
        this.query.where.forEach((d) => {
            if (d.triples) {
                d.triples = triples;
            }
        });
    }

    get validTriples() {
        const filled = this.triples.map(t => every(values(t)));
        return !!(every(filled) && filled.length);
    }
}