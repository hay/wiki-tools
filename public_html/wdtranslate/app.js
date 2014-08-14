var app = angular.module('wdtranslate', ['ui.bootstrap']);

app.factory('api', function($http) {
    var API_ENDPOINT = 'https://www.wikidata.org/w/api.php';

    return {
        entity : function(id) {
            var params = {
                'action' : 'wbgetentities',
                'ids' : id,
                'format' : 'json',
                'callback' : 'JSON_CALLBACK'
            };

            return $http.jsonp(API_ENDPOINT, { params : params });
        },

        search : function(q, lang) {
            var params = {
                'action' : 'wbsearchentities',
                'search' : q,
                'format' : 'json',
                'language' : lang,
                'type' : 'item',
                'callback' : 'JSON_CALLBACK'
            };

            return $http.jsonp(API_ENDPOINT, { params : params });
        }
    };
});

app.filter('language', function() {
    return function(input) {
        return window.LANGUAGES.filter(function(lang) {
            return lang.code == input;
        })[0].label;
    };
});

app.controller('MainCtrl', function($scope, api, $modal) {
    $scope.languages = window.LANGUAGES;
    $scope.inputlanguage = {
        'code' : 'en',
        'label' : 'English'
    };
    $scope.languageChooser = 'Aap';

    $scope.suggest = function(q) {
        return api.search(q, $scope.inputlanguage.code).then(function(res) {
            return res.data.search.map(function(result) {
                return {
                    label : result.label,
                    value : result.id
                };
            });
        });
    }

    $scope.search = function(term) {
        api.entity(term.value).then(function(res) {
            $scope.labels = [];
            var labels = res.data.entities[term.value].labels;

            for (var key in labels) {
                $scope.labels.push(labels[key]);
            }
        });
    };

    $scope.selectLanguage = function() {
        var modal = $modal.open({
            templateUrl : 'languageModal.html',
            controller : function($scope, $modalInstance) {
                $scope.languages = window.LANGUAGES;

                $scope.setLanguage = function(language) {
                    $modalInstance.close(language);
                }
            },
            size : 'lg'
        });

        modal.result.then(function(language) {
            $scope.inputlanguage = language;
        });
    }
});