export function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.indexOf('-') !== -1 ? lang.split('-')[0] : lang;
}

export function $(selector) {
    return document.querySelector(selector);
}

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function cleanupUrl(url) {
    return url.trim().replace(/ /g, '').replace(/\n/g, '');
}

export function fetchJson(url) {
    url = cleanupUrl(url);
    return fetch(url).then((res) => res.json());
}

// Comparable to Java's hashing
export function hashString(string) {
    let hash = 0;

    for (let i = 0; i < string.length; i++) {
        const charCode = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + string.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}

// Comparable to Underscore's _.uniq
export function unique(array, check) {
    const has = [];
    const result = [];

    array.forEach((item) => {
        const checkitem = check(item);

        if (!has.includes(checkitem)) {
            result.push(item);
            has.push(checkitem);
        }
    });

    return result;
}