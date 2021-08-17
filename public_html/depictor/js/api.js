import { IMAGE_SIZE } from './const.js';
import CommonsApi from './mwapi/commons.js';
import WikidataApi from './mwapi/wikidata.js';
import WikidataQuery from './mwapi/query.js';

export default class Api {
    constructor(locale) {
        this.locale = locale;
    }

    async getCandidates(qid, category) {
        const api = new CommonsApi(this.locale, {
            thumbSize : IMAGE_SIZE
        });

        const query = `-haswbstatement:P180=${qid} incategory:"${category}"`;
        const req = await api.search(query, {
            'namespace' : 6 // Only get the File: namespace
        });

        if (req.error) {
            throw new Error(req.error.info);
        }

        if (!req.items.length) {
            throw new Error("No candidates");
        }

        return req.items;
    }

    async getPeople(birthYear) {
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

    async getPerson(qid) {
        const api = new WikidataApi(this.locale);
        const person = await api.get('item', qid);
        return person;
    }
}