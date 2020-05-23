const fetch = require('node-fetch');
const fs = require('fs').promise;
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

    console.log(JSON.stringify(data, null, 4));
}

main();