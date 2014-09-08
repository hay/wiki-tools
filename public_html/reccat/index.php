<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-category.php';

    if (!empty($_GET['cat'])) {
        $cat = $_GET['cat'];
        $site = $_GET['site'];
        $api = new Category($site);
        $pages = $api->getRecentPages($cat);
    }

    $hay = new Hay("reccat");

    $hay->header();
?>
    <?php if (empty($_GET['cat'])): ?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <form action="index.php" method="GET" role="form">
            <div class="form-group">
                <label for="site">Project</label>

                <div class="input-group">
                    <span class="input-group-addon">http://</span>
                    <input type="text" class="form-control" id="site" name="site" placeholder="commons.wikimedia" />
                    <span class="input-group-addon">.org</span>
                </div>
            </div>

            <div class="form-group">
                <label for="cat">Category name</label>
                <input type="text" class="form-control" id="cat" name="cat" placeholder="GWToolset_Batch_Upload" />
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

        <p class="lead">Note that the dates are only a vague indication of the last 'touched' date. The API gives back wrong stuff apparently.</p>

        <hr />

        <ul>
            <?php foreach ($pages as $page): ?>
                <li>
                    <a href="<?php echo $page->url; ?>">
                        <?php echo $page->title; ?>
                    </a> (<?php echo $page->date; ?>)
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
<?php
    $hay->footer();
?>