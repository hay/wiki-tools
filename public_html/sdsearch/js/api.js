import CommonsApi from './commons-api.js';

export function entityToString(entity) {
    if (!entity) {
        return null;
    } else if (typeof entity === 'str') {
        return entity;
    } else {
        return entity.id;
    }
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
            keywords = q.split(/(haswbstatement:[^ ]+)/).filter(k => !!k).map(k => k.trim());
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
    const api = new CommonsApi();

    const results = await api.search(query, {
        namespace : 6,
        limit : 20,
        sroffset : offset
    });

    return results;
}