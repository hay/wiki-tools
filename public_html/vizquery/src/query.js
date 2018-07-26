import { SPARQL_ENDPOINT, WIKIDATA_ITEM, WIKIDATA_PROPERTY } from "./conf";
import getBaseQuery from "./baseQuery";
import SparqlJs from "sparqljs";
import { uniq } from 'lodash';
import { compose } from 'lodash/fp';
import { clone, hashString } from "./util";

function addVariablesToQuery(query, variables) {
    variables.forEach((v) => {
        const vLabel = `${v}Label`;

        if (!query.variables.includes(v)) {
            query.variables.push(v, vLabel);

            query.group.push(
                { expression : v },
                { expression : vLabel }
            );
        }
    });

    return query;
}

function getEmptyTriple() {
    return {
        "subject": "?item",
        "predicate": null,
        "object": null
    };
}

function getTriples(query) {
    const triples = query.where.filter((d) => d.triples);
    return !!triples.length ? triples[0].triples : null;
}

function getVariablesFromTriples(triples) {
    let  variables = [];

    triples.forEach((triple) => {
        variables = variables.concat(Object.values(triple));
    });

    return uniq(variables).filter(v => v[0] === '?');
}

const getTripleVariablesFromQuery = compose(getVariablesFromTriples, getTriples);

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

    get query() {
        return this._query;
    }

    set query(query) {
        const variables = getTripleVariablesFromQuery(query);
        query = addVariablesToQuery(query, variables);
        this._query = query;
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
        return getTriples(this.query);
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