// Constants
import EXAMPLES from "./examples";

// Libraries
import Vue from "vue";

// Components
import entityEntry from "./components/entity-entry.vue";
import displayTable from "./components/display-table.vue";
import displayGrid from "./components/display-grid.vue";
import subjectEntry from "./components/subject-entry.vue";
import { Modal } from "uiv";

// Custom code
import { $ } from "./util";
import Query from "./query";
import parseCsv from "./csv";
import { query as fetchQuery } from "./api";

export default function(selector) {
    return new Vue({
        el : selector,

        components : {
            'entity-entry' : entityEntry,
            'display-table' : displayTable,
            'display-grid' : displayGrid,
            'subject-entry' : subjectEntry,
            Modal
        },

        data : {
            state : 'search',

            results : [],

            hadResults : false,

            query : new Query(),

            queryString : null,

            display : 'grid',

            error : false,

            loading : false,

            examples : EXAMPLES,

            modal : {
                show : false,
                title : null
            }
        },

        mounted : function() {
            if (!!window.location.hash) {
                this.parseHash();
            }

            window.addEventListener('hashchange', this.parseHash.bind(this));
        },

        computed : {
            csv : function() {
                return parseCsv(this.results);
            }
        },

        methods : {
            addRule : function() {
                this.query.addEmptyTriple();
            },

            doQuery : function() {
                const query = this.query.stringify();
                window.location.hash = encodeURIComponent(query);
            },

            removeRules : function(msg) {
                if (msg === 'ok') {
                    this.query.triples = [];
                    this.results = [];
                    this.hadResults = false;
                }
            },

            showRemoveRulesModal : function() {
                this.modal.title = "Remove all rules";
                this.modal.show = true;
                this.modal.text = "Are you sure you want to remove all rules?";
            },

            setDisplay : function(type) {
                this.display = type;
            },

            parseHash : function() {
                window.scrollTo(0, 0);

                const query = decodeURIComponent(window.location.hash.slice(1));

                this.queryString = query;

                this.results = [];
                this.loading = true;

                // This whole query resetting and then doing a nextTick
                // feels pretty voodoo to me, but it is necessary...
                this.query = new Query();

                Vue.nextTick(() => {
                    this.query = new Query(query);

                    fetchQuery(this.query.stringify()).then((results) => {
                        this.results = results;
                        this.loading = false;
                        this.hadResults = true;
                    });
                });
            }
        }
    });
};