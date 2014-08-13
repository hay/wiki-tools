var app = angular.module('directory',[]);

app.factory('Api', function($http, $q) {
    var tools;

    return {
        loadTools : function() {
            var defer = $q.defer();

            // Make sure we only load the tools once in memory
            if (tools) {
                defer.resolve(tools);
            } else {
                $http.get("api.php").success(function(loadedTools) {
                    tools = loadedTools.map(function(tool) {
                        // Split keywords
                        if (tool.keywords) {
                            tool.keywords = tool.keywords.split(',').map(function(keyword) {
                                return keyword.trim();
                            });

                            return tool;
                        }
                    });

                    defer.resolve(tools);
                });
            }

            return defer.promise;
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

            if (parts[1]) {
                var filter = parts[0];
                var value = parts[1];
                filterTools(filter, value);
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

    $scope.resetFilter = function() {
        $scope.filter = null;
        $scope.value = null;
    }

    $scope.addTool = function() {
        // This is a bloody awful hack
        window.scrollTo(0, $("#addtool").offset().top);
    }
});