export function cleanupUrl(url) {
    return url.trim().replace(/ /g, '').replace(/\n/g, '');
}

export function fetchJson(url) {
    url = cleanupUrl(url);
    return fetch(url).then((res) => res.json());
}

export function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}