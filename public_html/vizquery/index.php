<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("vizquery", [
        "styles" => [ 'style.css' ],
        "scripts" => [
            'dist.js'
        ]
    ]);

    $hay->header();
?>
    <div id="app" v-cloak>
        <h1>Wikidata <?php $hay->title(); ?></h1>

        <p class="lead" v-show="!hadResults">
            <?php $hay->description(); ?>
        </p>

        <div class="alert alert-danger" v-show="error">
            Sorry, something went wrong. Either your query was wrong, or there were no results.
            <p v-if="error">{{error}}</p>
        </div>

        <div class="form">
            <h3>Find things that...</h3>

            <section v-for="rule in rules">
                <select v-model="rule.has">
                    <option v-for="option in hasOptions" v-bind:value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <p>a property</p>

                <entity-entry
                    type="property"
                    v-bind:minlength="2"
                    v-model="rule.property"></entity-entry>

                <p>that contains</p>

                <entity-entry
                    type="item"
                    v-bind:minlength="2"
                    v-model="rule.value"></entity-entry>

                <button class="btn btn-default" v-on:click="removeRule(rule)">
                    <span class="glyphicon glyphicon-minus"></span>
                    Remove rule
                </button>
            </section>

            <section>
                <button class="btn btn-default" v-on:click="addRule">
                    <span class="glyphicon glyphicon-plus"></span>
                    Add rule
                </button>
            </section>

            <section>
                <input type="checkbox" id="withimages" v-model="withimages">
                <label for="withimages">Only get items with an image</label>
            </section>

            <section>
                <label for="limit">Maximum results (0 is no limit)</label>
                <input type="number" id="limit" v-model="limit">
            </section>

            <section>
                <button class="btn btn-primary" v-on:click="setQuery">
                    <span class="glyphicon glyphicon-search"></span>
                    Query
                </button>
            </section>
        </div>

        <div class="alert alert-info" v-show="loading">
            Loading...
        </div>

        <div class="alert alert-info" v-show="results.length == 0 && !loading && hadResults">
            No results
        </div>

        <div class="results" v-show="results.length">
            <h3 v-show="results">
                Results <small>{{results.length}}</small>

                <div class="btn-group pull-right" role="group">
                    <button type="button"
                            class="btn btn-default"
                            v-bind:class="{ active : display === 'table' }"
                            v-on:click="setDisplay('table')">
                        <span class="glyphicon glyphicon-list"></span>
                        Table
                    </button>

                    <button type="button"
                            class="btn btn-default"
                            v-bind:class="{ active : display === 'grid' }"
                            v-on:click="setDisplay('grid')">
                        <span class="glyphicon glyphicon-th"></span>
                        Grid
                    </button>
                </div>
            </h3>

            <p>
                <a v-bind:href="csv" download="data.csv">Download as CSV</a>
            </p>

            <display-table v-if="display === 'table'" v-bind:data="results"></display-table>

            <display-grid v-if="display === 'grid'" v-bind:data="results"></display-grid>
        </div>

        <div v-show="hadResults">
            <h3>
                <a v-bind:href="'https://query.wikidata.org/#' + encodeURIComponent(query)"
                   target="_blank">
                    SPARQL Query
                </a>
            </h3>

            <details>
                <summary>Show query</summary>
                <pre>{{query}}</pre>
            </details>
        </div>

        <h3>Example queries</h3>

        <ul>
            <li v-for="e in examples">
                <a v-bind:href="'#' + e.hash">{{e.description}}</a>
            </li>
        </ul>
    </div>
<?php
    $hay->footer();
?>