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

function where(where) {
    return where.map(d => `?item wdt:${d.property}} ${d.value}} .`);
}

function minus(minus) {
    if (!minus.length) return;

    minus = minus.map(d => `?item wdt:${property}} wd:${value}} .`);

    return `MINUS { ${minus} }`;
}

export default function query(view) {
    return `
        ${PREFIXES}

        SELECT ?item ?itemLabel ?itemDescription ?image WHERE {
            ${where(view.where)}
            ${minus(view.minus)}
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        } LIMIT ${view.limit}
    `;
};