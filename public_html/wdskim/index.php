<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-wikidataskim.php';

    $hay = new Hay("wdskim");

    if (!empty($_GET['q'])) {
        $q = $_GET['q'];
        $lang = $_GET['language'];
        $withimages = isset($_GET['withimages']);
        $json = isset($_GET['json']) || isset($_GET['format']);
        $extended = isset($_GET['extended']);

        $api = new WikidataSkim();
        $results = $api->query($q, $extended, $lang, $withimages);

        if ($json) {
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

    <?php if (empty($_GET['q'])): ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <h3>"Documentation"</h3>
        <p>Currently, the only supported query is <code>CLAIM</code> with both properties
        given, for example, to get all paintings by <a href="https://www.wikidata.org/wiki/Q130777">Kazimir Malevich</a>, try <code>CLAIM[170:130777]</code></p>

        <div class="alert alert-warning">This tool is currently limited to 500 results.</div>

        <form action="index.php" method="GET" role="form">
            <div class="form-group">
                <label for="q">Claim</label>

                <div class="input-group">
                    <input type="text" class="form-control" id="q" name="q" />
                    <div class="input-group-addon">
                        Language:
                        <select name="language" id="language">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
                            <option value="nl">Dutch</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="checkbox">
                <label for="json">
                    <input type="checkbox" id="json" name="json" />
                    Output as JSON
                </label>
            </div>

            <div class="checkbox">
                <label for="extended">
                    <input type="checkbox" id="extended" name="extended" />
                    Add extended data (claims, aliases, etcetera)
                </label>
            </div>

            <div class="checkbox">
                <label for="withimages">
                    <input type="checkbox" id="withimages" name="withimages" />
                    Only get entities with images
                </label>
            </div>

            <button type="submit" class="btn btn-primary">
                <span class="glyphicon glyphicon-search"></span>
                Query
            </button>
        </form>
    <?php elseif (isset($results['error'])) : ?>
        <h1>
            Wikidata Skim
            <a href="index.php" class="pull-right btn btn-primary">Do another query</a>
        </h1>

        <div class="alert alert-danger">
            Sorry, something went wrong. Either your query was wrong, or there were no results.<br>
            <b>Error code: <?= $results['error']; ?></b>
        </div>
    <?php else: ?>
        <h1>
            Wikidata Skim
            <a href="index.php" class="pull-right btn btn-primary">Do another query</a>
        </h1>

        <h3>There seem to be <b><?php echo count($results); ?></b> results.</h3>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

        <br clear="all">
        <br>

        <?php if (!$extended): ?>
            <?php if ($withimages): ?>
                <?php $index = 0; // Oh, PHP! ?>
                <?php foreach ($results as $result): ?>
                    <?php if ($index % 4 == 0): ?><div class="row"><?php endif; ?>
                        <div class="col-md-3">
                            <a href="http://www.wikidata.org/wiki/<?= $result['id']; ?>" class="thumbnail">
                                <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/<?= $result['image']; ?>?width=300">
                                <h3><?= $result['label']; ?></h3>
                                <h4><?= $result['description']; ?></h4>
                            </a>
                        </div>
                    <?php if ($index % 4 == 3): ?></div><?php endif; ?>
                    <?php $index++; ?>
                <?php endforeach; ?>
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
                <?php foreach ($results as $result): ?>
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
        <?php else: ?>
            <div class="alert alert-danger">
                Sorry, but we can't display results when the 'extended' option is enabled. Try the 'Get this query as JSON' button, or disable the option.
            </div>
        <?php endif; ?>
    <?php endif; ?>
<?php
    $hay->footer();
?>