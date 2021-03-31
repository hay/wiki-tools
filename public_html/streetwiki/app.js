// TODO: for some reason the markers only show up on
// 'inline' maps, so you can either view the map or the pano,
// but it's not possible to show the markers on a pano that's
// in a different <div>, even it is attached to the map

function App() {
    this.startCoord = [52.080376, 4.327819]; // KB
    this.startPoint = this.getLatLng( this.startCoord ); // KB
    this.initMap(this.startPoint);
    this.initPano();
    this.markers = [];

    this.initWiki(this.startCoord, function(results) {
        this.fillMap(results);
    }.bind(this));

    $("#close").on('click', function() {
        $("#infobox").fadeOut();
    })
}

App.prototype = {
    fillMap : function(results) {
        results.articles.forEach(function(result) {
            var point = this.getLatLng([result.lat, result.lng]);

            var marker = new google.maps.Marker({
                position : point,
                map : this.map,
                icon : 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/50px-Wikipedia-logo-v2.svg.png',
                title : result.title
            });

            google.maps.event.addListener(marker, 'click', function() {
                $("#infobox .content").empty();
                $("#infobox .content").WikipediaWidget(result.title);
                $("#infobox").fadeIn();
            }.bind(this));
        }, this);
    },

    getLatLng : function(latlng) {
        var lat = parseFloat(latlng[0]);
        var lng = parseFloat(latlng[1]);
        return new google.maps.LatLng(lat, lng);
    },

    initMap : function(point) {
        var mapEl = $("#map").get(0);

        this.map = new google.maps.Map(mapEl, {
            center : point,
            zoom : 17
        });
    },

    initPano : function() {
        this.pano = this.map.getStreetView();
    },

    initWiki : function(coord, cb) {
        var url = ''.concat(
            'http://api.wikilocation.org/articles',
            '?lat=' + coord[0] + '&lng=' + coord[1],
            '&limit=50&jsonp=?&radius=2000m'
        );

        $.getJSON(url, function(results) {
            cb(results);
        });
    }
}