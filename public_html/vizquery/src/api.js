import { fetchJson } from "./util.js";
import { LANGUAGE, WIKIDATA_PROPERTY, SPARQL_ENDPOINT, USES_COMMONS } from "./conf.js";

// Should probably replace fetchJson sometime later
async function getJson(url) {
    const req = await window.fetch(url);
    return await req.json();
}

// Change the URL to correct endpoint
// http://commons.wikimedia.org/entity/M79181723
// https://commons.wikimedia.org/wiki/Special:EntityData/M79181723
async function getMidData(mid) {
    const url = `https://commons.wikimedia.org/wiki/Special:EntityData/${mid}`;
    const jsonUrl = `${url}.json`;
    const data = await getJson(jsonUrl);
    const title = data.entities[mid].title.replace("File:", "");
    const thumb = `https://commons.wikimedia.org/wiki/Special:FilePath/${title}?width=300`;

    return { url, mid, title, thumb };
}

async function transformCommons(d) {
    if (d.item.value) {
        const mid = d.item.value.replace('http://commons.wikimedia.org/entity/', '');

        let midData;

        try {
            midData = await getMidData(mid);
        } catch (e) {
            return d;
        }

        d.item.value = midData.url;
        d.thumb = midData.thumb;
    }

    return d;
}

function transformProperty(item) {
    // This is a hack because for some reason the search API gives
    // back properties in the 'entity' form instead of property form
    if (item.id[0] === 'P') {
        item.concepturi = WIKIDATA_PROPERTY + item.id;
    }

    return item;
}

export async function query(query) {
    const url = SPARQL_ENDPOINT.replace('%s', encodeURIComponent(query));
    const results = await getJson(url);
    const queryResults = [];

    for (let d of results.results.bindings) {
        if (d.image) {
            d.thumb = d.image.value + '?width=300';

            // For some reason WD Query gives back http links to
            // Commons, let's convert those to https
            d.thumb = d.thumb.replace('http://', 'https://');
        }

        if (d.item) {
            d.id = d.item.value.replace('http://www.wikidata.org/entity/', '');
        }

        if (USES_COMMONS) {
            d = await transformCommons(d);
        }

        queryResults.push(d);
    }

    return queryResults;
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
    // The wbsearchentities method doesn't return results anymore for the
    // direct link to property or entity, so this is a bit of a hack
    q = q.split('/').pop();

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