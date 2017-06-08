<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("vizquery", [
        "styles" => [ 'style.css' ],
        "scripts" => [
            '../vendor/vue/dist/vue.js',
            '../vendor/handlebars/handlebars.min.js',
            '../vendor/underscore/underscore-min.js',
            'typeahead.js',
            'examples.js',
            'properties.js',
            'query.js',
            'view.js',
            'app.js'
        ]
    ]);

    $hay->header();
?>
    <div id="app" v-cloak>
        <h1>Wikidata <?php $hay->title(); ?></h1>

        <p class="lead" v-show="!results">
            <?php $hay->description(); ?>
        </p>

        <a v-show="results" href="index.php" class="pull-right btn btn-primary">Do another query</a>

        <div class="alert alert-danger" v-show="error">
            Sorry, something went wrong. Either your query was wrong, or there were no results.
            <p v-if="error">{{error}}</p>
        </div>

        <div class="form">
            <h3>Find all items that...</h3>

            <section v-for="rule in rules">
                <select v-model="rule.has">
                    <option v-for="option in hasOptions" v-bind:value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <p>a property</p>

                <typeahead
                    v-bind:source="properties"
                    v-bind:minlength="2"
                    v-bind:value="rule.property"></typeahead>

                <p>that contains</p>

                <input type="text" v-model="rule.value">

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
                <label for="limit">Maximum number of items to get</label>
                <input type="number" id="limit" v-model="limit">
            </section>

            <section>
                <button class="btn btn-primary" v-on:click="doQuery">
                    <span class="glyphicon glyphicon-search"></span>
                    Query
                </button>
            </section>
        </div>

        <div class="alert alert-info" v-show="loading">
            Loading...
        </div>

        <template v-if="results">
            <h3 v-show="results">Results</h3>

            <table v-show="results" class="results--table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Label</th>
                        <th>Description</th>
                        <th>Image</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in results">
                        <td>
                            <a v-if="row.item" v-bind:href="row.item.value" target="blank">{{row.id}}</a>
                        </td>
                        <td>
                            <template v-if="row.itemLabel">{{row.itemLabel.value}}</template>
                        </td>
                        <td>
                            <template v-if="row.itemDescription">{{row.itemDescription.value}}</template>
                        </td>
                        <td>
                            <img v-if="row.thumb" v-bind:src="row.thumb" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <h3>SPARQL Query</h3>

            <details>
                <summary>Show query</summary>
                <pre>{{query}}</pre>
            </details>
        </template>

        <h3>Example queries</h3>

        <ul>
            <li v-for="e in examples">
                <a href="#" v-on:click="setExample(e)">{{e.description}}</a>
            </li>
        </ul>
    </div>

    <script type="text/html" id="tmpl-typeahead">
        <div class="typeahead">
            <!-- <datalist> is still not supported on Safari :( -->
            <input type="text" v-model="input" v-on:keyup="keydown">

            <ul class="inputbox__suggestions" v-show="suggestions.length">
                <li v-for="suggestion in suggestions"
                    v-on:click="setSuggestion(suggestion)">
                    {{suggestion.id}} - {{suggestion.label}}
                </li>
            </ul>
        </div>
    </script>

    <script type="text/html" id="sparql-query">
        PREFIX wd: <http://www.wikidata.org/entity/>
        PREFIX wdt: <http://www.wikidata.org/prop/direct/>
        PREFIX wikibase: <http://wikiba.se/ontology#>
        PREFIX p: <http://www.wikidata.org/prop/>
        PREFIX ps: <http://www.wikidata.org/prop/statement/>
        PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX bd: <http://www.bigdata.com/rdf#>

        SELECT ?item ?itemLabel ?itemDescription ?image WHERE {
            {{#each where}}
                ?item wdt:{{property}} {{value}} .
            {{/each}}

            {{#if minus}}
            MINUS {
                {{#each minus}}
                    ?item wdt:{{property}} wd:{{value}} .
                {{/each}}
            }
            {{/if}}

          SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        } LIMIT {{limit}}
    </script>
<?php
    $hay->footer();
?>