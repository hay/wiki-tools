export function buildUrlQuery(params) {
    let query = '';

    for (const key in params) {
        const val = window.encodeURIComponent(params[key]);
        query += `${key}=${val}&`;
    }

    return query;
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