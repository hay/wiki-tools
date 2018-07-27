import {
    CONDITION_OPTIONS,
    SPARQL_ENDPOINT,
    WIKIDATA_ITEM,
    WIKIDATA_PROPERTY
} from "./conf";
import { BASE_QUERY } from "./queries.js";
import SparqlJs from "sparqljs";
import { uniq } from 'lodash';
import { compose } from 'lodash/fp';
import { clone, hashString } from "./util";

const conditionOptions = Object.keys(CONDITION_OPTIONS);

function addVariablesToQuery(query, variables) {
    // The variables array can have both strings and objects with a
    // 'value' object that contains the string as the property 'value',
    // so we need to check for both
    function includes(needle) {
        for (let val of variables) {
            if (typeof val !== 'string') {
                val = val.value;
            }

            if (val === needle) {
                return true;
            }
        }

        return false;
    }

    variables.forEach((v) => {
        const vLabel = `${v}Label`;

        if (!includes(v)) {
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
        "object": null,
        "predicate": null,
        "subject": "?item"
    };
}

function getTriples(query) {
    const triples = [];

    query.where.forEach((where) => {
        if (where.triples) {
            where.triples.forEach((triple) => {
                if (conditionOptions.includes(where.type)) {
                    triple.condition = where.type;
                    triples.push(triple);
                }
            });
        }

        if (where.patterns) {
            where.patterns.forEach((pattern) => {
                if (pattern.triples) {
                    pattern.triples.forEach((triple) => {
                        if (conditionOptions.includes(where.type)) {
                            triple.condition = where.type;
                            triples.push(triple);
                        }
                    });
                }
            });
        }
    });

    return triples;
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
    constructor(query = BASE_QUERY) {
        this.generator = new SparqlJs.Generator();
        this.parser = new SparqlJs.Parser();
        this.query = this.parser.parse(query);
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
        console.log(query);
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
        const triples = getTriples(this.query);
        console.log('triples', triples);
        return triples;
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