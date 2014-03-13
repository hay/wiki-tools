function App() {
    this.pano = this.initPano();
}

App.prototype = {
    getPano : function() {
        return {
            tiles : {
                tileSize : new google.maps.Size(1024, 512),
                worldSize : new google.maps.Size(1024, 512),
                centerHeading : 105,
                getTileUrl : this.getPanoTile.bind(this)
            }
        }
    },

    getPanoTile : function(pano) {
        this.pano.setZoom(2);
        return 'pano1.jpg';
    },

    initPano : function() {
        var panoEl = $("#pano").get(0);

        return new google.maps.StreetViewPanorama(panoEl, {
            pano : 'pano1',
            panoProvider : this.getPano.bind(this),
            visible : true
        });
    },
};