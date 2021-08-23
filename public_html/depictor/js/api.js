import { getJson } from 'donot';
import { DB_ITEM_PROPERTIES, IMAGE_SIZE, LOCAL_API_ENDPOINT} from './const.js';
import { objectHasFilledProperties, buildUrlQuery } from './util.js';
import CommonsApi from './mwapi/commons.js';
import WikidataApi from './mwapi/wikidata.js';
import WikidataQuery from './mwapi/query.js';

export default class Api {
    constructor(locale) {
        this.locale = locale;
    }

    async addDbItem(payload) {
        if (!objectHasFilledProperties(DB_ITEM_PROPERTIES, payload)) {
            throw new Error("Database item does not have valid properties");
        }

        const url = `${LOCAL_API_ENDPOINT}?${buildUrlQuery(payload)}`;
        const req = await getJson(url);
    }

    async getCandidates(qid, category) {
        const api = new CommonsApi(this.locale, {
            thumbSize : IMAGE_SIZE
        });

        // Find only bitmaps that don't have a P180 statement for the person in the stated category
        const query = `-haswbstatement:P180=${qid} incategory:"${category}" filetype:bitmap`;
        const req = await api.search(query, {
            'namespace' : 6 // Only get the File: namespace
        });

        if (req.error) {
            throw new Error(req.error.info);
        }

        if (!req.items.length) {
            throw new Error(`No candidates for ${qid}`);
        }

        return req.items;
    }

    async getExists(type, id) {
        if (!['item', 'file'].includes(type)) {
            throw new Error("Invalid type for getExists");
        }

        const query = buildUrlQuery({
            action : 'exists',
            type : type,
            itemid : id
        });

        const url = `${LOCAL_API_ENDPOINT}?${query}`;
        const req = await getJson(url);
        return req.status;
    }

    async getItemByCommonsCategory(category) {
        const sparql = `
            select ?item ?image ?cat where {
              ?item wdt:P18 ?image;
                    wdt:P373 "${category}";
                    wdt:P373 ?cat.
            }
        `;

        let items = await this.getItemsWithSparql(sparql);
        return items;
    }

    async getItemByQid(qid) {
        const sparql = `
          select ?item ?image ?cat where {
            wd:${qid} wdt:P18 ?image;
                      wdt:P373 ?cat;
                      wikibase:timestamp ?item.
          }
        `;

        let items = await this.getItemsWithSparql(sparql);

        // FIXME: probably a way to do this with SPARQL, but i can't be bothered
        items = items.map((item) => {
            item.qid = qid;
            return item;
        });

        return items;
    }

    async getItemsWithSparql(sparql) {
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

    async getItem(qid) {
        const api = new WikidataApi(this.locale);
        const item = await api.get('item', qid);

        // Make sure this property is available as well
        item.qid = qid;

        return item;
    }

    async getPeopleByBirthyear(birthYear) {
        birthYear = parseInt(birthYear);

        const sparql = `
          select ?item ?image ?cat where {
            ?item wdt:P31 wd:Q5;
                  wdt:P18 ?image;
                  wdt:P373 ?cat;
                  wdt:P569 ?dateOfBirth. hint:Prior hint:rangeSafe true.
            FILTER("${birthYear}-00-00"^^xsd:dateTime <= ?dateOfBirth &&
                   ?dateOfBirth < "${birthYear + 1}-00-00"^^xsd:dateTime)
          } limit 2000
        `;

        return await this.getItemsWithSparql(sparql);
    }
}