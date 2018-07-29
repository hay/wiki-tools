import {
  DEFAULT_RESULT_LIMIT,
  LABEL_LANGUAGES,
  LANGUAGE
} from "./conf";

import { parseExamples } from './util.js';

const NAMESPACES = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX schema: <http://schema.org/>
PREFIX bd: <http://www.bigdata.com/rdf#>
`;

const LABEL_SERVICE = `
SERVICE wikibase:label { bd:serviceParam wikibase:language "${LABEL_LANGUAGES}". }
`;

const LIMIT = `LIMIT ${DEFAULT_RESULT_LIMIT}`;

const SITELINK_TRIPLE = `
OPTIONAL {
  ?sitelink schema:about ?item.
  ?sitelink schema:isPartOf <https://${LANGUAGE}.wikipedia.org/>.
}`;

const IMAGE_TRIPLE = `
OPTIONAL { ?item wdt:P18 ?image. }
`;

function baseQuery(triples = '') {
    return `
${NAMESPACES}
SELECT DISTINCT ?item ?itemLabel ?itemDescription (SAMPLE(?image) AS ?image) ?sitelink WHERE {
    ${triples}
    ${IMAGE_TRIPLE}
    ${SITELINK_TRIPLE}
    ${LABEL_SERVICE}
} GROUP BY ?item ?itemLabel ?itemDescription ?sitelink
${LIMIT}
    `;
}

const BASE_QUERY = baseQuery();

const EXAMPLES = parseExamples(`
# Cats
?item wdt:P31 wd:Q146 .

# World Heritage sites in the Netherlands
?item wdt:P1435 wd:Q9259;
      wdt:P17 wd:Q55 .

# Movies with both Joe Pesci and Robert De Niro
?item wdt:P161 wd:Q36949, wd:Q20178 .

# Train stations in the Czech Republic
?item wdt:P31 wd:Q55488;
      wdt:P17 wd:Q213 .

# Municipalities in the province of Gelderland, the Netherlands
?item wdt:P31 wd:Q2039348;
      wdt:P131 wd:Q775 .

# Female trumpet players
?item wdt:P31 wd:Q5 ;
      wdt:P1303 wd:Q8338 ;
      wdt:P21 wd:Q6581072 .

# Items with VIAF number 113230702
?item wdt:P214 "113230702".

# Cities with female mayors
?item wdt:P31 wd:Q515 ;
      wdt:P6 ?person .
?person wdt:P21 wd:Q6581072 .

# Self-portraits of Van Gogh in the Van Gogh museum in Amsterdam
?item wdt:P31 wd:Q3305213;
      wdt:P170 wd:Q5582;
      wdt:P136 wd:Q192110;
      wdt:P276 wd:Q224124 .

# Vegetarians who are married to a vegeterian
?item wdt:P31 wd:Q5;
      wdt:P1576 wd:Q83364;
      wdt:P26 ?spouse.
?spouse wdt:P1576 wd:Q83364.
`).map((e) => {
    e.query = baseQuery(e.query).trim();
    return e;
});

export { BASE_QUERY, EXAMPLES };