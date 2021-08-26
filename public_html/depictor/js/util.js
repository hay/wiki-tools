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

// Lifted from https://stackoverflow.com/a/2901298/152809
export function numberWithCommas(x = 0, separator = ",") {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export async function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = function() {
            resolve();
        }

        img.src = src;
    });
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