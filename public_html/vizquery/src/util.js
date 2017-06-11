export function getBrowserLanguage() {
    var lang = navigator.language || navigator.userLanguage;
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

export function getJson(url) {
    url = cleanupUrl(url);
    return fetch(url).then((res) => res.json());
}