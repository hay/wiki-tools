const fetch = require('node-fetch');
const fs = require('fs').promise;
const ENDPOINT = 'https://tools-static.wmflabs.org/tooltranslate/data/sdsearch';

async function getJson(url) {
    const req = await fetch(url);
    return await req.json();
}

async function main() {
    const locales = {};
    const toolinfo = await getJson(`${ENDPOINT}/toolinfo.json`);

    for (const lang of toolinfo.languages) {
        const messages = await getJson(`${ENDPOINT}/${lang}.json`);
        locales[lang] = messages;
    }

    console.log(JSON.stringify(locales, null, 4));
}

main();