<?php
    require '../../lib/class-hay.php';

    $hay = new Hay(basename(dirname(__FILE__)), [
        "bare" => true,
        "scripts" => [ 'bundle.js' ],
        "styles" => [ 'style.css' ]
    ]);

    $hay->header();
?>
    <div id="app"
         v-cloak>
        <h1>
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <section>
            <p class="lead">
                <?php $hay->description(); ?>
            </p>
        </section>

        <viz-statements></viz-statements>
    </div>
<?php
    $hay->footer();
?>