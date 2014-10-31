var PAINTING_CLAIM = "claim[31:3305213]";
var PAGE = 0;
var IMAGE_WIDTH = 300;
var IMAGE_HEIGHT = 300;

var app = angular.module('wdpainting', []);

app.factory('Api', function($http, $q) {
    var endpoint = "http://api.haykranen.nl";
    // var endpoint = "http://localhost:5000";

    function query() {
        return $http({
            url : endpoint + '/wikidata/query',
            params : {
                q : PAINTING_CLAIM
            }
        });
    }

    function entities(qids) {
        return $http({
            url : endpoint + '/wikidata/entity',
            params : {
                q : qids.join(','),
                resolveimages : true,
                imagewidth : IMAGE_WIDTH,
                imageheight : IMAGE_HEIGHT
            }
        });
    }

    return {
        paintings : function() {
            var deferred = $q.defer();

            query().success(function(paintings) {
                entities(paintings.response).success(function(data) {
                    deferred.resolve(data.response);
                });
            });

            return deferred.promise;
        }
    }
});

app.controller('MainCtrl', function($scope, Api) {
    $scope.loading = true;

    var paintingsDeferred = Api.paintings();

    paintingsDeferred.then(function(paintings) {
        $scope.loading = false;
        $scope.paintings = paintings;
    });
});