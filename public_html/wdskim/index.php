<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-wikidataskim.php';

    $hay = new Hay("wdskim");
    $page = isset($_GET['page']) ? $_GET['page'] : 0;

    function has_query() {
        return !empty($_GET['prop']) && !empty($_GET['item']);
    }

    if (has_query()) {
        $q = sprintf(
            "CLAIM[%s:%s]",
            substr($_GET['prop'], 1),
            substr($_GET['item'], 1)
        );

        $lang = $_GET['language'];
        $withimages = isset($_GET['withimages']);
        $usewdq = isset($_GET['usewdq']);
        $json = isset($_GET['json']) || isset($_GET['format']);
        $extended = isset($_GET['extended']);

        $api = new WikidataSkim([
            "extended" => $extended,
            "lang" => $lang,
            "withimages" => $withimages,
            "usewdq" => $usewdq,
            "page" => $page
        ]);

        $results = $api->query($q);

        if ($json) {
            // User wants JSON
            header("Content-Type: application/json");
            header("Access-Control-Allow-Origin: *");
            echo json_encode($results);
            die();
        }
    }

    function page_link($delta) {
        global $page;
        $query = $_SERVER['QUERY_STRING'];

        if (strpos($query, "&page") === false) {
            echo "index.php?$query&page=" . ($page + $delta);
        } else {
            echo "index.php?" . str_replace("page=$page", "page=" . ($page + $delta), $query);
        }
    }

    function pager() {
        global $results;
?>
        <div class="row text-center" style="margin-bottom:20px;">
            <div class="btn-group">
            <?php if ($results['hasprev']) : ?>
                <a href="<?php page_link(-1); ?>" class="btn btn-default">&laquo; Previous page</a>
            <?php endif; ?>

            <?php if ($results['hasnext']) : ?>
                <a href="<?php page_link(1); ?>"  class="btn btn-default">Next page &raquo; </a>
            <?php endif; ?>
            </div>
        </div>
<?php
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

        form h3 {
            margin-bottom: 20px;
        }

        .thumbnail {
            width: 25%;
            border: 10px solid white;
            float: left;
        }

        .thumbnail h3 {
            font-size: 20px;
            margin-top: 10px;
        }

        .thumbnail h4 {
            font-size: 14px;
        }

        .thumbnail:hover {
            border-radius: 0;
        }

        @media (max-width: 479px) {
            .thumbnail {
                width: 100%;
            }
        }

        @media (min-width: 480px) and (max-width: 767px) {
            .thumbnail {
                width: 50%;
            }
        }
    </style>

    <link rel="stylesheet" href="../common/awesomplete.css">
    <script src="//tools-static.wmflabs.org/cdnjs/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
    <script src="../common/underscore-min.js"></script>
    <script src="../common/awesomplete.js"></script>
    <script src="../common/masonry.pkgd.min.js"></script>
    <script src="../common/imagesloaded.pkgd.min.js"></script>
    <script src="app.js"></script>

    <?php if (!has_query()) : ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <h3>Examples</h3>

        <div class="row">
            <div class="col-sm-4">
                <ul>
                    <li><a href="?prop=P170&item=Q167654&language=en&withimages=on">All paintings by Frans Hals</a></li>
                    <li><a href="?prop=P1303&item=Q9798&language=en&withimages=on">People playing the saxophone</a></li>
                </ul>
            </div>

            <div class="col-sm-4">
                <ul>
                    <li><a href="?prop=P195&item=Q3044768&language=en&withimages=on">Paintings in the Louvre</a></li>
                    <li><a href="?prop=P1344&item=Q79859&language=en&withimages=on">Footballers who played in the 2014 world cup</a></li>
                </ul>
            </div>

            <div class="col-sm-4">
                <ul>
                    <li><a href="?prop=P161&item=Q81328&language=en">Movies with Harrison Ford</a></li>
                    <li><a href="?prop=P141&item=Q11394&language=en&withimages=on">Endangered animals</a></li>
                </ul>
            </div>

        </div>

        <form action="index.php" method="GET" role="form" class="form-horizontal">
            <h3>Find items where...</h3>

            <div class="form-group">
                <label for="prop" class="col-sm-4">
                    this property:
                </label>
                <div class="col-sm-8">
                    <input type="hidden" id="prop" name="prop">
                    <input type="text" data-name="prop" class="form-control">
                </div>
            </div>

            <div class="form-group">
                <label class="col-sm-4">
                    is equal to this item:
                </label>
                <div class="col-sm-8">
                    <input type="hidden" id="item" name="item">
                    <input type="text" data-name="item" class="form-control">
                </div>
            </div>

            <div class="form-group">
                <label for="language" class="col-sm-4">display in this language:</label>

                <div class="col-sm-8">
                    <select name="language" id="language" class="form-control">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                        <option value="fr">French</option>
                        <option value="nl">Dutch</option>
                    </select>
                </div>
            </div>

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
                    <button type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-search"></span>
                        Query
                    </button>
                </div>
            </div>
        </form>

        <div class="alert alert-info">
            <span class="glyphicon glyphicon-info-sign"></span>
            Note: this tool is limited to 500 results.
        </div>
    <?php elseif (isset($results['error'])) : ?>
        <h1>
            <a href="index.php">Wikidata Skim</a>
            <a href="index.php" class="pull-right btn btn-primary">Do another query</a>
        </h1>

        <div class="alert alert-danger">
            Sorry, something went wrong. Either your query was wrong, or there were no results.<br>
            <b>Error code: <?= $results['error']; ?></b>
        </div>
    <?php else: ?>
        <h1>
            <a href="index.php">Wikidata Skim</a>
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
            <?php pager(); ?>

            <?php if ($withimages): ?>
                <div class="thumbnail-grid">
                <?php foreach ($results['items'] as $result): ?>
                    <a href="http://www.wikidata.org/wiki/<?= $result['id']; ?>" class="thumbnail">
                        <?php
                            $img = htmlspecialchars($result['image']);
                        ?>
                        <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/<?= $img; ?>?width=300">
                        <h3><?= $result['label']; ?></h3>
                        <h4><?= $result['description']; ?></h4>
                    </a>
                <?php endforeach; ?>
                </div>
            <?php else: ?>
            <table class="table table-condensed table-hover table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Label</th>
                        <th>Description</th>
                        <?php if ($withimages): ?><th>Image</th><?php endif; ?>
                    </tr>
                </thead>

                <tbody>
                <?php foreach ($results['items'] as $result): ?>
                <tr>
                    <td>
                        <a href="http://www.wikidata.org/wiki/<?= $result['id']; ?>">
                            <?= $result['id']; ?>
                        </a>
                    </td>
                    <td><?= $result['label']; ?></td>
                    <td><?= $result['description']; ?></td>
                </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>

            <?php pager(); ?>
        <?php else: ?>
            <div class="alert alert-danger">
                Sorry, but we can't display results when the 'extended' option is enabled. Try the 'Get this query as JSON' button, or disable the option.
            </div>
        <?php endif; ?>
    <?php endif; ?>
<?php
    $hay->footer();
?>