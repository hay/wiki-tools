window.Query = (function() {
    // var url = 'http://www.wikidata.org/w/api.php?callback=?&action=wbsearchentities&limit=10&format=json&language=en&type=' + type + '&search=' + q;
    //
    //
    var QUERY_ENDPOINT = "https://query.wikidata.org/sparql?format=json&query=%s";

    function Query(queryHtml) {
        this.tmpl = Handlebars.compile(queryHtml);
    }

    Query.prototype = {
        build : function(q) {
            var view = {
                where : _.where(q, { 'has' : 'where' }),
                minus : _.where(q, { 'has' : 'minus' }),
                limit : q.limit
            };

            var hasimage = !!_.findWhere(q, { has : 'image' });

            if (hasimage) {
                view.where.push({
                    property : 'P18',
                    value : '?image'
                });
            }

            view.where = view.where.map(function(v) {
                var val = v.value.trim();
                v.value = val.charAt(0) === "Q" ? "wd:" + val : val;
                return v;
            })

            return this.tmpl(view);
        },

        fetch : function(query, callback) {
            var url = QUERY_ENDPOINT.replace('%s', encodeURIComponent(query));

            fetch(url).then(function(res) {
                return res.json();
            }).then(function(results) {
                callback(results.results.bindings);
            });
        }
    };

    return Query;
})();