import { fetchJson } from "./util";
import { LANGUAGE, WIKIDATA_PROPERTY } from "./conf";

function transformProperty(item) {
    // This is a hack because for some reason the search API gives
    // back properties in the 'entity' form instead of property form
    if (item.datatype === 'wikibase-item' && item.id[0] === 'P') {
        item.concepturi = WIKIDATA_PROPERTY + item.id;
    }

    return item;
}

export function search(type, q) {
    return new Promise((resolve, reject) => {
        fetchJson(`
            https://www.wikidata.org/w/api.php
                ?action=wbsearchentities
                &origin=*
                &format=json
                &language=${LANGUAGE}
                &type=${type}
                &search=${encodeURIComponent(q)}
        `).then((results) => {
            resolve(results.search.map(transformProperty));
        });
    });
};

export function searchAndGet(type, q) {
    return search(type, q).then((d) => {
        return new Promise((resolve, reject) => {
            const items = d.filter((i) => Object.values(i).includes(q));

            if (items.length) {
                const item = transformProperty(items[0]);
                resolve(item);
            } else {
                reject();
            }
        });
    });
}

export function get(id) {
    return fetchJson(`
        https://www.wikidata.org/w/api.php
            ?action=wbgetentities
            &ids=${id}
            &languages=${LANGUAGE}
            &props=info|aliases|labels|descriptions|datatype
            &origin=*
            &format=json
    `);
}