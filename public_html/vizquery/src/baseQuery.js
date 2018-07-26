import {
  LABEL_LANGUAGES,
  LANGUAGE,
  DEFAULT_RESULT_LIMIT
} from "./conf";

export default function() {
  return {
    "queryType": "SELECT",
    "variables": [
      "?item",
      "?itemLabel",
      "?itemDescription",
      "?sitelink",
      {
        "expression": {
          "expression": "?image",
          "type": "aggregate",
          "aggregation": "sample",
          "distinct": false
        },
        "variable": "?image"
      }
    ],
    "distinct": true,
    "where": [
      {
        "type" : "bgp",
        "triples" : []
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
                "predicate": "http://schema.org/about",
                "object": "?item"
              },
              {
                "subject": "?sitelink",
                "predicate": "http://schema.org/isPartOf",
                "object": `https://${LANGUAGE}.wikipedia.org/`
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
                "object": `\"${LABEL_LANGUAGES}\"`
              }
            ]
          }
        ],
        "name": "http://wikiba.se/ontology#label",
        "silent": false
      }
    ],
    "group": [
      {
        "expression": "?item"
      },
      {
        "expression": "?itemLabel"
      },
      {
        "expression": "?itemDescription"
      },
      {
        "expression": "?sitelink"
      }
    ],
    "limit": DEFAULT_RESULT_LIMIT,
    "type": "query",
    "prefixes": {
      "wd": "http://www.wikidata.org/entity/",
      "wdt": "http://www.wikidata.org/prop/direct/",
      "wikibase": "http://wikiba.se/ontology#",
      "p": "http://www.wikidata.org/prop/",
      "ps": "http://www.wikidata.org/prop/statement/",
      "pq": "http://www.wikidata.org/prop/qualifier/",
      "schema": "http://schema.org/",
      "bd": "http://www.bigdata.com/rdf#"
    }
  };
};