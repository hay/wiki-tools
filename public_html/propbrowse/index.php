<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("propbrowse", [
        "scripts" => [
            "bundle.js"
        ],
        "styles" => [
            "css/style.css"
        ]
    ]);

    $hay->header();
?>
<section id="content">
    <div class="flexrow">
        <h1><?php $hay->title(); ?></h1>

        <a href="props.json" download class="btn btn-primary">Download as JSON</a>
    </div>

    <p class="lead"><?php $hay->description(); ?></p>

    <div id="app" v-cloak>
        <p v-show="!properties">Loading...</p>

        <div class="progress"
             v-show="!properties">
            <div
                class="progress-bar progress-bar-striped active"
                v-bind:style="{ width : loadingProgress + '%', 'min-width' : '3em' }">
                {{loadingProgress}}%
            </div>
        </div>

        <div v-show="properties">
            <div class="row">
                <div class="col-md-6 col-md-offset-3">
                    <div class="input-group">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-filter"></span>
                        </span>
                        <input class="form-control"
                               type="search"
                               placeholder="Filter all properties"
                               v-model.trim="q" />
                    </div>

                    <button
                        class="btn btn-link"
                        v-on:click="toggleDatatypes">
                        Filter datatypes
                    </button>

                    <ul v-show="showDatatypes">
                        <li
                            v-for="(bool, datatype) in datatypes"
                            class="checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    v-model="datatypes[datatype]" />
                                    {{datatype}}
                            </label>
                        </li>
                    </ul>
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

            <ul class="list" v-if="view === 'compact'">
                <li v-for="prop in properties">
                    <a v-bind:href="prop.url"
                       target="_blank"
                       v-bind:title="prop.description">
                        <strong>{{prop.id}}</strong> <span>{{prop.label}}</span>
                    </a>
                </li>
            </ul>

            <table class="table" v-if="view === 'detailed'">
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
                            <a v-bind:href="prop.url"
                               target="_blank">{{prop.id}}</a>
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
        </div>
    </div>
</section>
<?php
    $hay->footer();
?>