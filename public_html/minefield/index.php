<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("minefield", [
        "default_scripts" => false,
        "use_vite" => true,
        "vite_entry" => "js/app.js",
        "vite_manifest" => "dist/manifest.json"
    ]);

    $hay->header();
?>
    <main id="app">
        <screen-app></screen-app>
    </main>
<?php
    $hay->footer();
?>