const PREFIXES = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX bd: <http://www.bigdata.com/rdf#>
`;

function claims(claims) {
    return claims.map(d => `?item wdt:${d.property.id} ${d.value.value} .`).join('\n');
}

function minus(minus) {
    if (!minus.length) {
        return '';
    } else {
        return `MINUS { ${claims(minus)} }`;
    }
}

// '0' equals no limit
function limit(limit) {
    return parseInt(limit) === 0 ? '' : `LIMIT ${limit}`
}

export default function query(view) {
    return `
${PREFIXES}

SELECT ?item ?itemLabel ?itemDescription ?image WHERE {
    ${claims(view.where)}
    ${minus(view.minus)}
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} ${limit(view.limit)}`;
};