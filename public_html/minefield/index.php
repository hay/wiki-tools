<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("minefield", [
        "default_scripts" => false,
        "use_vite" => true,
        "vite_entry" => "js/main.js",
        "vite_manifest" => "dist/manifest.json"
    ]);

    $hay->header();
?>

    <main id="app"></main>

<?php
    $hay->footer();
?>