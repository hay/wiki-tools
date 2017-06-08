window.wdapi = {
    search : function(type, q) {
        var url = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&origin=*&format=json&language=en&type=' + type;
        url += '&search=' + encodeURIComponent(q);

        return fetch(url).then(function(res) {
            return res.json();
        });
    }
};