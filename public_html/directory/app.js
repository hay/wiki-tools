var $tools = $("[data-tool]");

function getHash() {
    var hash = window.location.hash.replace('#/', '');

    if (!hash) {
        return { action : 'showall', value : true };
    }

    var parts = hash.split('/');

    return {
        action : parts[0],
        value : parts[1]
    };
}

function bindEventHandlers() {
    $(window).on('hashchange', function( ){
        var hash = getHash();
        filter(hash.action, hash.value);
    });

    $("#q").on('keyup', function() {
        var val = $("#q").val();
        window.location.hash = '/search/' + val;
    });
}

function forTools(fn) {
    var count = 0;

    $tools.each(function() {
        var name = $(this).attr('data-tool');
        var tool = window._toolindex[name];
        var visible = fn(tool);

        if (visible) {
            count++;
            $(this).show();
        } else {
            $(this).hide();
        }
    });

    return count;
}

function filter(action, value) {
    var count;

    // Check for empty searches
    if (action === 'search' && !value) {
        window.location.hash = '/showall';
    }

    if (action === 'showall') {
        $tools.show();
        $("#q").val('');
        updateAlert(false);
    }

    if (action === 'search') {
        $("#q").val(value);

        count = forTools(function(tool) {
            return tool.fulltext.indexOf(value) !== -1;
        });

        if (count > 0) {
            var msg = "Found " + count + " tool(s) for <strong>'" + value + "'</strong>.";
            updateAlert(true, msg);
        }

        if (count === 0) {
            updateAlert(true, "No search results for this query...");
        }
    }

    if (action === 'keyword') {
        count = forTools(function(tool) {
            return tool.keywords.indexOf(value) !== -1;
        });
    }

    if (action === 'author') {
        count = forTools(function(tool) {
            return tool.author.indexOf(value) !== -1;
        });
    }

    if (['author', 'keyword'].indexOf(action) !== -1) {
        var msg = 'Only showing ' + count + ' tools with <strong>' + value + '</strong> as <strong>' + action + '</strong>.';
        updateAlert(true, msg);
        $("#search").hide();
    } else {
        $("#search").show();
    }
}

function updateAlert(show, html) {
    if (show) {
        $('#alert span').html(html);
        $("#alert").show();
        $("#toolcount").hide();
    } else {
        $("#alert").hide();
        $("#toolcount").show();
    }
}

function main() {
    bindEventHandlers();
    var hash = getHash();
    filter(hash.action, hash.value);
}

main();