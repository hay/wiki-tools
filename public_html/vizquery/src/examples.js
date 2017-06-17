import Query from "./query";

const EXAMPLES = [
    {
        "description" : "Cats",
        "data" : [
            "wdt:P31 wd:Q146"
        ]
    },
    {
        "description" : "World Heritage sites in the Netherlands",
        "data" : [
            "wdt:P1435 wd:Q9259",
            "wdt:P17 wd:Q55"
        ]
    },
    {
        "description" : "Movies with both Joe Pesci and Robert De Niro",
        "data" : [
            "wdt:P161 wd:Q36949",
            "wdt:P161 wd:Q20178"
        ]
    },
    {
        "description" : "Train stations in the Czech Republic",
        "data" : [
            "wdt:P31 wd:Q55488",
            "wdt:P17 wd:Q213"
        ]
    },
    {
        "description" : "Municipalities in the province of Gelderland, the Netherlands",
        "data" : [
            "wdt:P31 wd:Q2039348",
            "wdt:P131 wd:Q775"
        ]
    },
    {
        "description" : "Female trumpet players",
        "data" : [
            "wdt:P31 wd:Q5",
            "wdt:P1303 wd:Q8338",
            "wdt:P21 wd:Q6581072"
        ]
    },
    {
        "description" : "aintings of women by Vincent van Gogh in the Van Gogh museum",
        "data" : [
            "wdt:P31 wd:Q3305213",
            "wdt:P170 wd:Q5582",
            "wdt:P921 wd:Q467",
            "wdt:P276 wd:Q224124"
        ]
    },
];

export default EXAMPLES.map((e) => {
    const query = new Query();

    e.data.forEach((rule) => {
        const [predicate, object] = rule.split(" ");
        query.addRule(predicate, object);
    });

    e.query = query.stringify();

    return e;
});