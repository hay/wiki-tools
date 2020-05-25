const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const ENDPOINT = 'https://tools-static.wmflabs.org/tooltranslate/data';
const LANGUAGES_ENDPOINT = `${ENDPOINT}/languages.json`;
const TOOL_ENDPOINT = `${ENDPOINT}/sdsearch`;

async function getJson(url) {
    const req = await fetch(url);
    return await req.json();
}

async function main() {
    const data = {
        languages : [],
        messages : {}
    };

    const languages = await getJson(LANGUAGES_ENDPOINT);
    const toolinfo = await getJson(`${TOOL_ENDPOINT}/toolinfo.json`);

    for (const lang of toolinfo.languages) {
        const messages = await getJson(`${TOOL_ENDPOINT}/${lang}.json`);
        data.messages[lang] = messages;

        data.languages.push({
            code : lang,
            label : languages[lang]
        });
    }

    const jsonData = JSON.stringify(data, null, 4);

    // Make sure we actually got anything
    if (jsonData === '') {
        console.error('Output is empty, aborting');
        return;
    }

    const localesPath = path.resolve(__dirname, '../locales.json');
    await fs.writeFile(localesPath, jsonData, 'utf-8');
}

main();