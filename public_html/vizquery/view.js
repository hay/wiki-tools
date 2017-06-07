window.View = (function() {
    var $ = document.querySelector.bind(document);
    var DEFAULT_LIMIT = 50;

    var exampleQuery = [
        { has : 'where', property : 'P31', value : 'Q2039348' },
        { has : 'where', property : 'P131', value : 'Q775' }
    ];

    function View(selector) {
        this.selector = $(selector);
        this.queryBuilder = new QueryBuilder($("#sparl-query").innerHTML);
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

                    limit : DEFAULT_LIMIT
                },

                methods : {
                    addRule : function() {
                        this.rules.push(createEmptyRule());
                    },

                    doQuery : function() {
                        var rules = clone(this.rules);

                        if (this.withimages) {
                            rules.push({
                                has : 'image'
                            });
                        }

                        rules.limit = this.limit;

                        var query = self.queryBuilder.stringify(rules);
                        console.log(query);
                    },

                    removeRule : function(rule) {
                        this.rules = this.rules.filter(function(r) {
                            return r !== rule;
                        });
                    },

                    setExample : function() {
                        this.rules = exampleQuery;
                    }
                }
            });
        }
    };

    return View;
})();