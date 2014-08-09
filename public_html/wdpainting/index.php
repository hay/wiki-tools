<?php
    require '../../lib/class-hay.php';
    $hay = new Hay("wdpainting");
    $hay->header();
?>
    <style>
        #wrapper {
            max-width: inherit;
        }

        #paintings li {
            list-style: none;
            float: left;
            margin-right: 20px;
        }
    </style>

    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <div id="app" ng-controller="MainCtrl" class="clearfix">
        <h3 ng-show="loading">
            Loading some paintings, this can be a bit slow...
            <img src="../common/loader.gif" alt="">
        </h3>

        <div id="paintings">
            <ul>
                <li ng-repeat="painting in paintings">
                    <img ng-src="{{painting.image.thumburl}}" />
                </li>
            </ul>
        </div>
    </div>

    <script src="../common/angular.js"></script>
    <script src="app.js"></script>
<?php
    $hay->footer();
?>