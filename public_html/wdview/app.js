// TODO: somehow fold this into the tool
// https://www.wikidata.org/wiki/MediaWiki:Gadget-AuthorityControl.js
var app = angular.module('app', []);

app.factory('api', function($http, $sce) {
    var API_ENDPOINT = "http://api.haykranen.nl";

    function call(cmd, params, cb) {
        var req = $http({
            url : API_ENDPOINT + '/' + cmd,
            method : 'GET',
            params : params
        });

        req.success(function(d) {
            cb(d);
        });
    }

    function formatClaim(claim) {
        claim.value = claim.values.map(function(val) {
            if (val.datatype === 'time') {
                return val.value.time;
            }

            if (val.datatype === 'commonsMedia') {
                return '<img src="' + val.value.thumburl + '" />';
            }

            if (val.value_labels) {
                return val.value_labels;
            }

            if (val.value) {
                return val.value;
            }

            return "???";
        }).join(', ');

        claim.valueHtml = $sce.trustAsHtml(claim.value);

        return claim;
    }

    function wikidataSearch(q, lang, cb) {
        call('wikidata', { method : 'search', q : q, language : lang}, cb);
    }

    function wikidataEntity(q, lang, cb) {
        call('wikidata', {
            method : 'entity',
            q : q,
            language : lang
        }, function(data) {
            var response = data.response[q];
            response.claims = response.claims.map(formatClaim);
            cb(response);
        });
    }

    return {
        wikidataSearch : wikidataSearch,
        wikidataEntity : wikidataEntity,
    };
});

app.controller('itemCtrl', function($scope, $http, api, $window, $sce) {
    $scope.id = $window.WIKIDATA_ID;
    $scope.lang = $window.WIKIDATA_LANG || 'en';
    $scope.loading = true;

    if ($scope.id[0] !== "Q") {
        $scope.id = "Q" + $scope.id;
    }

    api.wikidataEntity($scope.id, $scope.lang, function(data) {
        $scope.loading = false;
        $scope.label = data.labels;
        $scope.id = data.id;
        $scope.description = data.descriptions;
        $scope.claims = data.claims;
        $scope.image = data.claims.filter(function(claim) {
            return claim.value.indexOf("<img") !== -1;
        })[0].value;
        $scope.image = $sce.trustAsHtml($scope.image);
    });
});

app.controller('searchResultsCtrl', function($scope, api, $window) {
    $scope.q = $window.WIKIDATA_Q;
    $scope.lang = $window.WIKIDATA_LANG || 'en';
    $scope.loading = true;

    api.wikidataSearch($scope.q, $scope.lang, function(data) {
        $scope.loading = false;
        $scope.results = data.response;
    });
});

app.controller('appCtrl', function($scope) {
    $scope.lang = 'en';

    $scope.changeLang = function() {

    };
});