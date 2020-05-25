export async function getJson(url) {
    const req = await window.fetch(url);
    return await req.json();
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

export function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
}

export function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = function() {
            resolve();
        }

        img.src = src;
    });
}

// From < https://stackoverflow.com/a/2901298/152809 >
export function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function timeout(ms) {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve();
        }, ms);
    });
}