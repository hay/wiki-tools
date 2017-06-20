import Query from "./query";

const BASE_QUERY = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX schema: <http://schema.org/>
PREFIX bd: <http://www.bigdata.com/rdf#>
SELECT DISTINCT ?item ?itemLabel ?itemDescription (SAMPLE(?image) AS ?image) ?sitelink WHERE {
  %query%
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL {
    ?sitelink schema:about ?item.
    ?sitelink schema:isPartOf <https://en.wikipedia.org/>.
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,fr,es,de,ru,it,nl,ja,zh,pl,cs". }
}
GROUP BY ?item ?itemLabel ?itemDescription ?sitelink
LIMIT 50
`;

const EXAMPLES = `
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

# Paintings of women by Vincent van Gogh in the Van Gogh museum
?item wdt:P31 wd:Q3305213 ;
      wdt:P170 wd:Q5582 ;
      wdt:P921 wd:Q467 ;
      wdt:P276 wd:Q224124 .

# World heritage sites of countries with a female head of government
?item wdt:P1435 wd:Q9259;
      wdt:P17 ?country.
?country wdt:P6 ?person.
?person wdt:P21 wd:Q6581072.

# Vegetarians who are married to to a vegeterian
?item wdt:P31 wd:Q5;
      wdt:P1576 wd:Q18338317;
      wdt:P26 ?spouse.
?spouse wdt:P1576 wd:Q18338317.
`;

function parseExamples(data) {
    const examples = [];
    let e = false;

    data.trim().split('\n').forEach((line) => {
        if (line[0] === '#') {
            if (e) {
                examples.push(e);
            }

            e = {
                query : ''
            };

            e.description = line.replace('#', '').trim();
        } else {
            e.query += line + '\n';
        }
    });

    examples.push(e);

    return examples.map((e) => {
        e.query = BASE_QUERY.replace('%query%', e.query);
        return e;
    });
}

export default parseExamples(EXAMPLES);