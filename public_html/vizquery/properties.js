window.Properties = (function() {
    // Currently, we only allow these items
    var VALID_DATATYPES = ['string', 'external-id', 'wikibase-item'];
    var MAX_RESULTS = 10;

    function addIndex(prop) {
        if (prop.types) {
            prop.types = prop.types.join(', ');
        }

        if (prop.aliases) {
            prop.aliases = prop.aliases.join(' ');
        }

        prop.url = 'https://www.wikidata.org/wiki/Property:' + prop.id;

        prop.index = [prop.id, prop.label, prop.description].join(' ').toLowerCase();

        return prop;
    }

    function Properties(data) {
        this.data = data.filter(function(d) {
            return VALID_DATATYPES.indexOf(d.datatype) !== -1;
        }).map(addIndex);
    }

    Properties.prototype = {
        query : function(q) {
            q = q.toLowerCase();
            var count = 0;
            var results = [];

            return new Promise(function(resolve, reject) {
                for (var i = 0; i < this.data.length; i++) {
                    var p = this.data[i];

                    if (p.index.indexOf(q) !== -1) {
                        results.push(p);
                        count += 1;
                    }

                    if (count >= MAX_RESULTS) {
                        break;
                    }
                }

                resolve(results);
            }.bind(this));
        }
    };

    return Properties;
})();