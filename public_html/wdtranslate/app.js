var app = angular.module('wdtranslate', ['ui.bootstrap']);

app.factory('api', function($http) {
    var API_ENDPOINT = 'https://www.wikidata.org/w/api.php';

    return {
        entity : function(id, langs) {
            var params = {
                'action' : 'wbgetentities',
                'ids' : id,
                'format' : 'json',
                'callback' : 'JSON_CALLBACK',
                'languages' : langs.join('|'),
                'props' : 'labels|descriptions'
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

app.factory('config', function() {
    var config;

    var api = {
        get : function(key) {
            return config[key];
        },

        save : function() {
            window.localStorage.setItem('wdtranslate', JSON.stringify(config));
        },

        set : function(key, val) {
            config[key] = val;
            api.save();
        }
    };

    if (!window.localStorage.getItem('wdtranslate')) {
        config = {
            'inputLanguage' : 'en',
            'preferredLanguages' : ['en', 'de', 'es', 'fr', 'nl']
        };

        api.save();
    } else {
        config = JSON.parse( window.localStorage.getItem('wdtranslate') );
    }

    return api;
});

app.filter('language', function() {
    return function(input) {
        return window.LANGUAGES.filter(function(lang) {
            return lang.code == input;
        })[0].label;
    };
});

app.controller('MainCtrl', function($scope, api, config, $modal) {
    $scope.loading = false;
    $scope.inputLanguage = config.get("inputLanguage");

    function updatePreferredLangues() {
        $scope.preferredLanguages = languages.filter(function(language) {
            return language.preferred;
        });
    }

    var languages = window.LANGUAGES.map(function(lang) {
        lang.preferred = config.get('preferredLanguages').indexOf(lang.code) !== -1;
        lang.label = lang.label[0].toUpperCase() + lang.label.slice(1);
        return lang;
    });

    $scope.suggest = function(q) {
        $scope.loading = true;

        return api.search(q, $scope.inputLanguage).then(function(res) {
            $scope.loading = false;

            return res.data.search.map(function(result) {
                return {
                    description : result.description,
                    label : result.label,
                    value : result.id
                };
            });
        });
    }

    $scope.search = function(term) {
        $scope.currentTerm = term;

        var preferredLanguages = $scope.preferredLanguages.map(function(lang) {
            return lang.code;
        });

        $scope.loading = true;

        api.entity(term.value, preferredLanguages).then(function(res) {
            $scope.loading = false;

            $scope.labels = [];
            var data = res.data.entities[term.value];

            for (var key in data.labels) {
                var label = data.labels[key];

                if (data.descriptions && data.descriptions[key]) {
                    label.description = data.descriptions[key].value;
                }

                $scope.labels.push(label);
            }
        });
    };

    $scope.selectPreferredLanguages = function() {
        var modal = $modal.open({
            templateUrl : 'languageModal.html',
            controller : function($scope, $modalInstance) {
                $scope.languages = languages;

                $scope.ok = function() {
                    $modalInstance.close($scope.languages);
                }
            },
            size : 'lg'
        });

        modal.result.then(function(newLanguages) {
            languages = newLanguages;
            updatePreferredLangues();
        });
    };

    $scope.$watch("inputLanguage", function() {
        config.set('inputLanguage', $scope.inputLanguage);
    });

    $scope.$watch("preferredLanguages", function() {
        config.set(
            'preferredLanguages',
            $scope.preferredLanguages.map(function(lang) {
                return lang.code;
            })
        );
    });

    updatePreferredLangues();
});