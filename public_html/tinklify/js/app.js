import { chunk } from 'lodash';
import Papa from 'papaparse';
import saveCsv from 'save-csv';
import Vue from 'vue';

const BASE_PROPS = 'format=json&origin=*';
const DOMAIN_REGEX = /(?:https*:\/\/)*(.+\.wiki[p|m]edia\.org)\/wiki\/(.+)/;
const MAX_TITLES_PER_CALL = 50;

async function getLinks(domain, title) {
    const url = `https://${domain}/w/api.php?${BASE_PROPS}&action=query&prop=links&titles=${title}&pllimit=500`;
    const req = await loadJson(url);
    const pages = Object.values(req.query.pages)[0];
    return pages.links.map(l => l.title);
}

function getPageProps(domain, titles) {
    titles = titles.map(window.decodeURIComponent).join('|');
    return `https://${domain}/w/api.php?${BASE_PROPS}&action=query&prop=pageprops&redirects=1&titles=${titles}`;
}

async function getQidsForTitles(domain, titles) {
    // Chunk the titles to the maximum allowed titles
    const chunks = chunk(titles, MAX_TITLES_PER_CALL);

    // And create a final return array
    let results = [];

    for (let pages of chunks) {
        const url = getPageProps(domain, pages);
        const data = await loadJson(url);

        console.log('Calling: ' + url);

        // Convert the results to an array with objects
        if (data.error) {
            throw Error(data.error.info);
        }

        for (let item of Object.values(data.query.pages)) {
            let ret = {
                status : 'ok',
                title : item.title,
                url : `https://${domain}/wiki/${item.title}`
            };

            if (item.pageprops && item.pageprops.wikibase_item) {
                ret.qid = item.pageprops.wikibase_item;
                ret.qidlink = `https://www.wikidata.org/wiki/${ret.qid}`;
            } else {
                if ('missing' in item) {
                    ret.status = 'No page found';
                } else {
                    ret.status = 'No QID';
                }

                ret.qid = '';
            }

            results.push(ret);
        }
    }

    return results;
}

async function loadJson(url) {
    const req = await window.fetch(url);
    const json = await req.json();
    return json;
}

function toCsv(data) {
    return Papa.unparse(data, {
        header : true,
        quotes : true
    });
}

new Vue({
    el : "#app",

    computed : {
        urlParsed() {
            const matches = this.url.match(DOMAIN_REGEX);

            if (!matches) {
                return null;
            } else {
                return {
                    domain : matches[1],
                    title : matches[2]
                };
            }
        },

        urlValid() {
            return !!this.urlParsed;
        }
    },

    data : {
        csv : '',
        error : false,
        loading : false,
        results : null,
        url : ''
    },

    methods : {
        again() {
            this.results = '';
        },

        clear() {
            this.titles = [];
            this.error = false;
        },

        download() {
            saveCsv(this.results);
        },

        async getQidsForUrl() {
            const query = this.urlParsed;
            const links = await getLinks(query.domain, query.title);
            const qids = await getQidsForTitles(query.domain, links);
            return qids;
        },

        async go(e) {
            e.preventDefault();

            if (!this.urlValid) return;

            window.location.hash = window.encodeURIComponent(this.url);

            this.loading = true;

            try {
                this.results = await this.getQidsForUrl();
            } catch (e) {
                this.error = e.toString();
                this.loading = false;
                return;
            }

            this.csv = toCsv(this.results);
            this.loading = false;
        },

        parseHash() {
            const loc = window.location;

            if (!!loc.hash) {
                const hash = window.decodeURIComponent(loc.hash.slice(1));
                this.url = hash;
            }
        }
    },

    mounted() {
        this.parseHash();
    }
});