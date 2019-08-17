function getSparqlQuery({
    lat,
    lon,
    radius = 1,
    lang = 'en',
    limit = 100
}) {
return `
    #defaultView:Map{"hide":["?location","?distance"]}
    SELECT ?place ?placeDescription ?location ?distance ?placeLabel ?image ?article WHERE {
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
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,${lang}". }
    } ORDER BY ?distance LIMIT ${limit}
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