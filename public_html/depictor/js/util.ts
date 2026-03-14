export const getJson = async (
    url: string,
    params: Record<string, string> | null = null,
    headers: Record<string, string> | null = null
) => {
    if (params) {
        const urlObj = new URL(url, window.location.href);
        Object.keys(params).forEach((k) => urlObj.searchParams.append(k, params[k]));
        url = urlObj.toString();
    }

    const options = headers ? { headers : headers } : undefined;
    const res = await fetch(url, options);

    return res.json();
};

export const buildUrlQuery = (params: Record<string, string | number | boolean | undefined>) => {
    let query = '';

    for (const key in params) {
        const val = window.encodeURIComponent(String(params[key] ?? ''));
        query += `${key}=${val}&`;
    }

    return query;
};

// Lifted from https://github.com/wikimedia/mediawiki/blob/379b4656632befd16fcf61a3a0509b6d9be78d33/resources/src/mediawiki.base/mediawiki.base.js#L266-L276
// Thanks Tgr!
export const encodeWikiTitle = (title: string) =>
    encodeURIComponent(String(title))
        .replace(/'/g, '%27')
        .replace(/%20/g, '_')
        .replace(/%3B/g, ';')
        .replace(/%40/g, '@')
        .replace(/%24/g, '$')
        .replace(/%2C/g, ',')
        .replace(/%2F/g, '/')
        .replace(/%3A/g, ':');

export const getLocale = (defaultLocale: string) => {
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
};

// Lifted from https://stackoverflow.com/a/2901298/152809
export const numberWithCommas = (x: number = 0, separator: string = ",") =>
    x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);

export const loadImage = async (src: string) => {
    return new Promise<void>((resolve) => {
        const img = new Image();

        img.onload = () => resolve();

        img.src = src;
    });
};

export const postJson = <T = unknown>(url: string, body: unknown) => {
    return new Promise((resolve, reject) => {
        const options: RequestInit = {
            body: JSON.stringify(body),
            headers : {
                'Content-Type' : 'application/json'
            },
            method : 'POST',
        };

        window.fetch(url, options)
            .then((res) => res.json())
            .then((res) => resolve(res as T))
            .catch((err) => reject(err));
    });
};
