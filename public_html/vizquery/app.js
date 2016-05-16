// var url = 'http://www.wikidata.org/w/api.php?callback=?&action=wbsearchentities&limit=10&format=json&language=en&type=' + type + '&search=' + q;

function createEmptyRule() {
    return {
        has : 'where',
        property : null,
        value : null
    };
};

function Query() {
    this.tmpl = Handlebars.compile(document.querySelector('#sparl-query').innerHTML);
}

Query.prototype = {
    stringify : function(q) {
        console.log(q);
        var view = {
            where : _.where(q, { 'has' : 'where' }),
            minus : _.where(q, { 'has' : 'minus' })
        };

        console.log(view);

        return this.tmpl(view);
    }
};

var query = new Query();

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var vue = new Vue({
    el : "#wrapper",
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
        ]
    },
    methods : {
        addRule : function() {
            this.rules.push(createEmptyRule());
        },

        doQuery : function() {
            this.query = query.stringify(clone(this.rules));
        },

        removeRule : function(rule) {
            this.rules = this.rules.filter(function(r) {
                return r !== rule;
            });
        }
    }
});