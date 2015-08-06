<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-templaterenderer.php';
    require '../../lib/class-directoryapi.php';

    $hay = new Hay("wdd");
    $hay->header();

    $templaterenderer = new TemplateRenderer();

    $api = new DirectoryApi("CsvToolProvider");
    $tools = [];

    foreach ($api->getAllTools() as $tool) {
        // Make sure we only list tools that have the required fields
        if ($api->hasRequiredProperties($tool)) {
            $tools[] = $tool->as_array();
        }
    }

    // For easy filtering
    $jsontools = [];

    foreach ($tools as $tool) {
        $name = $tool['name'];
        $jsontools[$name] = [
            "author" => $tool['author'],
            "keywords" => $tool['keywords'],
            "fulltext" => $tool['fulltext']
        ];
    }

    // Randomize the tool order
    shuffle($tools);
?>

<script>
    window._toolindex = <?php echo json_encode($jsontools); ?>;
</script>

    <?php
        echo $templaterenderer->render("directory-header", [
            "title" => $hay->getTitle(),
            "description" => $hay->getDescription(),
            "tools" => $tools,
        ]);
    ?>

    <h2 id="addtool">Add your tool to the WDD</h2>

    <p>Some wonderful instructions to add your tool will be available here soon.</p>

    <p>If you have any bugs or questions please submit them to the <a href="https://github.com/hay/wiki-tools">Github repo</a>.</p>
</div>

<?php
    echo $templaterenderer->render("directory-footer");
    $hay->footer();
?>