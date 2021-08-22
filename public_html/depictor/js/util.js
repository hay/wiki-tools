export function buildUrlQuery(params) {
    let query = '';

    for (const key in params) {
        const val = window.encodeURIComponent(params[key]);
        query += `${key}=${val}&`;
    }

    return query;
}

// Lifted from https://bitbucket.org/magnusmanske/wikilovesmonuments-uk-2014/src/master/public_html/main_vue.js
export function encodeWikiTitle(title) {
    title = title.replace(/&/g,'&amp;')
                 .replace(/</g,'&lt;')
                 .replace(/>/g,'&gt;')
                 .replace(/"/g,'&quot;')
                 .replace(/'/g,'&#x27;')
                 .replace(/\//g,'&#x2F;');

    return window.encodeURIComponent(title);
}

export function objectHasFilledProperties(properties, object) {
    for (const prop of properties) {
        if (!prop in object) {
            return false;
        }

        if (object[prop] === null) {
            return false;
        }
    }

    return true;
}