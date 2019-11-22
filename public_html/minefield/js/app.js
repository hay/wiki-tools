import { chunk } from 'lodash';
import Papa from 'papaparse';
import saveCsv from 'save-csv';
import Vue from 'vue';

const MAX_TITLES_PER_CALL = 50;

async function loadJson(url) {
    const req = await window.fetch(url);
    const json = await req.json();
    return json;
}

function getCommonsFilepage(str) {
    // URL's
    str = str.replace(/https?:\/\/commons.wikimedia.org\/wiki\//, '');

    // This weird stuff is what we get from the WD query service
    // < https://phabricator.wikimedia.org/T238908#5684054 >
    str = str.replace('Special:FilePath/', 'File:');

    return str;
}

function getApiCall(pages) {
    pages = pages.map(window.decodeURIComponent).join('|');
    return `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&titles=${pages}`;
}

function toCsv(data) {
    return Papa.unparse(data, {
        header : true,
        quotes : true
    });
}

// https://commons.wikimedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg|File:Cat.jpg&format=json
async function getMidsForFilepages(filepages) {
    // First make sure we get the urls without the domain and stuff and encode
    filepages = filepages.map(getCommonsFilepage).map(window.encodeURIComponent);

    // Now we need to chunk the filepages to the maximum allowed titles
    const chunks = chunk(filepages, MAX_TITLES_PER_CALL);

    // And create a final return array
    let results = [];

    for (let pages of chunks) {
        const url = getApiCall(pages);
        const data = await loadJson(url);

        console.log('Calling: ' + url);

        // Convert the results to an array with objects
        if (data.error) {
            throw Error(data.error.info);
        }

        for (let item of Object.values(data.query.pages)) {
            let mid = `M${item.pageid}`;

            let ret = {
                mid : mid,
                status : 'ok',
                title : item.title,
                url : `https://commons.wikimedia.org/wiki/Special:EntityData/${mid}`
            };

            if (!item.pageid) {
                ret.status = 'error';
                ret.mid = '-';
                ret.url = '-';
            }

            results.push(ret);
        }
    }

    return results;
}

async function getPagesFromPagepile(id) {
    const url = `https://tools.wmflabs.org/pagepile/api.php?id=${id}&action=get_data&format=json&doit1`;
    const results = await loadJson(url);
    return results.pages;
}

new Vue({
    el : "#app",

    data : {
        csv : '',
        error : false,
        loading : false,
        pagepileInput : null,
        results : '',
        showPagepile : false,
        state : 'edit',
        titles : []
    },

    methods : {
        again() {
            this.results = '';
        },

        clear() {
            this.titles = [];
            this.error = false;
        },

        displayPagepile(e) {
            e.preventDefault();
            this.showPagepile = true;
        },

        download() {
            saveCsv(this.results);
        },

        go() {
            this.populate(this.titles.split('\n'));
        },

        async populate(filepages) {
            this.loading = true;

            try {
                this.results = await getMidsForFilepages(filepages);
            } catch (e) {
                this.error = e.toString();
                this.loading = false;
                return;
            }

            this.csv = toCsv(this.results);
            this.loading = false;
        },

        async setPagepile(e) {
            e.preventDefault();
            const pages = await getPagesFromPagepile(this.pagepileInput);
            this.populate(pages);
        }
    }
});