var app = angular.module('directory', ['ui.router']).config(
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/404');

        $stateProvider
            .state('root', {
                url : '/'
            })
            .state('keyword', {
                url : '/keyword/:keyword'
            })
            .state('author', {
                url : '/author/:author'
            });
    }
);

app.controller('MainCtrl', function($scope, $http) {
    $scope.loading = true;

    $http.get("api.php").success(function(tools) {
        // Split keywords
        tools = tools.map(function(tool) {
            if (tool.keywords) {
                tool.keywords = tool.keywords.split(',').map(function(keyword) {
                    return keyword.trim();
                });

                return tool;
            }
        });
        $scope.tools = tools;
        $scope.loading = false;
    });
});