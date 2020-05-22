export function getLocale() {
    const search = window.location.search;

    if (search.includes('locale')) {
        const matches = search.match(/locale=(.+)[#|&|$]?/);

        if (!matches) {
            return 'en';
        } else {
            return matches[1];
        }
    } else {
        return 'en';
    }
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