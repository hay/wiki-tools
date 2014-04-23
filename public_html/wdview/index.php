<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("wdview");
    $hay->header();
?>
<style>
    h1 {
        margin: 0 0 20px 0;
    }

    form {
        margin-top: 5px;
    }
</style>

<div ng-app="app">
    <div class="row" ng-controller="appCtrl">
        <div class="col-md-12">
            <a href="#" ng-click="changeLang" class="pull-right">{{lang}}</a>
        </div>

        <div class="col-md-6">
            <h1><a href="index.php"><?php $hay->title(); ?></a></h1>
        </div>

        <div class="col-md-6">
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
            </form>
        </div>
    </div>

    <?php if (!empty($_GET['id'])): ?>
        <script>
            // This should be a lot prettier
            var WIKIDATA_ID = "<?php echo $_GET['id']; ?>";
        </script>

        <div ng-controller="itemCtrl" class="row">
            <div ng-show="loading">Loading...</div>

            <div class="col-md-12">
                <h1>{{label}}</h1>
                <h2>{{description}}</h2>
            </div>

            <div class="col-md-6">
                <div class="image" ng-bind-html="image">{{image}}</div>
            </div>

            <div class="col-md-6">
                <table class="table">
                    <tr>
                        <td><strong>Wikidata ID</strong></td>
                        <td>{{id}}</td>
                    </tr>
                    <tr ng-repeat="claim in claims">
                        <td><strong>{{claim.property_labels}}</strong></td>
                        <td ng-bind-html="claim.valueHtml">{{claim.valueHtml}}</td>
                    </tr>
                </table>
            </div>
        </div>
    <?php elseif (!empty($_GET['q'])): ?>
        <script>
            var WIKIDATA_Q ="<?php echo $_GET['q']; ?>";
        </script>

        <div ng-controller="searchResultsCtrl">

            <h3>Search results</h3>

            <div ng-show="loading">Loading...</div>

            <div id="searchresults">
                <ul>
                    <li ng-repeat="result in results">
                        <a href="index.php?id={{result.id}}">
                            {{result.label}} - {{result.description}}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    <?php else: ?>
        <p class="lead"><?php $hay->description(); ?></p>

        <p>Simply use the search form at the top of this page to try it out.</p>

        <h3>Examples</h3>
        <ul>
            <li><a href="?q=690554">Aart Staartjes</a></li>
            <li><a href="?q=Q426489">Mies Bouwman</a></li>
        </ul>
    <?php endif; ?>
</div>

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

        $("#qa").typeahead({
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
    $hay->footer();
?>