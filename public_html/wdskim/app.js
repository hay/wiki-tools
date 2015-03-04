$(function() {
    function autocomplete(id, type, showDescription) {
        var input = '[data-name="' + id + '"]';
        var $input = $(input);
        var $val = $("#" + id);

        if ($input.length === 0) return;

        var awesome = new Awesomplete(input, {
            replace : function(text) {
                var parts = text.split(':');
                $val.val(parts[0].trim());
                this.input.value = parts.join(':');
            }
        });

        $input.on('keyup', _.debounce(function() {
            var q = $input.val();
            var url = 'http://www.wikidata.org/w/api.php?callback=?&action=wbsearchentities&limit=10&format=json&language=en&type=' + type + '&search=' + q;

            $.getJSON(url, function(data) {
                if (!data.search) return;

                awesome.list = data.search.map(function(item) {
                    var label = item.label || '';
                    var description = item.description || '';
                    var line = label + ' - ' + description;
                    return item.id + ' : ' + line;
                });
            });
        }, 200));
    }

    function masonry() {
        var container = $(".thumbnail-grid").get(0);
        imagesLoaded(container, function() {
            var grid = new Masonry(container, {
                itemSelector : '.thumbnail'
            });
        });
    }

    $("#show-advanced").on('click', function(e) {
        e.preventDefault();
        $("#advanced").toggleClass('hidden');
    })

    autocomplete('prop', "property", false);
    autocomplete('item', "item", true);
    masonry();
});