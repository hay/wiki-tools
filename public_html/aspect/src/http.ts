function buildUrl(url : string, params : object = null) : string {
    if (params) {
        url += '?' + Object.keys(params)
            .map(k => `${k}=${encodeURIComponent(params[k])}`)
            .join('&');
    }

    return url;
}

async function getJsonFromUrl(url : string) {
    const req = await fetch(url);
    const data = await req.json();
    return data;
}

export { buildUrl, getJsonFromUrl };