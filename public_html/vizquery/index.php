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
            <h3>Find all items that...</h3>

            <section v-for="rule in rules">
                <select v-model="rule.has">
                    <option v-for="option in hasOptions" v-bind:value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <p>a property</p>

                <typeahead
                    type="property"
                    v-bind:minlength="2"
                    v-bind:fromitemid="rule.property.id"
                    v-on:item="item => { rule.property = item }"
                    v-model="rule.propertyLabel"></typeahead>

                <p>that contains</p>

                <typeahead
                    type="item"
                    v-bind:minlength="2"
                    v-bind:fromitemid="rule.value.id"
                    v-on:item="item => { rule.value = item }"
                    v-model="rule.valueLabel"></typeahead>

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
                <button class="btn btn-primary" v-on:click="doQuery">
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

            <h3>SPARQL Query</h3>

            <details>
                <summary>Show query</summary>
                <pre>{{query}}</pre>
            </details>
        </div>

        <h3>Example queries</h3>

        <ul>
            <li v-for="e in examples">
                <a href="#" v-on:click="setExample(e)">{{e.description}}</a>
            </li>
        </ul>
    </div>

    <script type="text/html" id="tmpl-display-grid">
        <ul class="results--grid">
            <li v-for="item in data" class="thumbnail">
                <a v-if="item.thumb" v-bind:href="item.item.value" target="_blank">
                    <img v-bind:src="item.thumb" v-if="item.thumb" />
                </a>

                <h3 v-if="item.itemLabel">{{item.itemLabel.value}}</h3>
                <p v-if="item.itemDescription">{{item.itemDescription.value}}</p>
                <small><a v-if="item.item" v-bind:href="item.item.value" target="blank">{{item.id}}</a></small>
            </li>
        </ul>
    </script>

    <script type="text/html" id="tmpl-display-table">
        <table class="results--table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Label</th>
                    <th>Description</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="row in data">
                    <td>
                        <a v-if="row.item" v-bind:href="row.item.value" target="blank">{{row.id}}</a>
                    </td>
                    <td>
                        <template v-if="row.itemLabel">{{row.itemLabel.value}}</template>
                    </td>
                    <td>
                        <template v-if="row.itemDescription">{{row.itemDescription.value}}</template>
                    </td>
                </tr>
            </tbody>
        </table>
    </script>

    <script type="text/html" id="tmpl-typeahead">
        <div class="typeahead">
            <!-- <datalist> is still not supported on Safari :( -->
            <input type="text"
                   v-bind:value="value"
                   v-bind:style="style"
                   v-bind:placeholder="type"
                   v-on:input="update($event.target.value)">

            <ul class="typeahead__suggestions" v-show="loading">
                <li>Loading...</li>
            </ul>

            <ul class="typeahead__suggestions" v-show="suggestions.length">
                <li v-for="suggestion in suggestions"
                    v-on:click="setSuggestion(suggestion)">
                    {{suggestion.id}} - {{suggestion.label}}<br>
                    <small>{{suggestion.description}}</small>
                </li>
            </ul>
        </div>
    </script>
<?php
    $hay->footer();
?>