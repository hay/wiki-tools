<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("vizquery", [
        "styles" => [ 'style.css' ],
        "scripts" => [
            'bundle.js'
        ]
    ]);

    $hay->header();
?>
    <div id="app" v-cloak>
        <h1>
            <a href="<?= $hay->getUrl(); ?>">
                <?php $hay->title(); ?>
                <span v-if="usesCommons">
                    Commons <sup>(experimental)</sup>
                </span>
            </a>
        </h1>

        <section v-show="!hadResults">
            <p v-if="!usesCommons"
               class="lead">
                <?php $hay->description(); ?>
            </p>

            <p v-if="usesCommons"
               class="lead">
                Query Wikimedia Commons visually
            </p>

            <div class="intro"
                 v-if="!usesCommons">
                <p>
                    This tool allows you to query <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="_blank">Wikidata</a>, the database of all things in the world.
                    <a
                        class="text-link"
                        v-show="!show.extendedIntro"
                        v-on:click="show.extendedIntro = true">
                        Read more...
                    </a>
                </p>

                <div v-show="show.extendedIntro">
                    <p>For example, you could get a list of world heritage sites in your country. A list with movies with Joe Pesci and Robert De Niro. Or female trumpet players. You construct a query by combining <em>properties</em> and <em>items</em> into <em>rules</em>. Let's start with a simple example: <query-link v-bind:query="examples[0].query">click here to find all cats on Wikidata</query-link>.</p>

                    <p class="text-muted">Note for advanced users: you can use the input box to enter variables and strings as well. Just prefix your variables with a question mark, or put quotes around your strings and press enter.</p>
                </div>
            </div>
        </section>

        <div class="alert alert-danger" v-show="error">
            <p>Sorry, something went wrong. Either your query was wrong, or there were no results.</p>
            <p v-if="error">
                <strong>Error message:</strong> {{error}}
            </p>
            <a href="#">Reset query</a>
        </div>

        <div class="form">
            <h3>Select items where...</h3>

            <section v-for="triple in query.triples"
                     v-bind:key="query.hashTriple(triple)">
                <subject-entry
                    v-model="triple.subject"
                    v-bind:subjects="query.subjects"></subject-entry>

                <p>has a property</p>

                <entity-entry
                    type="property"
                    v-bind:minlength="2"
                    v-model="triple.predicate"></entity-entry>

                <p>that is</p>

                <entity-entry
                    type="item"
                    v-bind:minlength="2"
                    v-model="triple.object"></entity-entry>

                <button class="btn btn-default"
                        v-on:click="query.removeTriple(triple)">
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
                <label for="limit">Maximum results (0 is no limit)</label>
                <input type="number" id="limit" v-model="query.limit">
            </section>

            <section>
                <button class="btn btn-primary"
                        v-on:click="doQuery"
                        v-bind:disabled="!query.validTriples">
                    <span class="glyphicon glyphicon-search"></span>
                    Query
                </button>
            </section>
        </div>

        <div class="alert alert-info" v-show="loading">
            Loading (this can take a couple of seconds)
            <img src="img/loader.gif" alt="Loading..." />
        </div>

        <div class="alert alert-info" v-show="results.length == 0 && !loading && hadResults">
            No results
        </div>

        <modal v-model="modal.show"
               v-bind:title="modal.title"
               size="sm">
            <p>{{modal.text}}</p>

            <div slot="footer">
                <button type="button"
                        class="btn btn-default"
                        v-on:click="modal.show = false">Cancel</button>
                <a
                    href="#"
                    class="btn btn-danger">Remove all rules</a>
            </div>
        </modal>

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
                <a v-bind:href="'https://query.wikidata.org/#' + encodeURIComponent(queryString)"
                   target="_blank">
                    SPARQL Query
                </a>
            </h3>

            <details>
                <summary>Show query</summary>
                <pre>{{queryString}}</pre>
            </details>
        </div>

        <menu class="menu-bar">
            <button
                v-on:click="show.exampleQueries = true"
                v-show="!show.exampleQueries"
                class="btn btn-default">
                Show example queries
            </button>
        </menu>


        <div v-show="show.exampleQueries">
            <h3>Example queries</h3>

            <ul>
                <li v-for="e in examples">
                    <a v-bind:href="'#' + encodeURIComponent(e.query)">{{e.description}}</a>
                </li>
            </ul>
        </div>

        <p>
            <a v-if="!usesCommons"
               v-bind:href="COMMONS_URL_FLAG">
                Use the Wikimedia Commons SPARQL endpoint (experimental)
            </a>

            <a v-if="usesCommons" href="?">
                Go back to regular VizQuery
            </a>
        </p>
    </div>
<?php
    $hay->footer();
?>