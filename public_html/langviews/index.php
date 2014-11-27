<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-langviews.php';

    $hay = new Hay("langviews");

    if (!empty($_GET['url'])) {
        $url = $_GET['url'];
        $api = new LangViews($url);
        $results = $api->getResults();

        if (!empty($_GET['format'])) {
            // User wants JSON
            header("Content-Type: application/json");
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
    </style>

    <?php if (empty($_GET['url'])): ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <div class="alert alert-info">
            The pageviews API is pretty slow, so this could take a few minutes if you have an article with many languages.
        </div>

        <form action="index.php" method="GET" role="form">
            <div class="form-group">
                <label for="site">Url to article</label>
                <input type="text" class="form-control" id="url" name="url" placeholder="Enter a URL to a Wikipedia article here" />
            </div>

            <button type="submit" class="btn btn-primary">
                <span class="glyphicon glyphicon-search"></span>
                Search
            </button>
        </form>
    <?php else: ?>
        <h1>
            Multilingual page views
            <a href="index.php" class="pull-right btn btn-primary">Do another search</a>
        </h1>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

        <?php if (!$results): ?>
        <div class="alert alert-danger">
            There was something wrong with your query, or the calls to the api. Sorry, can't be more specific.
        </div>
        <?php endif; ?>

        <table class="table table-condensed table-hover table-striped">
            <thead>
                <tr>
                    <th>Language code</th>
                    <th>Language name</th>
                    <th>Article name</th>
                    <th>Views in the last 30 days</th>
                </tr>
            </thead>

        <?php foreach ($results['views'] as $result) : ?>
                <tr>
                    <td>
                        <?= $result['langcode']; ?>
                    </td>

                    <td>
                        <?= $result['language']; ?>
                    </td>

                    <td>
                        <a href="http://<?= $result['langcode']; ?>.wikipedia.org/wiki/<?= $result['article']; ?>">
                            <?= $result['article']; ?>
                        </a>
                    </td>

                    <td>
                        <?= $result['totalviews']; ?>
                    </td>
                </tr>
            <?php endforeach; ?>

            <tr>
                <td><strong>Total</strong></td>
                <td colspan="2"></td>
                <td><?= $results['totalviews']; ?></td>
            </tr>
        </table>
    <?php endif; ?>
<?php
    $hay->footer();
?>