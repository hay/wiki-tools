import WikidataApi from './mwapi/wikidata.js';
import WikidataQuery from './mwapi/query.js';

export async function getPeople(birthYear) {
    const sparql = `
      SELECT ?item ?image ?cat WHERE {
        ?item wdt:P31 wd:Q5;
              wdt:P18 ?image;
              wdt:P373 ?cat;
              wdt:P569 ?dateOfBirth. hint:Prior hint:rangeSafe true.
        FILTER("${birthYear}-00-00"^^xsd:dateTime <= ?dateOfBirth &&
               ?dateOfBirth < "${birthYear + 1}-00-00"^^xsd:dateTime)
      }
    `;

    const wdQuery = new WikidataQuery();
    const results = await wdQuery.call(sparql);

    if (!results.results) {
        throw new Error('Did not get any results');
    }

    return results.results.bindings.map((binding) => {
        return {
            'category' : binding.cat.value,
            'image' : binding.image.value,
            'qid' : binding.item.value.replace('http://www.wikidata.org/entity/', '')
        };
    });
}

export async function getPerson(qid, locale) {
    const api = new WikidataApi(locale);
    const person = await api.get('item', qid);
    return person;
}