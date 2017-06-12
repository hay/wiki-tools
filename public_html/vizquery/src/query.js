import { SPARQL_ENDPOINT } from "./conf";
import template from "./query-template";
import _ from "underscore";

function addClaimValue(claim) {
    if (!claim.value.value) {
        claim.value.value = `wd:${claim.value.id}`;
    }

    return claim;
}

export default class Query {
    build(q) {
        return template({
            where : _.where(q, { 'has' : 'where' }).map(addClaimValue),
            minus : _.where(q, { 'has' : 'minus' }).map(addClaimValue),
            limit : q.limit
        });
    }

    fetch(query, callback) {
        var url = SPARQL_ENDPOINT.replace('%s', encodeURIComponent(query));

        fetch(url).then(function(res) {
            return res.json();
        }).then(function(results) {
            callback(results.results.bindings);
        });
    }
};