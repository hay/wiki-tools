<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-templaterenderer.php';

    $hay = new Hay("propbrowse");
    $hay->header();
    $templaterenderer = new TemplateRenderer();
    $props = file_get_contents("../../etc/wikidata-props/wikidata-props.json");
    $props = json_decode($props, true);
?>
<style>
    #wrapper {
        max-width: inherit;
    }

    th {
        text-decoration: underline;
    }

    th:hover {
        cursor: pointer;
        color: navy;
    }
</style>
    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <table class="table">
        <thead>
            <tr>
                <th data-sort="wikidataid">ID</th>
                <th data-sort="string">Label</th>
                <th data-sort="string">Description</th>
                <th data-sort="string">Use</th>
                <th data-sort="string">Type</th>
                <th data-sort="string">Aliases</th>
                <th data-sort="string">Example</th>
            </tr>
        </thead>
        <tbody>
        <?php
            echo $templaterenderer->render("propbrowse-list", [
                "props" => $props
            ]);
        ?>
        </tbody>
    </table>

<?php
    $hay->footer();
?>