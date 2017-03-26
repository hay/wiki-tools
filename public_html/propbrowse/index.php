<?php
    require '../../lib/class-hay.php';

    $vue = DEBUG ? ".js" : ".min.js";

    $hay = new Hay("propbrowse", [
        "scripts" => [
            "node_modules/vue/dist/vue$vue",
            "node_modules/superagent/superagent.js",
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

    [v-cloak]:before {
        content: "Loading, this can take a couple of seconds...";
    }

    [v-cloak] > * {
        display: none;
    }
</style>
<section id="content" v-cloak>
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
                <input class="form-control"
                       type="search"
                       name="search"
                       v-model.trim="q" />
            </div>
        </div>

        <div class="col-md-3">
            <div class="btn-group pull-right" id="listview">
                <button type="button"
                        v-bind:class="[ view === 'detailed' ? 'active' : '']"
                        v-on:click="view = 'detailed'"
                        class="btn btn-default">
                    <span class="glyphicon glyphicon-th-large"></span>
                    Detailed
                </button>
                <button type="button"
                        v-bind:class="[ view === 'compact' ? 'active' : '']"
                        v-on:click="view = 'compact'"
                        class="btn btn-default">
                    <span class="glyphicon glyphicon-th"></span>
                    Compact
                </button>
            </div>
        </div>
    </div>

    <br>

    <div class="text-center" v-show="q.length > 2">
        <span>Found {{shownProperties}} results</span>
        <a class="btn btn-text" v-on:click="q = ''">Reset filter</a>
    </div>

    <p>Click on the column headers to sort by that column.</p>

    <table class="table" v-bind:data-view="view">
        <thead>
            <tr>
                <th v-on:click="sortBy('id')">ID</th>
                <th v-on:click="sortBy('label')">Label</th>
                <th v-on:click="sortBy('description')">Description</th>
                <th v-on:click="sortBy('types')">Use</th>
                <th v-on:click="sortBy('datatype')">Type</th>
                <th v-on:click="sortBy('aliases')">Aliases</th>
                <th>Example</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="prop in properties"
                v-show="prop.visible">
                <td>
                    <a v-bind:href="prop.url">{{prop.id}}</a>
                </td>
                <td>{{prop.label}}</td>
                <td>{{prop.description}}</td>
                <td>{{prop.types}}</td>
                <td>{{prop.datatype}}</td>
                <td>{{prop.aliases}}</td>
                <td>
                    <ul v-if="prop.example">
                        <li v-for="ex in prop.example">
                            <a v-bind:href="'https://www.wikidata.org/wiki/Q' + ex">Q{{ex}}</a>
                        </li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>
</section>
<?php
    $hay->footer();
?>