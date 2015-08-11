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

<?php echo $templaterenderer->render("directory-style"); ?>

<div>
    <div id="header" class="row">
        <div class="col-md-6">
            <h1><?php $hay->title(); ?></h1>
        </div>

        <div class="col-md-6">
            <a href="https://docs.google.com/forms/d/1oObDiBb-4HUy6aOwwP8E0naT6vl_A8WuxqIeMTEHxuc/viewform" class="btn btn-primary pull-right">Add a resource</a>
        </div>
    </div>

    <p class="lead">
        <?php echo $hay->description(); ?>

        <span id="toolcount">
            Search through <strong><?php echo count($tools); ?></strong> tools here.
        </span>
    </p>

    <?php
        echo $templaterenderer->render("directory-header", [
            "title" => $hay->getTitle(),
            "description" => $hay->getDescription(),
            "tools" => $tools,
        ]);
    ?>

    <p><em>Note that every submission is being reviewed by hand and could take a little while to appear here.</em></p>

    <p>If you have any bugs or questions please submit them to the <a href="https://github.com/hay/wiki-tools">Github repo</a>.</p>
</div>

<?php
    echo $templaterenderer->render("directory-footer");
    $hay->footer();
?>