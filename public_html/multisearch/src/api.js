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

        item["available"] = (!("missing" in page) && !("invalid" in page));

        if ("pageprops" in page && "wikibase_item" in page["pageprops"]) {
            item["wikibase_item"] = page["pageprops"]["wikibase_item"];
        }

        parsed.push(item);
    }

    return parsed;
}

export function resultsToTable(results, project) {
    return results.map((r) => {
        return {
            'available' : r.available,
            'title' : r.title,
            'wikidata_id' : r.wikibase_item ? r.wikibase_item : null,
            'wikidata_link' : r.wikibase_item ? `http://www.wikidata.org/entity/${r.wikibase_item}` : null,
            'wikipedia_link' : r.available ? `https://${project}.org/wiki/${r.title}` : null
        };
    });
}

export function query({project, titles}) {
    return new Promise((resolve, reject) => {
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
            resolve(data);
        }).catch(err => reject(err));
    });
}