(function() {
    var baseQuery = {
        "queryType": "SELECT",
        "variables": [
            "?item",
            "?image",
            "?itemLabel",
            "?itemDescription"
        ],
        "where": [
            {
                "type": "bgp",
                "triples": [
                    {
                        "subject": "?item",
                        "predicate": "http://www.wikidata.org/prop/direct/P31",
                        "object": "http://www.wikidata.org/entity/Q33506"
                    },
                    {
                        "subject": "?item",
                        "predicate": "http://www.wikidata.org/prop/direct/P17",
                        "object": "http://www.wikidata.org/entity/Q55"
                    },
                    {
                        "subject": "?item",
                        "predicate": "http://www.wikidata.org/prop/direct/P18",
                        "object": "?image"
                    }
                ]
            },
            {
                "type": "minus",
                "patterns": [
                    {
                        "type": "bgp",
                        "triples": [
                            {
                                "subject": "?item",
                                "predicate": "http://www.wikidata.org/prop/direct/P50",
                                "object": "http://www.wikidata.org/entity/Q364153"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "service",
                "patterns": [
                    {
                        "type": "bgp",
                        "triples": [
                            {
                                "subject": "http://www.bigdata.com/rdf#serviceParam",
                                "predicate": "http://wikiba.se/ontology#language",
                                "object": "\"en,nl\""
                            }
                        ]
                    }
                ],
                "name": "http://wikiba.se/ontology#label",
                "silent": false
            }
        ],
        "type": "query",
        "prefixes": {
            "wd": "http://www.wikidata.org/entity/",
            "wdt": "http://www.wikidata.org/prop/direct/",
            "wikibase": "http://wikiba.se/ontology#",
            "p": "http://www.wikidata.org/prop/",
            "ps": "http://www.wikidata.org/prop/statement/",
            "pq": "http://www.wikidata.org/prop/qualifier/",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "bd": "http://www.bigdata.com/rdf#"
        }
    };

    function Query() {
    }
})();