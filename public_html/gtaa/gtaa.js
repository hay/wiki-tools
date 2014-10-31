var gtaa = angular.module('gtaa', []);
var LANG = 'nl';

gtaa.factory('api', function($http) {
    var API_ENDPOINT = "http://api.haykranen.nl";
    var lang = LANG;

    function call(cmd, params, cb) {
        var req = $http({
            url : API_ENDPOINT + '/' + cmd,
            method : 'GET',
            params : params
        });

        req.success(function(d) {
            cb(d.response);
        });
    }

    function gtaaConcept(id, cb) {
        call('gtaa', { method : 'concept', q : id }, cb);
    }

    function wikidataSearch(q, cb) {
        call('wikidata/search', { q : q, language : lang}, cb);
    }

    function wikidataEntity(q, cb) {
        call('wikidata/entity', { q : q, language : lang}, cb);
    }

    function wikidataSearchAndGet(str, cb) {
        // Obviously, this is a pretty awful solution, but oh well
        wikidataSearch(str, function(a) {
            var id = a[0].id;
            wikidataEntity(id, function(d) {
                cb(d[id]);
            });
        });
    }

    return {
        gtaaConcept : gtaaConcept,
        wikidataSearch : wikidataSearch,
        wikidataEntity : wikidataEntity,
        wikidataSearchAndGet : wikidataSearchAndGet
    };
});

gtaa.controller('itemCtrl', function($scope, $http, api, $window, $sce) {
    $scope.gtaaId = $window.GTAA_ID;

    api.gtaaConcept($scope.gtaaId, function(data) {
        $scope.label = data.hiddenLabel[0]; // I don't know man...
        $scope.docprops = data.DocumentationProperties.join(', ');

        api.wikidataSearchAndGet($scope.label, function(data) {
            $scope.wikidataId = data.id;
            $scope.claims = data.claims.map(function(claim) {
                claim.value = claim.values.map(function(val) {
                    if (val.datatype === 'time') {
                        return val.value.time;
                    }

                    if (val.value_labels) return val.value_labels;

                    if (val.value) return val.value;

                    return "Geen flauw idee";
                }).join(', ');

                return claim;
            });
        });
    });
});
