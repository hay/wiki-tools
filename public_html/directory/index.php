<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require 'lib/class-db.php';

    $hay = new Hay("directory");
    $hay->header();
?>
    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <style>
        #wrapper {
            max-width: inherit;
        }
    </style>

    <?php
        $tools = Model::factory('Tool')->find_many();

        foreach ($tools as $tool) {
            echo $tool->name;
        }
    ?>
<?php
    $hay->footer();
?>