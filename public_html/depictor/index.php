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
         class="app"
         v-cloak>
        <h1 class="app-title">
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <app></app>
    </div>
<?php
    $hay->footer();
?>