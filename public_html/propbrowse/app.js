(function() {
    function load(cb) {
        superagent.get("props.json").end(function(err, res) {
            if (err) {
                alert("Something went wrong loading the properties...");
            } else {
                cb(res.body);
            }
        });
    }

    function view(properties) {
        new Vue({
            el : "#content",
            data : {
                properties : properties
            }
        })
    }

    function main() {
        load(view);
    }

    main();
})();