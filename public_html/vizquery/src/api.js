import { getJson } from "./util";
import { LANGUAGE } from "./conf";

export function search(type, q) {
    return getJson(`
        https://www.wikidata.org/w/api.php
            ?action=wbsearchentities
            &origin=*
            &format=json
            &language=${LANGUAGE}
            &type=${type}
            &search=${encodeURIComponent(q)}
    `);
};

export function get(id) {
    return getJson(`
        https://www.wikidata.org/w/api.php
            ?action=wbgetentities
            &ids=${id}
            &languages=${LANGUAGE}
            &props=info|aliases|labels|descriptions|datatype
            &origin=*
            &format=json
    `);
}