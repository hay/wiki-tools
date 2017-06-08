window.View = (function() {
    var $ = document.querySelector.bind(document);
    var DEFAULT_LIMIT = 50;

    function parseWhere(str) {
        var parts = str.split(" ");
        return { has : 'where', property : parts[0], value : parts[1] };
    }

    function View(selector, properties) {
        this.selector = $(selector);
        this.properties = properties;
        this.query = new Query($("#sparql-query").innerHTML);
        this.setup();
    }

    function createEmptyRule() {
        return {
            has : 'where',
            property : null,
            value : null
        };
    };

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    View.prototype = {
        parseResult : function(result) {
            if (result.image) {
                result.thumb = result.image.value + '?width=300';
            }

            if (result.item) {
                result.id = result.item.value.replace('http://www.wikidata.org/entity/', '');
            }

            return result;
        },

        setup : function() {
            var self = this;

            this.view = new Vue({
                el : this.selector,

                data : {
                    state : 'search',

                    results : false,

                    hasOptions : [
                        { value : 'where', label : 'have' },
                        { value : 'minus', label : "don't have" }
                    ],

                    query : null,

                    rules : [
                        {
                            has : 'where'
                        }
                    ],

                    error : false,

                    withimages : true,

                    limit : DEFAULT_LIMIT,

                    loading : false,

                    examples : EXAMPLES.map(function(e) {
                        e.data = e.data.map(parseWhere);
                        return e;
                    })
                },

                methods : {
                    addRule : function() {
                        this.rules.push(createEmptyRule());
                    },

                    doQuery : function() {
                        this.results = [];

                        this.loading = true;

                        var rules = clone(this.rules);

                        if (this.withimages) {
                            rules.push({
                                has : 'image'
                            });
                        }

                        rules.limit = this.limit;

                        this.query = self.query.build(rules);

                        self.query.fetch(this.query, function(results) {
                            this.results = results.map(self.parseResult);
                            this.loading = false;
                        }.bind(this));
                    },

                    removeRule : function(rule) {
                        this.rules = this.rules.filter(function(r) {
                            return r !== rule;
                        });
                    },

                    setExample : function(example) {
                        this.rules = example.data;
                    }
                }
            });
        }
    };

    return View;
})();