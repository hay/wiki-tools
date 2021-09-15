import { getJson } from 'donot';
import { IMAGE_SIZE, LOCAL_API_ENDPOINT, THUMB_SIZE} from './const.js';
import { buildUrlQuery, postJson } from './util.js';
import CommonsApi from './mwapi/commons.js';
import WikidataApi from './mwapi/wikidata.js';
import WikidataQuery from './mwapi/query.js';

export default class Api {
    constructor(locale) {
        this.locale = locale;
    }

    async addFile(file) {
        const req = await this.call('add-file', file);
        return req;
    }

    async call(action, opts = {}) {
        opts.action = action;
        const query = buildUrlQuery(opts);
        const url = `${LOCAL_API_ENDPOINT}?${query}`;
        const req = await getJson(url);
        return req;
    }

    async post(action, opts = {}) {
        opts.action = action;
        const req = await postJson(LOCAL_API_ENDPOINT, opts);
        return req;
    }

    async fileExists(mid) {
        const req = await this.call('file-exists', { mid });
        return req.status;
    }

    async filesExist(mids) {
        const req = await this.post('files-exists', { mids });
        return req;
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

    async getCandidateItem(qid) {
        const api = new WikidataApi(this.locale);

        const req = await api.call({
            "action": "wbgetentities",
            "ids": qid,
            "languages": this.locale,
            "props": "claims|descriptions|labels",
            "format": "json"
        });

        if (req.error) {
            console.error(req.error);
            return null;
        }

        const item = req.entities[qid];
        let thumb;

        if ("P18" in item.claims) {
            const file = item.claims.P18[0].mainsnak.datavalue.value;
            const commonsApi = new CommonsApi(this.locale);
            thumb = commonsApi.getThumb(file, THUMB_SIZE);
        }

        return {
            _item : item,
            description : this.locale in item.descriptions ? item.descriptions[this.locale].value : null,
            id : qid,
            label : this.locale in item.labels ? item.labels[this.locale].value : null,
            qid : qid,
            thumb : thumb,
            url : `https://www.wikidata.org/wiki/${qid}`
        };
    }

    async getImageThumb(title, width) {
        const api = new CommonsApi(this.locale);
        return api.getImageThumb(title, width);
    }

    // Note difference with the plural (itemS) function
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

    // This uses PetScan instead of SPARQL, as with the single api call above
    async getItemsByCommonsCategory(category, depth = 0) {
        const opts = {
            "categories": category,
            "depth": depth,
            "wikidata_item": "with",
            "project": "wikimedia",
            "language": "commons",
            "format": "json",
            "ns[14]": "1",
            "search_max_results": "500",
            "doit": "1"
        };

        const req = await getJson("https://petscan.wmflabs.org/", opts);

        if (req.error) {
            return [];
        }

        let results;

        try {
            // The PetScan JSON definitely leaves something to be desired
            results = req["*"][0]["a"]["*"];
        } catch (e) {
            return [];
        }

        return results.map((item) => {
            return {
                "category" : item.title,
                "image" : null,
                "qid" : item.q
            };
        });
    }

    // Only used for debugging purposes, not exposed in the main interface
    async getItemByQid(qid) {
        const sparql = `
          select ?item ?image ?cat where {
            wd:${qid} wdt:P373 ?cat;
                      wdt:P18 ?image;
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
        const query = await wdQuery.call(sparql);

        if (!query.results) {
            throw new Error('Did not get any results');
        }

        // Throw out anything that doesn't have a category or image
        // (even though those shouldn't appear here in the first place)
        const results = query.results.bindings.filter((binding) => {
            return binding.cat && binding.image && binding.item;
        });

        return results.map((binding) => {
            return {
                'category' : binding.cat.value,
                // The Wikidata query service returns http links instead of https
                // for images
                'image' : binding.image.value.replace('http://', 'https://'),
                'qid' : binding.item.value.replace('http://www.wikidata.org/entity/', '')
            };
        });
    }

    async getLeaderboard() {
        return await this.call('leaderboard');
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

    // We can only use items that have an image, a category
    // and are not a category themselves
    isValidItem(item) {
        if (!item.thumb) {
            console.log(`candidateItem ${item.qid} has no thumb`);
            return false;
        }

        if (!item.label) {
            console.log(`candidateItem ${item.qid} has no label in the given language`);
            return false;
        }

        const claims = item._item.claims;

        if (!"P373" in claims) {
            console.log(`candidateItem ${item.qid} has no category`);
            return false;
        }

        if (!"P31" in claims) {
            console.log(`candidateItem ${item.qid} has no instance of`);
            return false;
        }

        for (const claim of claims.P31) {
            // Item should not be a category!
            if (claim.mainsnak.datavalue.value.id === "Q4167836") {
                console.log(`candidateItem ${item.qid} is a category`);
                return false;
            }
        }

        return true;
    }


    async itemDone(opts) {
        const req = await this.call('item-done', opts);
        return req;
    }

    async itemsExist(qids) {
        const req = await this.post('items-done', { qids : qids });
        return req;
    }

    async itemExists(qid) {
        const req = await this.call('item-exists', { qid });
        return req.status;
    }
}