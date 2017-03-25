<?php
    require '../../lib/class-hay.php';

    $vue = DEBUG ? ".js" : ".min.js";

    $hay = new Hay("propbrowse", [
        "scripts" => [
            "node_modules/vue/dist/vue$vue",
            "app.js"
        ]
    ]);

    $hay->header();
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

    .flexrow {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
    }

    .filters {
        max-width: 500px;
        margin: 0 auto 20px auto;
    }

    .table[data-view="compact"] th,
    .table[data-view="compact"] thead,
    .table[data-view="compact"] td {
        display: none;
    }

    .table[data-view="compact"] [data-key] {
        display: table-cell;
    }

    .table[data-view="compact"] tr {
        float: left;
        width: 25%;
    }

    .table[data-view="compact"] td {
        padding: 0;
        border: 0;
    }

    .table[data-view="compact"] td[data-key="id"] {
        width: 50px;
    }
</style>
<div>
    <div class="flexrow">
        <h1><?php $hay->title(); ?></h1>

        <a href="props.json" download class="btn btn-primary">Download as JSON</a>
    </div>

    <p class="lead"><?php $hay->description(); ?></p>

    <div class="row">
        <div class="col-md-6 col-md-offset-3">
            <div class="input-group">
                <span class="input-group-addon">
                    <span class="glyphicon glyphicon-filter"></span>
                </span>
                <input class="form-control" type="search" name="search" id="q" placeholder="Loading..."/>
            </div>
        </div>

        <div class="col-md-3">
            <div class="btn-group pull-right" id="listview">
                <button type="button" class="btn btn-default active" data-view="detailed">
                    <span class="glyphicon glyphicon-th-large"></span>
                    Detailed
                </button>
                <button type="button" class="btn btn-default" data-view="compact">
                    <span class="glyphicon glyphicon-th"></span>
                    Compact
                </button>
            </div>
        </div>
    </div>

    <br>

    <div class="text-center hidden" id="resultcount">
        <span></span>
        <a class="btn btn-text">Reset filter</a>
    </div>

    <p>Click on the column headers to sort by that column.</p>

    <table class="table" data-view="detailed">
        <thead>
            <tr>
                <th data-sort="wikidataid" data-key="id">ID</th>
                <th data-sort="string" data-key="label">Label</th>
                <th data-sort="string">Description</th>
                <th data-sort="string">Use</th>
                <th data-sort="string">Type</th>
                <th data-sort="string">Aliases</th>
                <th data-sort="string">Example</th>
            </tr>
        </thead>
        <tbody>
        <?php
            // require 'props.html';
        ?>
        </tbody>
    </table>
</div>
<?php
    $hay->footer();
?>