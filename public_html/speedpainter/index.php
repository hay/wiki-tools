<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("templater", [
        "styles" => [ 'style.css' ],
        "scripts" => [ 'bundle.js' ]
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
    </div>
<?php
    $hay->footer();
?>