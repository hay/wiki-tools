<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-externallinksearch.php';

    $hay = new Hay("exturl");

    if (!empty($_GET['q'])) {
        $q = $_GET['q'];
        $sites = $_GET['site'];
        $only_main_namespace = isset($_GET["namespace"]) && $_GET['namespace'] == "on";
        $api = new ExternalLinkSearch($sites, $only_main_namespace);
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
                <label for="site">Project</label>

                <span class="help-block">For multiple projects, separate by comma.</span>

                <div class="input-group">
                    <span class="input-group-addon">http://</span>
                    <input type="text" class="form-control" id="site" name="site" placeholder="nl.wikipedia" />
                    <span class="input-group-addon">.org</span>
                </div>
            </div>

            <div class="form-group">
                <label for="q">Search pattern</label>
                <input type="text" class="form-control" id="q" name="q" placeholder="delpher.nl" />
            </div>

            <div class="checkbox">
                <label for="namespace">
                    <input type="checkbox" id="namespace" name="namespace" />
                    Limit to article namespace (only search articles)
                </label>
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

        <h2>For <?php echo $results['sitecount']; ?> site(s) i found <?php echo $results['pagecount']; ?> pages with <?php echo $results['linkcount']; ?> links</h2>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

        <?php foreach ($results['sites'] as $site => $result) : ?>
            <h2><a href="#<?php echo $site; ?>"><?php echo $site; ?></a></h2>
            <h3>For this site i've got <?php echo $result['pagecount']; ?> pages with <?php echo $result['linkcount']; ?> links</h3>

            <table class="table table-condensed table-hover table-striped">
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Link</th>
                        <th>Count</th>
                    </tr>
                </thead>

                <?php foreach ($result['links'] as $row) : ?>
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
        <?php endforeach; ?>
    <?php endif; ?>
<?php
    $hay->footer();
?>