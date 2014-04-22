<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("wdview");
    $hay->header();
?>
    <h1><?php $hay->title(); ?></h1>

    <?php if (empty($_GET['q'])) : ?>
        <p class="lead"><?php $hay->description(); ?></p>

        <form action="index.php" method="get" role="form">
            <div class="input-group">
                <input type="text" id="q" name="q" class="form-control" autocomplete="off" />

                <div class="input-group-btn">
                    <button type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-search"></span>
                        Lookup
                    </button>
                </div>
            </div>

            <div class="form-group">
                <label for="lang">Language</label>
                <select name="lang" id="lang" class="form-control">
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                </select>
            </div>
        </form>

        <h3>Examples</h3>
        <ul>
            <li><a href="?q=690554">Aart Staartjes</a></li>
            <li><a href="?q=Q426489">Mies Bouwman</a></li>
        </ul>

    <?php else: ?>
        <script>
            // This should be a lot prettier
            var WIKIDATA_Q = "<?php echo $_GET['q']; ?>";
        </script>

        <div id="item" ng-app="app" ng-controller="itemCtrl">
            <h1>{{label}} <small>({{id}})</small></h1>
            <h2>{{description}}</h2>

            <dl>
                <div ng-repeat="claim in claims">
                    <dt>{{claim.property_labels}}</dt>
                    <dd ng-bind-html="claim.valueHtml">{{claim.valueHtml}}</dd>
                </div>
            </dl>
        </div>
    <?php endif; ?>

    <script src="../common/angular.js"></script>
    <script src="../common/jquery.js"></script>
    <script src="../common/moment.js"></script>
    <script src="../common/typeahead.bundle.js"></script>
    <script src="app.js"></script>
    <script>
        function search(q, cb) {
            console.log(q);
            cb(['aap' + q]);
        }

        $("#q").typeahead({
            minLength : 3
        }, {
            name : 'wdview',
            source : function(q, cb) {
                console.log(q);
                cb(['aap' + q]);
            }
        });
    </script>
<?php
    Hay::footer();
?>