<?php
    require '../../lib/class-hay.php';
    Hay::header();
?>
    <h1>GTAA Reasonator</h1>

    <?php if (empty($_GET['id'])) : ?>

        <p class="lead">The <a href="tools.wmflabs.org/reasonator/">Reasonator</a> is an awesome tool for viewing <a href="http://www.wikidata.org">Wikidata</a> items. This tool tries to provide the same view for items in the <a href="https://sites.google.com/a/beeldengeluid.nl/gtaa/">GTAA</a>.</p>

        <h3>Examples</h3>
        <ul>
            <li><a href="?id=85227">Mies Bouwman</a></li>
        </ul>

    <?php else: ?>

        <script>
            // This should be a lot prettier
            var GTAA_ID = <?php echo $_GET['id']; ?>;
        </script>

        <div id="item" ng-app="gtaa" ng-controller="itemCtrl">
            <h2>{{label}} (<a href="http://data.beeldengeluid.nl/gtaa/{{gtaaId}}">{{gtaaId}}</a>, <a href="http://wikidata.org/wiki/{{wikidataId}}">{{wikidataId}}</a>)</h2>
            <h3>{{docprops}}</h3>

            <dl class="dl-horizontal">
                <div ng-repeat="claim in claims">
                    <dt>{{claim.property_labels}}</dt>
                    <dd>{{claim.value}}</dd>
                </div>
            </dl>
        </div>

        <script src="../common/angular.js"></script>
        <script src="gtaa.js"></script>

    <?php endif; ?>
<?php
    Hay::footer();
?>