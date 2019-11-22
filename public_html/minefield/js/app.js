import Papa from 'papaparse';
import saveCsv from 'save-csv';
import Vue from 'vue';

const TEST_TITLES = [
    "https://commons.wikimedia.org/wiki/File:Championnat_de_vacances.jpg",
    "https://commons.wikimedia.org/wiki/File:Tbilisi-Jumah-Moschee-04-2019-gje.jpg",
    "https://commons.wikimedia.org/wiki/File:%D0%90%D0%BF%D1%82%D0%B5%D0%BA%D0%B0%D1%80%D1%81%D0%BA%D0%B8%D0%B9_%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D0%BB%D0%BE%D0%BA,_6._%D0%A2%D0%BE%D0%BC%D1%81%D0%BA._04.jpg"
];

async function loadJson(url) {
    const req = await window.fetch(url);
    const json = await req.json();
    return json;
}

function getCommonsFilepage(str) {
    str = str.replace(/https?:\/\/commons.wikimedia.org\/wiki\//, '');
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
    const url = getApiCall(filepages);
    const data = await loadJson(url);

    // Convert the results to an array with objects
    return Object.values(data.query.pages).map((item) => {
        const mid = `M${item.pageid}`;

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

        return ret;
    });
}

new Vue({
    el : "#app",

    data : {
        csv : '',
        error : false,
        loading : false,
        results : '',
        state : 'edit',
        titles : TEST_TITLES.join('\n')
    },

    methods : {
        again() {
            this.results = '';
        },

        clear() {
            this.titles = [];
        },

        download() {
            saveCsv(this.results);
        },

        async go() {
            this.loading = true;
            this.results = await getMidsForFilepages(this.titles.split('\n'));
            this.csv = toCsv(this.results);
            this.loading = false;
        }
    }
});