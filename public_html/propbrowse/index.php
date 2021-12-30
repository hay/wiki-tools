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
    </div>

    <p class="lead"><?php $hay->description(); ?></p>

    <div id="app" v-cloak>
        <p v-show="loading">Loading...</p>

        <div class="progress"
             v-show="loading">
            <div
                class="progress-bar progress-bar-striped active"
                v-bind:style="{ width : loadingProgress + '%', 'min-width' : '3em' }">
                {{loadingProgress}}%
            </div>
        </div>

        <div v-show="!loading">
            <div class="row">
                <div class="col-md-6 col-md-offset-3">
                    <div class="input-group">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-filter"></span>
                        </span>
                        <input class="form-control"
                               type="search"
                               v-bind:placeholder="'Type at least ' + MINIMUM_QUERY_LENGTH + ' characters to start filtering'"
                               v-model.trim="q" />
                    </div>
                </div>

                <div class="col-md-3"
                     v-show="hasLength">
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

            <br />

            <div class="alert alert-info buffer-top-3"
                 v-if="!hasLength && allproperties">
                Filter through {{allproperties.length}} properties by typing
                something in the box above. Or <span class="text-link" v-on:click="showAll = true">show all properties</span> (can be slow).
            </div>

            <br />

            <div class="text-center"
                 v-show="properties && hasLength">
                <span class="spacing-btn">Found {{properties.length}} results</span>

                <button class="btn btn-text" v-on:click="resetFilter">Reset filter</button>

                <button
                    class="btn btn-link"
                    v-on:click="toggleDatatypes">
                    Filter by datatype
                </button>

                <div v-show="showDatatypes">
                    <button
                        class="btn btn-link"
                        v-on:click="setDatatypes(true)">
                        Select all
                    </button>

                    <button
                        class="btn btn-link"
                        v-on:click="setDatatypes(false)">
                        Deselect all
                    </button>

                    <ul class="list-datatypes">
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
            </div>

            <p v-show="hasLength">Click on the column headers to sort by that column.</p>

            <ul class="list" v-if="view === 'compact'">
                <li v-for="prop in properties">
                    <a v-bind:href="prop.url"
                       target="_blank"
                       v-bind:title="prop.description">
                        <strong>{{prop.id}}</strong> <span>{{prop.label}}</span>
                    </a>
                </li>
            </ul>

            <div v-if="view === 'detailed'">
                <div
                    class="alert alert-warning"
                    v-show="properties.length > MAX_DETAILED_LIST_LENGTH">
                    Showing {{MAX_DETAILED_LIST_LENGTH}} items of {{properties.length}}.
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th v-on:click="setSort('id')">ID</th>
                            <th v-on:click="setSort('label')">Label</th>
                            <th v-on:click="setSort('description')">Description</th>
                            <th v-on:click="setSort('types')">Use</th>
                            <th v-on:click="setSort('datatype')">Type</th>
                            <th v-on:click="setSort('aliases')">Aliases</th>
                            <th>Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="prop in properties.slice(0, MAX_DETAILED_LIST_LENGTH)">
                            <td>
                                <a v-bind:href="prop.url"
                                   target="_blank">{{prop.id}}</a>
                            </td>
                            <td>{{prop.label}}</td>
                            <td>{{prop.description}}</td>
                            <td>{{prop.types}}</td>
                            <td>{{prop.datatype}}</td>
                            <td>
                                <ul v-if="prop.aliasesList"
                                    class="proplist">
                                    <li v-for="item in prop.aliasesList">{{item}}</li>
                                </ul>
                            </td>
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
    </div>

    <a href="props.json" download class="center-block btn btn-link">Download all properties as JSON</a>
</section>
<?php
    $hay->footer();
?>