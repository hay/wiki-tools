<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-templaterenderer.php';
    require '../../lib/class-vizquery.php';

    $vizquery = new VizQuery();
    $query = json_decode(file_get_contents("example-query.json"), true);
    print_r($vizquery->query($query));

    $hay = new Hay("vizquery");

    function has_query() {
        return !empty($_GET['q']);
    }

    if (has_query()) {
        $results = $api->query($q);

        if ($json) {
            // User wants JSON
            header("Content-Type: application/json");
            header("Access-Control-Allow-Origin: *");
            echo json_encode($results);
            die();
        }
    }

    $hay->header();
?>
    <style>
        #wrapper {
            max-width: inherit;
        }

        .awesomplete {
            width: 100%;
        }
    </style>

    <link rel="stylesheet" href="../common/awesomplete.css">
    <script src="../common/jquery.js"></script>
    <script src="../common/underscore-min.js"></script>
    <script src="../common/awesomplete.js"></script>
    <script src="app.js"></script>

    <?php if (!has_query()) : ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <form role="form" class="form-horizontal">
            <h3>
                Find items where property:
                <input type="hidden" id="prop" name="prop">
                <input type="text" data-name="prop" class="form-control">
                is equal to item:
                <input type="hidden" id="item" name="item">
                <input type="text" data-name="item" class="form-control">
            </h3>

            <div class="form-group">
                <div class="col-sm-8 col-sm-offset-4">
                    <label>
                        <input type="checkbox" id="withimages" name="withimages" checked>
                        Only get items with an image
                    </label>
                </div>
            </div>

            <div class="form-group">
                <div class="col-sm-8 col-sm-offset-4">
                    <button id="show-advanced" class="btn btn-link">Show advanced options</button>
                </div>
            </div>

            <div id="advanced" class="hidden">
                <div class="form-group">
                    <div class="col-sm-8 col-sm-offset-4">
                        <label>
                            <input type="checkbox" id="json" name="json">
                            Output as JSON
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <div class="col-sm-8 col-sm-offset-4">
                        <label>
                            <input type="checkbox" id="extended" name="extended">
                            Add extended data (claims, aliases, etcetera)
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <div class="col-sm-8 col-sm-offset-4">
                        <label>
                            <input type="checkbox" id="usewdq" name="usewdq">
                            Use Wikidata Query (for comparing)
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <div class="col-sm-8 col-sm-offset-4">
                    <button id="query" type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-search"></span>
                        Query
                    </button>
                </div>
            </div>
        </form>
    <?php elseif (isset($results['error'])) : ?>
        <h1>
            <a href="index.php">VizQuery</a>
            <a href="index.php" class="pull-right btn btn-primary">Do another query</a>
        </h1>

        <div class="alert alert-danger">
            Sorry, something went wrong. Either your query was wrong, or there were no results.<br>
            <b>Error code: <?= $results['error']; ?></b>
        </div>
    <?php else: ?>
        <h1>
            <a href="index.php">VizQuery</a>
            <a href="index.php" class="pull-right btn btn-primary">Do another query</a>
        </h1>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

        <br clear="all">
        <br>

        <?php if (!$extended): ?>

        <?php endif; ?>
    <?php endif; ?>
<?php
    $hay->footer();
?>