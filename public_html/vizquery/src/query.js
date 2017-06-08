import { SPARQL_ENDPOINT } from "./conf";
import template from "./query-template";
import _ from "underscore";

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
                property : 'P18',
                value : '?image'
            });
        }

        view.where = view.where.map(function(v) {
            var val = v.value.trim();
            v.value = val.charAt(0) === "Q" ? "wd:" + val : val;
            return v;
        })

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