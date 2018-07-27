import { getBrowserLanguage } from "./util";

export const CONDITION_OPTIONS = {
    'bgp'      : 'must have',
    'minus'    : "must not have",
    'optional' : 'may have'
};
export const DEFAULT_RESULT_LIMIT = 50;
export const ENTITIY_REGEX = /(Q|P)\d+/g;
export const ENTITY_URI = 'http://www.wikidata.org/';
export const LABEL_LANGUAGES = '[AUTO_LANGUAGE],en,fr,es,de,ru,it,nl,ja,zh,pl,cs';
export const LANGUAGE = getBrowserLanguage();
export const MIN_INPUT_LENGTH = 10;
export const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql?format=json&query=%s";
export const STRING_REGEX = /".+"/g
export const VALID_DATATYPES = ['string', 'external-id', 'wikibase-item'];
export const VARIABLE_REGEX = /\?[\w|\d]+/g;
export const WIKIDATA_ITEM = 'http://www.wikidata.org/entity/';
export const WIKIDATA_PROPERTY = 'http://www.wikidata.org/prop/direct/';