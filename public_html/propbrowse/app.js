window._scripts.push(function() {
    var $rows = $("table tbody tr");
    var $q = $("#q");
    var searchindex = [];
    var $resultcount = $("#resultcount");
    var $listview = $("#listview");
    var $table = $("table");

    function makeIndex() {
        $rows.each(function(index) {
            searchindex[index] = '';

            $(this).find('td').each(function() {
                searchindex[index] += $(this).text().trim().toLowerCase() + ' ';
            });
        });
    }

    function filter() {
        var q = $("#q").val().toLowerCase();
        var results = 0;

        if (!q) {
            reset();
            return;
        }

        searchindex.forEach(function(str, index) {
            var display = str.indexOf(q) !== -1;
            $rows.eq(index).toggle(display);

            if (display) results += 1;
        });

        $resultcount.find("span").text("Found " + results + " properties");
        $resultcount.removeClass('hidden');
    }

    function reset() {
        $q.val('');
        $resultcount.addClass('hidden');
        $rows.show();
    }

    $q.on('keyup', filter);
    $resultcount.on('click', '.btn', reset);
    var placeholder = 'Filter through ' + $rows.length + ' properties here';
    $q.attr('placeholder', placeholder);
    makeIndex();

    $listview.on('click', 'button', function() {
        var $el = $(this);
        $listview.find("button").removeClass('active');
        $el.addClass('active');
        $table.attr('data-view', $el.attr('data-view'));
    });
});