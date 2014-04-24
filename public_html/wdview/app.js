// TODO: somehow fold this into the tool
// https://www.wikidata.org/wiki/MediaWiki:Gadget-AuthorityControl.js
//

var conf = {
    lang : 'en'
};

function Api() {
    this.endpoint = "http://api.haykranen.nl";
}

Api.prototype = {
    call : function(cmd, params, cb) {
        $.getJSON(this.endpoint + '/' + cmd, params, cb);
    },

    formatClaim : function(claim) {
        claim.value = claim.values.map(function(val) {
            if (val.datatype === 'wikibase-item') {
                return '<a href="?id=' + val.value + '">' + (val.value_labels || val.value) + '</a>';
            }

            if (val.datatype === 'time') {
                // Slice of the + and the 7 zeroes following
                var time = val.value.time.slice(8);
                return moment(time).format('D MMMM YYYY');
            }

            if (val.value_labels) {
                return val.value_labels;
            }

            if (val.value) {
                return val.value;
            }

            return "???";
        }).join(', ');

        return claim;
    },

    getImage : function(claims) {
        var image = claims.filter(function(claim) {
            return claim.property_id === 'P18';
        });

        return image.length ? image[0].value : false;
    },

    image : function(q, params, cb) {
        this.call('wmcommons', {
            method : 'imageinfo',
            q : q,
            width : params.width,
            height : params.height
        }, cb);
    },

    search : function(q, cb) {
        this.call('wikidata', {
            method : 'search',
            q : q,
            language : conf.lang
        }, cb);
    },

    entity : function(q, cb) {
        this.call('wikidata', {
            method : 'entity',
            q : q,
            language : conf.lang
        }, function(data) {
            var response = data.response[q];

            response.claims = response.claims ? response.claims.map(this.formatClaim) : [];

            response.image = this.getImage( response.claims );

            cb(response);
        }.bind(this));
    }
};

function extend(a, b) {
    for (var key in b) {
        a[key] = b[key];
    }
}

function View( el ) {
    this.$el = $(el);
}

extend(View.prototype, {
    constructor : View,

    loading : function(bool) {
        this.$el.find(".loading").toggle(bool);
    }
});

function Item() {
    View.prototype.constructor.apply(this, arguments);
    this.id = window.WIKIDATA_ID;
    this.api = new Api();
    this.loading(true);

    if (this.id[0] !== "Q") {
        this.id = "Q" + this.id;
    }

    this.load();
}

Item.prototype = Object.create(View.prototype);

extend(Item.prototype, {
    load : function() {
        this.api.entity(this.id, function(data) {
            this.label = data.labels;
            this.id = data.id;
            this.description = data.descriptions;
            this.claims = data.claims;
            this.image = data.image;

            if (this.image) {
                this.api.image(this.image, {
                    width : 300,
                    height : 300
                }, function(image) {
                    this.image = image.response[0].thumburl;
                    this.renderImage();
                }.bind(this));
            } else {
                this.image = 'http://placekitten.com/200/150';
            }

            this.render();
        }.bind(this));
    },

    renderClaim : function(claim) {
        return ''.concat(
            '<tr>',
            '<td><strong>' + (claim.property_labels || claim.property_id) + '</strong></td>',
            '<td>' + claim.value || 'No label' + '</td>',
            '</tr>'
        );
    },

    renderImage : function(image) {
        this.$el.find(".image").html('<img src="' + this.image + '" />');
    },

    render : function() {
        this.loading(false);
        this.$el.find(".mainlabel").html(this.label);
        this.$el.find(".description").html(this.description);
        this.$el.find(".image").html(this.image);

        var claims = this.claims.map(this.renderClaim);

        // Add the Wikidata ID
        claims.unshift(
            this.renderClaim({
                property_labels : 'Wikidata ID',
                value : '<a target="_blank" href="//wikidata.org/wiki/' + this.id + '">' + this.id + '</a>'
            })
        );

        this.$el.find(".itemdata").html(claims);
    }
});

function SearchResults() {
    View.prototype.constructor.apply(this, arguments);
    this.q = window.WIKIDATA_Q;
    this.loading(true);
    this.api = new Api();
    this.load();
}

SearchResults.prototype = Object.create(View.prototype);

extend(SearchResults.prototype, {
    load : function() {
        this.api.search(this.q, function(data) {
            this.loading(false);
            this.results = data.response;
            this.render();
        }.bind(this))
    },

    render : function() {
        var html = this.results.map(function(r) {
            var title = r.description ? r.label + ' - ' + r.description : r.label;

            return ''.concat(
                '<li><a href="index.php?id=' + r.id + '">',
                title,
                '</a></li>'
            );
        });

        this.$el.find("ul").html( html.join('') );
    }
});

function App() {
    $("#lang").on('change', function() {
        conf.lang = $("#lang").val();
        this.view.load();
    }.bind(this));

    if (window.WIKIDATA_ID) {
        this.view = new Item("#item");
    } else if (window.WIKIDATA_Q) {
        this.view = new SearchResults("#searchresults");
    }
}