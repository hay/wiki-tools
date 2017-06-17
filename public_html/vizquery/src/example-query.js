{
  "queryType": "SELECT",
  "variables": [
    "?item",
    "?itemLabel",
    "?itemDescription",
    "?image",
    "?sitelink"
  ],
  "distinct": true,
  "where": [
    {
      "type": "bgp",
      "triples": [
        {
          "subject": "?item",
          "predicate": "http://www.wikidata.org/prop/direct/P31",
          "object": "http://www.wikidata.org/entity/Q3305213",
          "$predicate" : {
            "hoi" : 21
          }
        },
        {
          "subject": "?item",
          "predicate": "http://www.wikidata.org/prop/direct/P170",
          "object": "http://www.wikidata.org/entity/Q5582"
        },
        {
          "subject": "?item",
          "predicate": "http://www.wikidata.org/prop/direct/P921",
          "object": "http://www.wikidata.org/entity/Q467"
        },
        {
          "subject": "?item",
          "predicate": "http://www.wikidata.org/prop/direct/P276",
          "object": "http://www.wikidata.org/entity/Q224124"
        }
      ]
    },
    {
      "type": "optional",
      "patterns": [
        {
          "type": "bgp",
          "triples": [
            {
              "subject": "?item",
              "predicate": "http://www.wikidata.org/prop/direct/P18",
              "object": "?image"
            }
          ]
        }
      ]
    },
    {
      "type": "optional",
      "patterns": [
        {
          "type": "bgp",
          "triples": [
            {
              "subject": "?sitelink",
              "predicate": "http://www.w3.org/2000/01/rdf-schema#about",
              "object": "?item"
            },
            {
              "subject": "?sitelink",
              "predicate": "http://www.w3.org/2000/01/rdf-schema#isPartOf",
              "object": "https://en.wikipedia.org/"
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
              "object": "\"[AUTO_LANGUAGE],en,fr,es,de,ru,it,nl,ja,zh,pl,cs\""
            }
          ]
        }
      ],
      "name": "http://wikiba.se/ontology#label",
      "silent": false
    }
  ],
  "limit": 50,
  "type": "query",
  "prefixes": {
    "wd": "http://www.wikidata.org/entity/",
    "wdt": "http://www.wikidata.org/prop/direct/",
    "wikibase": "http://wikiba.se/ontology#",
    "p": "http://www.wikidata.org/prop/",
    "ps": "http://www.wikidata.org/prop/statement/",
    "pq": "http://www.wikidata.org/prop/qualifier/",
    "schema": "http://www.w3.org/2000/01/rdf-schema#",
    "bd": "http://www.bigdata.com/rdf#"
  }
}