<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';

    $hay = new Hay("directory");
    $hay->header();
?>
    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <style>
        #wrapper {
            max-width: inherit;
        }
    </style>

    <div id="app" ng-controller="MainCtrl">
        <h3 ng-show="loading">Loading...</h3>

        <div class="alert alert-info" ng-show="filter">
            Only showing all tools with <strong>{{value}}</strong> as <strong>{{filter}}</strong>.
            <a href="#" ng-click="resetFilter()">Show all tools instead?</a>
        </div>

        <ul class="tools">
            <li ng-repeat="tool in tools" class="tools-item col-md-4">
                <h3><a href="{{tool.url}}">{{tool.name}}</a></h3>
                <h4>{{tool.description}}</h4>
                <h5>By <a href="#/author/{{tool.author}}">{{tool.author}}</a></h5>

                <p class="tools-keywords">
                    <a href="#/keyword/{{keyword}}" ng-repeat="keyword in tool.keywords">
                    {{keyword}}
                    </a>
                </p>
            </li>
        </ul>
    </div>

    <script src="../common/angular.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>