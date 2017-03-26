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
        properties = properties.map(function(prop) {
            if (prop.types) {
                prop.types = prop.types.join(', ');
            }

            if (prop.aliases) {
                prop.aliases = prop.aliases.join(' ');
            }

            prop.url = 'https://www.wikidata.org/wiki/Property:' + prop.id;

            prop.visible = true;

            prop.index = [prop.id, prop.label, prop.description].join(' ');

            return prop;
        });

        new Vue({
            el : "#content",
            data : {
                properties : properties,
                sortDirection : 1,
                view : 'detailed',
                q : '',
                shownProperties : properties.length
            },
            watch : {
                q : function(q) {
                    if (q.length < 3) {
                        this.properties = this.properties.map(function(p) {
                            p.visible = true;
                            return p;
                        });

                        this.shownProperties = this.properties.length;
                    } else {
                        this.shownProperties = 0;

                        this.properties = this.properties.map(function(p) {
                            var isVisible = p.index.indexOf(q) !== -1;

                            if (isVisible) {
                                this.shownProperties += 1;
                            }

                            p.visible = isVisible;

                            return p;
                        }, this );
                    }
                }
            },
            methods : {
                sortBy : function(key) {
                    this.properties = this.properties.sort(function(a, b) {
                        a = a[key];
                        b = b[key];

                        if (key === 'id') {
                            a = parseInt(a.replace('P', ''));
                            b = parseInt(b.replace('P', ''));
                        }

                        return a > b ? (1 * this.sortDirection) : -1 * this.sortDirection;
                    }.bind(this));

                    this.sortDirection = this.sortDirection * -1;
                }
            }
        })
    }

    function main() {
        load(view);
    }

    main();
})();