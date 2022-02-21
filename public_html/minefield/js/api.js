import { $, getJson } from 'donot';
import { chunk } from 'lodash-es';
import Papa from 'papaparse';
import saveCsv from 'save-csv';

const MAX_TITLES_PER_CALL = 50;

// Welcome in the special section of hell that is called URL encoding
// https://www.mediawiki.org/wiki/Manual:PAGENAMEE_encoding#PAGENAME
function encodePageTitle(title) {
    title = title.replace(/ /g, '_')
                 .replace(/&/g, '%26')
                 .replace(/"/g, '%22')
                 .replace(/'/g, '%27');

    return window.encodeURIComponent(title);
}

function getCommonsFilepage(str) {
    // URL's, note that we also take into account pasting from other
    // sites like Wikipedia
    str = str.replace(/https?:\/\/.+\/wiki\//, '');

    // This weird stuff is what we get from the WD query service
    // < https://phabricator.wikimedia.org/T238908#5684054 >
    str = str.replace('Special:FilePath/', 'File:');

    // And here we have URLs directly from media viewer
    str = str.replace(/.*#\/media\//, '');

    return str;
}

function getApiCall(pages) {
    pages = pages.map(window.decodeURIComponent).join('|');
    return `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&titles=${pages}`;
}

export function downloadCsv(data, delimiter = ',') {
    return saveCsv(data, {
        sep : delimiter
    });
}

export function getMetaProperty(key) {
    return $(`meta[property="${key}"]`).getAttribute('content');
}

// https://commons.wikimedia.org/w/api.php?action=query&titles=File:Albert%20Einstein%20Head.jpg|File:Cat.jpg&format=json
export async function getMidsForFilepages(filepages) {
    // First make sure we get the urls without the domain and stuff and encode
    filepages = filepages.map(getCommonsFilepage).map(encodePageTitle);

    // Now we need to chunk the filepages to the maximum allowed titles
    const chunks = chunk(filepages, MAX_TITLES_PER_CALL);

    // And create a final return array
    let results = [];

    for (let pages of chunks) {
        const url = getApiCall(pages);
        const data = await getJson(url);

        console.info(`Calling: ${url}`);

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

export async function getPagesFromPagepile(id) {
    const url = `https://tools.wmflabs.org/pagepile/api.php?id=${id}&action=get_data&format=json&doit1`;
    const results = await getJson(url);
    return results.pages;
}

export function toCsv(data) {
    return Papa.unparse(data, {
        header : true,
        quotes : true
    });
}