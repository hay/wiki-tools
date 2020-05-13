import CommonsApi from './commons-api.js';

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

export async function searchCommons(query, offset = 0) {
    const api = new CommonsApi();

    const results = await api.search(query, {
        namespace : 6,
        limit : 20,
        sroffset : offset
    });

    return results;
}