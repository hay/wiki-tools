import { cleanupUrl, fetchJson } from './util.js';
import { fromPairs } from 'lodash';

function parseQuery(data) {
    let parsed = [];
    let normalized = {};
    let redirects = {};

    if ("normalized" in data) {
        normalized = fromPairs(data["normalized"].map(i => [ i["to"], i["from"] ]));
    }

    if ("redirects" in data) {
        redirects = fromPairs(data["redirects"].map(i => [ i["to"], i["from"] ]));
    }

    for (let key in data["pages"]) {
        const page = data["pages"][key];
        const title = page["title"];

        const item = { title };

        // This is pretty much voodo what happens here
        if (title in normalized) {
            item["normalized"] = normalized[title];
        }

        if (title in redirects) {
            item["redirect"] =  redirects[title];
        }

        if ("redirect" in item && item["redirect"] in normalized) {
            item["normalized"] = normalized[item["redirect"]];
        }

        parsed.push(item);
    }

    return parsed;
}

export function query({project, titles}) {
    return new Promise((resolve) => {
        titles = encodeURIComponent(titles.join('|'));

        const url = cleanupUrl(`
            https://${project}.org/w/api.php
                ?format=json
                &origin=*
                &redirects=1
                &action=query
                &prop=pageprops
                &titles=${titles}
        `);

        fetchJson(url).then((data) => {
            data = parseQuery(data["query"]);
            console.log(data);
            resolve(data);
        });
    });
}