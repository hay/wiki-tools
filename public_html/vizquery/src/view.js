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

function parseWhere(str) {
    var parts = str.split(" ");

    return {
        has : 'where',
        property : {
            'id' : parts[0]
        },
        value : {
            'id' : parts[1]
        }
    };
}

function createEmptyRule() {
    return {
        has : 'where',
        property : {},
        propertyLabel : null,
        value : {},
        valueLabel : null
    };
}

class View {
    constructor(selector) {
        this.selector = $(selector);
        this.query = new Query();
        this.setup();
    }

    parseResult(result) {
        if (result.image) {
            result.thumb = result.image.value + '?width=300';
        }

        if (result.item) {
            result.id = result.item.value.replace('http://www.wikidata.org/entity/', '');
        }

        return result;
    }

    setup() {
        var self = this;

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

                hasOptions : [
                    { value : 'where', label : 'have' },
                    { value : 'minus', label : "don't have" }
                ],

                query : null,

                display : 'grid',

                rules : [ createEmptyRule() ],

                error : false,

                limit : DEFAULT_RESULT_LIMIT,

                loading : false,

                examples : EXAMPLES.map(function(e) {
                    e.data = e.data.map(parseWhere);
                    e.hash = encodeURIComponent(JSON.stringify(e.data));
                    return e;
                })
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
                    this.rules.push(createEmptyRule());
                },

                doQuery : function() {
                    this.results = [];

                    this.loading = true;

                    var rules = clone(this.rules);

                    rules.limit = this.limit;

                    this.query = self.query.build(rules);

                    self.query.fetch(this.query, function(results) {
                        this.results = results.map(self.parseResult);
                        this.loading = false;
                        this.hadResults = true;
                    }.bind(this));
                },

                removeRule : function(rule) {
                    this.rules = this.rules.filter(function(r) {
                        return r !== rule;
                    });
                },

                setDisplay : function(type) {
                    this.display = type;
                },

                parseHash : function() {
                    var hash = window.location.hash.slice(1);
                    this.rules = [];

                    Vue.nextTick(() => {
                        this.rules = JSON.parse(decodeURIComponent(hash));
                        window.scrollTo(0, 0);
                        this.doQuery();
                    });
                },

                setQuery : function() {
                    var hash = encodeURIComponent(JSON.stringify(this.rules));

                    // Make sure we can change limit/withimage
                    if (hash === window.location.hash.slice(1)) {
                        this.doQuery();
                    } else {
                        window.location.hash = hash;
                    }
                }
            }
        });
    }
};

export default View;