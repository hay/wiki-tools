var app = angular.module('directory',['ui.bootstrap']);

app.factory('util', function() {
    return {
        splittrim : function(str, by) {
            by = by || ',';

            return str.split(by).map(function(s) {
                return s.trim();
            });
        }
    };
});

app.factory('Api', function($http, $q, util) {
    var tools;

    function parseTools(toolData) {
        return toolData.map(function(tool) {
            // Add a 'fulltext' property for full-text searching
            tool.fulltext = '';

            for (var key in tool) {
                if (tool[key]) {
                    tool.fulltext += "," + tool[key].toLowerCase();
                }
            }

            // Split keywords
            if (tool.keywords) {
                tool.keywords = util.splittrim(tool.keywords);
            } else {
                tool.keywords = [];
            }

            // Split authors
            if (tool.author) {
                tool.author = util.splittrim(tool.author);
            } else {
                tool.author = []; // Fixing #8
            }

            // Add a 'source available keyword' if the source is, well, available
            if (tool.repository) {
                tool.keywords.push('source available');
            }

            return tool;
        });
    }

    return {
        loadTools : function() {
            var defer = $q.defer();

            // Make sure we only load the tools once in memory
            if (tools) {
                defer.resolve(tools);
            } else {
                $http.get("api.php").success(function(loadedTools) {
                    tools = parseTools(loadedTools);
                    defer.resolve(tools);
                });
            }

            return defer.promise;
        },

        trackClick : function(name) {
            $http.get('api.php?redirect=' + name);
        }
    };
});

app.controller('MainCtrl', function($scope, Api, $location) {
    $scope.loading = true;

    if ($location.path() === '') {
        $location.path('/');
    }

    $scope.location = $location;

    $scope.$watch('location.path()', function (path) {
        Api.loadTools().then(function(tools) {
            $scope.tools = tools;
            $scope.loading = false;

            var parts = path.slice(1).split('/');
            var filter = parts[0];
            var value = parts[1];

            if (['keyword', 'author'].indexOf(filter) !== -1) {
                filterTools(filter, value);
            }

            if (filter === 'search') {
                searchTools(value);
            }
        });
    });

    function filterTools(filter, value) {
        $scope.filter = filter;
        $scope.value = value;

        $scope.tools = $scope.tools.filter(function(tool) {
            window.scrollTo(0, 0);

            if (filter === 'keyword') {
                return tool.keywords.indexOf(value) !== -1;
            } else if (filter === 'author') {
                return tool.author.indexOf(value) !== -1;
            } else {
                return true;
            }
        });
    }

    function searchTools(q) {
        $scope.searchValue = q;

        Api.loadTools().then(function(tools) {
            if (!q) {
                $scope.tools = tools;
            } else {
                q = q.toLowerCase();

                $scope.tools = tools.filter(function(tool) {
                    return tool.fulltext.indexOf(q) !== -1;
                });

                $scope.noSearchResults = !$scope.tools.length;
            }
        });
    }

    $scope.resetFilter = function() {
        $scope.filter = null;
        $scope.value = null;
    }

    $scope.addTool = function() {
        // This is a bloody awful hack
        window.scrollTo(0, $("#addtool").offset().top);
    }

    $scope.search = function() {
        $location.path("/search/" + $scope.searchValue);
        // searchTools($scope.searchValue);
    }

    $scope.trackClick = function(name, url) {
        Api.trackClick(name);
    }
});