import { encodeWikiTitle } from './util.js';

function testWikiTitles() {
    // Key is input, value is what it should look like
    const data = {
        "Cimetière d'Abscon" : "Cimeti%C3%A8re_d%27Abscon",
        "File:SMATRICS high performance charging site Designer Outlet Center Salzburg at Kasernenstraße 1 in Salzburg, Salzburg, Austria-station CCS+CHAdeMO plug PNr°0700.jpg" : "File:SMATRICS_high_performance_charging_site_Designer_Outlet_Center_Salzburg_at_Kasernenstra%C3%9Fe_1_in_Salzburg,_Salzburg,_Austria-station_CCS%2BCHAdeMO_plug_PNr%C2%B00700.jpg",
        "Daheim sterben die Leut’" : "Daheim_sterben_die_Leut%E2%80%99"
    };

    for (const input in data) {
        const expected = data[input];
        const output = encodeWikiTitle(input);

        if (expected === output) {
            console.log(`✅ '${input}' => '${output}'`);
        } else {
            console.log(`❌ '${input}' => '${output}', expected '${expected}'`)
        }
    }
}

export function test() {
    testWikiTitles();
}