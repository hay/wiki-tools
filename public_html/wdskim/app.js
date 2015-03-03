$(function() {
    function autocomplete(id, type) {
        var $input = $(id);

        var awesome = new Awesomplete(id, {
            replace : function(text) {
                this.input.value = text.split(':').shift();
            }
        });

        $input.on('keyup', _.debounce(function() {
            var q = $input.val();
            var url = 'http://www.wikidata.org/w/api.php?callback=?&action=wbsearchentities&limit=10&format=json&language=en&type=' + type + '&search=' + q;

            $.getJSON(url, function(data) {
                if (!data.search) return;

                awesome.list = data.search.map(function(item) {
                    return item.id + ': ' + item.label;
                });
            });
        }, 200));
    }

    $("#show-advanced").on('click', function(e) {
        e.preventDefault();
        $("#advanced").toggleClass('hidden');
    })

    autocomplete("#prop", "property");
    autocomplete("#item", "item");
});