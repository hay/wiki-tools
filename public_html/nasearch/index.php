<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gahetna.php';

    $hay = new Hay("nasearch");
    $hay->header();
?>
        <h1><?php $hay->title(); ?></h1>

        <p class="lead"><?php $hay->description(); ?></p>

        <?php
            if (empty($_POST['terms'])) {
        ?>

        <p>Enter all your search terms in the textarea below, seperated by newlines.</p>

        <form method="post" action="index.php" class="form-inline">
            <textarea name="terms" id="terms" cols="30" rows="10" class="form-control" style="width:100%;"></textarea><br /><br />
            <button type="submit" class="btn btn-large btn-primary">Search</button>
        </form>

        <?php
            } else {
                $terms = $_POST['terms'];
                $api = new Gahetna();
                $results = $api->searchForImages($terms);

        ?>
                <h3>Search results</h3>

                <ul class="media-list">
        <?php
                # TODO: Should be some fancy template i guess...
                foreach ($results as $result):
                    $t = $result['term'];
                    $r = $result['result'];
        ?>

                <li class="media">
                    <?php if (is_array($r)): ?>
                        <a href="<?php echo $r['link']; ?>">
                            <div class="media-body">
                                <h4 class="media-heading">
                                    <?php echo $t; ?>
                                </h4>

                                <p><?php echo $r['description']; ?></p>
                            </div>
                        </a>
                    <?php else: ?>
                        <h4 class="media-heading">
                            <?php echo $t; ?>
                        </h4>
                        <p>No results found...</p>
                    <?php endif; ?>
                </li>
        <?php
                endforeach;
        ?>

            <hr />

            <a class="btn btn-large btn-primary" href="index.php">Try again</a>
        <?php
            }
        ?>
<?php
    Hay::footer();
?>