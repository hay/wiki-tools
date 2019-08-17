<?php
    require '../../lib/class-hay.php';
    require '../../lib/class-directoryapi.php';

    $hay = new Hay("directory", [
        'styles' => ['../common/directory.css']
    ]);
    $hay->header();

    $templaterenderer = new TemplateRenderer();

    $api = new DirectoryApi("DatabaseToolProvider");
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

<div>
    <div id="header" class="row">
        <div class="col-md-6">
            <h1><?php $hay->title(); ?></h1>
        </div>

        <div class="col-md-6">
            <a href="#addtool" class="btn btn-primary pull-right-responsive">Add your tool</a>
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

    <h2 id="addtool">Add your tool to the directory</h2>

    <p class="lead">Note that your tool <strong>does not</strong> have to be hosted on Wikimedia Cloud Services/Toolforge. If you have a tool living on your own server, a Javascript gadget on a wiki, or a non-web tool such as a bot feel free to add it using the methods mentioned below.</p>

    <h3>Step 1</h3>

    <p>Add a <code>toolinfo.json</code> file to your tool. Your JSON file should look something like this. <strong>Hover over the properties to see a description.</strong></p>

    <pre><code>{
    <span title="A unique name for your tool" data-toggle="tooltip" data-placement="right">"name"</span> : "hay-tools-directory",
    <span title="A descriptive title" data-toggle="tooltip" data-placement="right">"title"</span> : "Tools Directory",
    <span title="A short summary of what your tool does" data-toggle="tooltip" data-placement="right">"description"</span> : "Discover Wikimedia-related tools.",
    <span title="URL to your tool. Should be unique. If it's not a web tool, link to the documentation." data-toggle="tooltip" data-placement="right">"url"</span> : "http://tools.wmflabs.org/hay/directory",
    <span title="Separate keywords by comma" data-toggle="tooltip" data-placement="right">"keywords"</span> : "tools, search, discoverability",
    <span title="For multiple authors, separate by comma" data-toggle="tooltip" data-placement="right">"author"</span> : "Hay Kranen",
    <span title="Link to the code repository" data-toggle="tooltip" data-placement="right">"repository"</span> : "https://github.com/hay/wiki-tools.git"
}</code></pre>

    <p>The <code>name</code>, <code>title</code>, <code>description</code> and <code>url</code> properties are <strong>required</strong>. Both <code>name</code> and <code>url</code> <strong>need</strong> to be unique.</p>

    <p>If you have multiple tools you can also declare multiple tools in one <code>toolinfo.json</code>, simply use an array with objects.</p>

    <pre><code>
[
    {
        "name" : "hay-directory",
        ....
    },
    {
        "name" : "hay-exturl",
        ....
    }
]
    </code></pre>

    <h3>Step 2</h3>

    <p>Make sure your toolinfo.json file is reachable over regular HTTP, for example:</p>

    <p><code><a href="http://tools.wmflabs.org/hay/directory/toolinfo.json">http://tools.wmflabs.org/hay/directory/toolinfo.json</a></code></p>

    <h3>Step 3</h3>

    <p>Add the link to your toolinfo.json file to the <a href="https://wikitech.wikimedia.org/wiki/User:Hay/directory">Wiki directory page</a>.
    Simply put in on a newline. You can also add comments with a hash (<code>#</code>) to group your <code>toolinfo.json</code> files.</p>

    <h4>Step 4</h4>

    <p>Wait :). The crawler parses all toolinfo.json files every 60 minutes and saves them to a local database. If after a few hours your tool doesn't appear on this page maybe there was an error somewhere. Check the <a href="crawler.log">crawler logs</a> (latest crawls are at the bottom).</p>

    <h4>Step 5</h4>

    <p>There is no step 5. Enjoy! If you have any bugs or questions please submit them to the <a href="https://github.com/hay/wiki-tools">Github repo</a>.</p>

    <h2>Notes</h2>

    <ul>
        <li>You can get a JSON file with all the data on this page <a href="api.php">right here</a>.</li>
        <li>If you want to search for more than one tag just separate them by space.</li>

    </ul>

    <?php if (file_exists("last-update.txt")): ?>
        <p class="text-right">
            Last update: <?php echo file_get_contents("last-update.txt"); ?>
        </p>
    <?php endif; ?>
</div>

<?php
    echo $templaterenderer->render("directory-footer");
    $hay->footer();
?>
