import { cleanupUrl } from "./util";

export function search(type, q) {
    var url = `
        https://www.wikidata.org/w/api.php
            ?action=wbsearchentities
            &origin=*
            &format=json
            &language=en
            &type=${type}
            &search=${encodeURIComponent(q)}
    `;

    url = cleanupUrl(url);

    return fetch(url).then((res) => res.json());
};