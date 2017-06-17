// Constants
import { DEFAULT_RESULT_LIMIT } from "./conf";
import EXAMPLES from "./examples";

// Libraries
import Vue from "vue";
import Papaparse from "papaparse";

// Components
import entityEntry from "./components/entity-entry.vue";
import displayTable from "./components/display-table.vue";
import displayGrid from "./components/display-grid.vue";

// Custom code
import { $, clone } from "./util";
import Query from "./query";

function parseResult(result) {
    if (result.image) {
        result.thumb = result.image.value + '?width=300';
    }

    if (result.item) {
        result.id = result.item.value.replace('http://www.wikidata.org/entity/', '');
    }

    return result;
}

class View {
    constructor(selector) {
        this.selector = $(selector);
        this.query = new Query();
        this.setup();
    }

    setup() {
        let self = this;

        this.view = new Vue({
            el : this.selector,

            components : {
                'entity-entry' : entityEntry,
                'display-table' : displayTable,
                'display-grid' : displayGrid
            },

            data : {
                state : 'search',

                results : [],

                hadResults : false,

                query : new Query(),

                display : 'grid',

                error : false,

                loading : false,

                examples : EXAMPLES
            },

            mounted : function() {
                if (!!window.location.hash) {
                    this.parseHash();
                }

                window.addEventListener('hashchange', this.parseHash.bind(this));
            },

            computed : {
                csv : function() {
                    var results = clone(this.results).map((d) => {
                        // REALLY UGLY CODE
                        ['item', 'itemDescription', 'itemLabel'].forEach((key) => {
                            d[key] = d[key] && d[key].value ? d[key].value : null;
                        });

                        return d;
                    });

                    var csv = Papaparse.unparse(results, {
                        quotes : true
                    });

                    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
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

                setDisplay : function(type) {
                    this.display = type;
                },

                parseHash : function() {
                    const query = decodeURIComponent(window.location.hash.slice(1));

                    this.results = [];
                    this.loading = true;
                    this.query = new Query(query);

                    this.query.fetch().then((results) => {
                        this.results = results.map(parseResult);
                        this.loading = true;
                        this.hadResults = true;
                    });
                }
            }
        });
    }
};

export default View;