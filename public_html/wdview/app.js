var app = angular.module('app', []);
var LANG = 'nl';

app.factory('api', function($http, $sce) {
    var API_ENDPOINT = "http://api.haykranen.nl";
    var lang = LANG;

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

        console.log(claim);

        return claim;
    }

    function wikidataSearch(q, cb) {
        call('wikidata', { method : 'search', q : q, language : lang}, cb);
    }

    function wikidataEntity(q, cb) {
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

app.controller('itemCtrl', function($scope, $http, api, $window) {
    $scope.q = $window.WIKIDATA_Q;

    if ($scope.q[0] !== "Q") {
        $scope.q = "Q" + $scope.q;
    }

    api.wikidataEntity($scope.q, function(data) {
        $scope.label = data.labels;
        $scope.id = data.id;
        $scope.description = data.descriptions;
        $scope.claims = data.claims;
    });
});
