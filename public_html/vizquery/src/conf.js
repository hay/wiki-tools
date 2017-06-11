import { getBrowserLanguage } from "./util";

export const DEFAULT_RESULT_LIMIT = 50;
export const VALID_DATATYPES = ['string', 'external-id', 'wikibase-item'];
export const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql?format=json&query=%s";
export const MIN_INPUT_LENGTH = 10;
export const LANGUAGE = getBrowserLanguage();
export const LABEL_LANGUAGES = 'en,fr,es,de,ru,it,nl,ja,zh,pl';