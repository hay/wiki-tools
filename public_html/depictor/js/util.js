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

export function getLocale(defaultLocale) {
    const search = window.location.search;

    if (search.includes('locale')) {
        const matches = search.match(/locale=(.+)[#|&|$]?/);

        if (!matches) {
            return defaultLocale;
        } else {
            return matches[1];
        }
    } else {
        return defaultLocale;
    }
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

export function postJson(url, body) {
    return new Promise((resolve, reject) => {
        const options = {
            body: JSON.stringify(body),
            headers : {
                'Content-Type' : 'application/json'
            },
            method : 'POST',
        };

        window.fetch(url, options)
            .then((res) => res.json())
            .then((res) => resolve(res))
            .catch((err) => reject(err));
    });
}