// This is a bit hacky, but will give the user language if it is something else
// than English
export function getLanguage() {
    const DEFAULT_LANG = 'en';
    const languages = window.navigator.languages || [window.navigator.language || window.navigator.userLanguage];

    for (const lang of languages) {
        if (lang !== DEFAULT_LANG) {
            return lang;
        }
    }

    return DEFAULT_LANG;
}

function getSparqlQuery({
    lat,
    lon,
    radius = 1,
    lang = getLanguage(),
    limit = 100
}) {
return `
    #defaultView:Map{"hide":["?location","?distance"]}
    SELECT ?place ?placeDescription ?location ?distance ?placeLabel (sample(?image) as ?img) ?article WHERE {
        SERVICE wikibase:around {
          ?place wdt:P625 ?location .
          bd:serviceParam wikibase:center "Point(${lon} ${lat})"^^geo:wktLiteral .
          bd:serviceParam wikibase:radius "${radius}" .
          bd:serviceParam wikibase:distance ?distance .
        }
        minus { ?place wdt:P31/wdt:P279* wd:Q34442. }
        optional { ?place wdt:P18 ?image. }
        optional {
          ?article schema:about ?place .
          ?article schema:isPartOf <https://${lang}.wikipedia.org/>.
        }
        optional {
          ?article schema:about ?place .
          ?article schema:isPartOf <https://en.wikipedia.org/>.
        }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${lang},en". }
    } group by ?place ?placeDescription ?location ?distance ?placeLabel ?img ?article
      order BY ?distance
      limit ${limit}
`;
}

export async function getLocation() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((pos) => {
            resolve({
                lat : pos.coords.latitude,
                lon : pos.coords.longitude
            });
        });
    });
}

export function getIframeSrc({ location }) {
    const query = getSparqlQuery({
        lat : location.lat,
        lon : location.lon
    });

    return `https://query.wikidata.org/embed.html#${encodeURIComponent(query)}`;
}