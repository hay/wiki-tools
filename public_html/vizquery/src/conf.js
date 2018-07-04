import { getBrowserLanguage } from "./util";

export const DEFAULT_RESULT_LIMIT = 50;
export const ENTITIY_REGEX = /(Q|P)\d+/g;
export const ENTITY_URI = 'http://www.wikidata.org/';
export const INTRO_QUERIES = [
    { label : 'cats', id : 'Q146' },
    { label : 'paintings', id : 'Q3305213' },
    { label : 'books', id : 'Q571' },
    { label : 'songs', id : 'Q7366' }
]
// These entities take up so much time for the query that we need to do a
// really 'basic' query (no labels e.g.)
export const INSTANCE_OF_TOP = [
    "Q13442814","Q5","Q4167836","Q16521","Q4167410","Q11266439","Q7187","Q13100073"
];
export const LABEL_LANGUAGES = '[AUTO_LANGUAGE],en,fr,es,de,ru,it,nl,ja,zh,pl,cs';
export const LANGUAGE = getBrowserLanguage();
export const MIN_INPUT_LENGTH = 10;
export const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql?format=json&query=%s";
export const STRING_REGEX = /".+"/g
export const VALID_DATATYPES = ['string', 'external-id', 'wikibase-item'];
export const VARIABLE_REGEX = /\?[\w|\d]+/g;
export const WIKIDATA_ITEM = 'http://www.wikidata.org/entity/';
export const WIKIDATA_PROPERTY = 'http://www.wikidata.org/prop/direct/';