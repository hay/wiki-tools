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
    $tools.each(function() {
        var name = $(this).attr('data-tool');
        var tool = window._toolindex[name];
        var visible = fn(tool);

        if (visible) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filter(action, value) {
    if (action === 'showall') {
        $tools.show();
        return;
    }

    if (action === 'search') {
        $("#q").val(value);

        forTools(function(tool) {
            return tool.fulltext.indexOf(value) !== -1;
        });
    }

    if (action === 'keyword') {
        forTools(function(tool) {
            return tool.keywords.indexOf(value) !== -1;
        });
    }

    if (action === 'author') {
        forTools(function(tool) {
            return tool.author.indexOf(value) !== -1;
        });
    }
}

function main() {
    bindEventHandlers();
    var hash = getHash();
    filter(hash.action, hash.value);
}

main();