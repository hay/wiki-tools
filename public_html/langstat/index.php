<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-langstat.php';

    $hay = new Hay("langstat");

    if (!empty($_GET['url'])) {
        $langstat = new LangStat($_GET['url']);
        $stats = $langstat->getStats();
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

        <form action="index.php" method="GET" role="form">
            <div class="form-group">
                <label for="url">URL</label>
                <input type="text" class="form-control" id="url" name="url" placeholder="http://en.wikipedia.org/wiki/Gömböc">
            </div>

            <button type="submit" class="btn btn-primary">
                <span class="glyphicon glyphicon-search"></span>
                Search
            </button>
        </form>
    <?php else: ?>
        <h1>
            <?php $hay->title(); ?>
            <a href="index.php" class="pull-right btn btn-primary">Do another search</a>
        </h1>

        <div class="pull-right">
            <a class="btn btn-default" href="index.php?<?php echo $_SERVER['QUERY_STRING']; ?>&format=json">
                Get this query as JSON
            </a>
        </div>

  <?php endif; ?>
<?php
    $hay->footer();
?>