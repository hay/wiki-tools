// Constants
import EXAMPLES from "./examples";

// Libraries
import Vue from "vue";

// Components
import displayTable from "./components/display-table.vue";
import displayGrid from "./components/display-grid.vue";
import entityEntry from "./components/entity-entry.vue";
import queryLink from "./components/query-link.vue";
import subjectEntry from "./components/subject-entry.vue";
import { Modal } from "uiv";

// Custom code
import { $ } from "./util.js";
import Query from "./query.js";
import parseCsv from "./csv.js";
import { query as fetchQuery } from "./api.js";
import { INTRO_FAST_QUERY, INTRO_QUERY, introQueries } from './examples.js';
import { INSTANCE_OF_TOP } from './conf.js';

export default function(selector) {
    return new Vue({
        el : selector,

        components : {
            'entity-entry' : entityEntry,
            'display-table' : displayTable,
            'display-grid' : displayGrid,
            'query-link' : queryLink,
            'subject-entry' : subjectEntry,
            Modal
        },

        data : {
            display : 'grid',
            error : false,
            examples : EXAMPLES,
            hadResults : false,
            introItem: null,
            introQueries,
            loading : false,
            modal : {
                show : false,
                title : null
            },
            query : new Query(),
            queryString : null,
            results : [],
            show : {
                exampleQueries : false,
                extendedIntro : false,
                queryBuilder : true
            },
            slowQuery : false,
            state : 'search'
        },

        watch : {
            introItem(item) {
                if (!item) return;

                const entity = item.replace('http://www.wikidata.org/entity/', '');
                const triple = `?item wdt:P31 wd:${entity} .`;

                // If this is a 'slow' query, use the fast query template
                const slowQuery = INSTANCE_OF_TOP.includes(entity);
                const queryTemplate = slowQuery ? INTRO_FAST_QUERY : INTRO_QUERY;
                let query = queryTemplate.replace('%query%', triple);
                this.show.queryBuilder = true;
                this.introItem = null;
                window.location.hash = `${encodeURIComponent(query)}`;
            }
        },

        mounted() {
            if (!!window.location.hash) {
                this.parseHash();
            }

            // Make sure that there's always *one* triple on an empty
            // query builder
            if (this.numberOfTriples === 0) {
                this.query.addEmptyTriple();
            }

            window.addEventListener('hashchange', this.parseHash.bind(this));
        },

        computed : {
            csv() {
                return parseCsv(this.results);
            },

            numberOfTriples() {
                return this.query.triples.length;
            }
        },

        methods : {
            addRule() {
                this.query.addEmptyTriple();
            },

            doQuery() {
                const query = this.query.stringify();
                window.location.hash = encodeURIComponent(query);
            },

            parseHash : function() {
                window.scrollTo(0, 0);

                const query = decodeURIComponent(window.location.hash.slice(1));

                this.results = [];
                this.query = new Query();
                this.loading = true;
                this.queryString = query;
                this.slowQuery = false;

                // This whole query resetting and then doing a nextTick
                // feels pretty voodoo to me, but it is necessary...
                Vue.nextTick(() => {
                    this.query = new Query(query);

                    fetchQuery(this.query.stringify()).then((results) => {
                        this.results = results;
                        this.loading = false;
                        this.hadResults = true;
                    }).catch((e) => {
                        this.error = e.message;
                        this.loading = false;
                    });
                });
            },

            showRemoveRulesModal() {
                this.modal.title = "Remove all rules";
                this.modal.show = true;
                this.modal.text = "Are you sure you want to remove all rules?";
            },

            setDisplay(type) {
                this.display = type;
            }
        }
    });
};