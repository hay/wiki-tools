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
        var view = {
            where : _.where(q, { 'has' : 'where' }),
            minus : _.where(q, { 'has' : 'minus' }),
            limit : q.limit
        };

        var hasimage = !!_.findWhere(q, { has : 'image' });

        if (hasimage) {
            view.where.push({
                property : {
                    id : 'P18'
                },
                value : {
                    value : '?image'
                }
            });
        }

        view.where = view.where.map(addClaimValue);
        view.minus = view.minus.map(addClaimValue);

        return template(view);
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