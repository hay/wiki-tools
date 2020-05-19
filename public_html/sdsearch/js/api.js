import CommonsApi from './commons-api.js';
const commonsApi = new CommonsApi();

export function entityToString(entity) {
    if (!entity) {
        return null;
    } else if (typeof entity === 'str') {
        return entity;
    } else {
        return entity.id;
    }
}

export async function getImageInfo(title) {
    const api = new CommonsApi();

    const results = await api.imageinfo(title, {
        iiprop : 'extmetadata'
    });

    const data = Object.values(results.query.pages)[0].imageinfo[0].extmetadata;

    for (const key in data) {
        data[key] = data[key].value;
    }

    return data;
}

export function makeHasbwstatement(entity) {
    let str = `haswbstatement:${entity.prop}`;

    if (entity.item) {
        str += `=${entity.item}`;
    }

    return str;
}

export function parseHash(hash) {
    let keywords = [];
    let offset = 0;
    const parts = hash.split('&');

    for (const part of parts) {
        if (part.startsWith('q=')) {
            const q = window.decodeURIComponent(part.slice(2));
            keywords = q.split(/(haswbstatement:[^ ]+)/).map(k => k.trim()).filter(k => !!k);
        }

        if (part.startsWith('offset=')) {
            offset = Number(part.replace('offset=', ''));
        }
    }

    return { keywords, offset }
}

export function parseHaswbstatement(str) {
    // Curently, haswbstatement:* is not valid
    const matches = str.match(/haswbstatement:(P\d*)=?(.*)/);

    if (!matches) {
        return {
            item : null,
            prop : null
        }
    } else {
        return {
            item : !!matches[2] ? matches[2] : null,
            prop : matches[1]
        }
    }
}

export async function searchCommons(query, offset = 0) {
    const api = new CommonsApi({
        thumbSize : 250
    });

    const results = await api.search(query, {
        namespace : 6,
        limit : 20, // 40 seems to give a HTTP 429 too many requests
        sroffset : offset
    });

    return results;
}

export async function commonsSuggest(query) {
    return await commonsApi.opensearch(query);
}