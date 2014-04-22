<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-externallinksearch.php';

    $hay = new Hay("exturl");

    if (!empty($_GET['q'])) {
        $q = $_GET['q'];
        $site = $_GET['site'];
        $api = new ExternalLinkSearch($site);
        $results = $api->query($q);

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

    <?php if (empty($_GET['q'])): ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <form action="index.php" method="GET" role="form">
            <div class="form-group">
                <label for="site">Website</label>
                <input type="text" class="form-control" id="site" name="site" placeholder="nl.wikipedia.org" />
            </div>

            <div class="form-group">
                <label for="q">Search pattern</label>
                <input type="text" class="form-control" id="q" name="q" placeholder="kranten.kb.nl" />
            </div>

            <button type="submit" class="btn btn-primary">
                <span class="glyphicon glyphicon-search"></span>
                Search
            </button>
        </form>
    <?php else: ?>
        <h1>
            External URL stats
            <a href="index.php" class="pull-right btn btn-primary">Do another search</a>
        </h1>

        <h2>I've got <?php echo count($results['links']); ?> pages with <?php echo $results['count']; ?> links</h2>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

        <table class="table table-condensed table-hover table-striped">
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Link</th>
                    <th>Count</th>
                </tr>
            </thead>

            <?php foreach ($results['links'] as $row) : ?>
                <tr>
                    <td>
                        <a href="<?php echo $row['pagelink']; ?>">
                            <?php echo $row['page']; ?>
                        </a>
                    </td>

                    <td class="cell-maximize-length" style="width:500px;">
                        <?php foreach ($row["links"] as $link): ?>
                            <a href="<?php echo $link; ?>" title="<?php echo $link; ?>">
                                <?php echo str_replace("http://", "", $link); ?>
                            </a><br />
                        <?php endforeach; ?>
                    </td>

                    <td>
                        <?php echo $row['count']; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    <?php endif; ?>
<?php
    $hay->footer();
?>