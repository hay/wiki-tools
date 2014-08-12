<?php
    require '../../lib/class-hay.php';
    $hay = new Hay("directory");
    $hay->header();
?>
    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <p>Hoi</p>
<?php
    $hay->footer();
?>