import { buildUrl, getJsonFromUrl } from './http.js';

function getThumbnailUrl(filename : string, width : number) : string {
    return buildUrl(
        'https://commons.wikimedia.org/w/index.php',
        {
            title : 'Special:FilePath',
            file : filename,
            width
        }
    );
}
async function getEntity(qid : string) {
    const data = await getEntities([qid]);
    return data.entities[qid];
}

async function getEntities(qids : string[], languages : string[] = ['en']) {
    const url = buildUrl('https://www.wikidata.org/w/api.php', {
        action : 'wbgetentities',
        ids : qids.join('|'),
        languages : languages.join('|'),
        format : 'json',
        origin : '*'
    });

    return await getJsonFromUrl(url);
}

async function getImages(qid : string) {
    const entity = await getEntity(qid);
    const imgData = entity.claims.P18;
    const images = {};

    for (let img of imgData) {
        const src = img.mainsnak.datavalue.value;
        const qualifier = img.qualifiers.P2061[0].datavalue.value.id;
        images[qualifier] = { src };
    }

    const qualifiers = await getEntities(Object.keys(images));

    Object.keys(qualifiers.entities).forEach((qualifierId) => {
        const data = qualifiers.entities[qualifierId];
        const value = Number(data.claims.P1181[0].mainsnak.datavalue.value.amount);
        images[qualifierId].value = value;
    });

    return images;
}

async function getAspects(qid : string) {
    const images = await getImages(qid);
    const aspects = {};

    for (const id in images) {
        const data = images[id];
        aspects[data.value] = data.src;
    }

    return aspects;
}

export { getThumbnailUrl, getEntity, getEntities, getImages, getAspects };