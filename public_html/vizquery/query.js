window.QueryBuilder = (function() {
    // var url = 'http://www.wikidata.org/w/api.php?callback=?&action=wbsearchentities&limit=10&format=json&language=en&type=' + type + '&search=' + q;
    //
    function QueryBuilder(queryHtml) {
        this.tmpl = Handlebars.compile(queryHtml);
    }

    QueryBuilder.prototype = {
        stringify : function(q) {

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
        }
    };

    return QueryBuilder;
})();