<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("multisearch", [
        "styles" => [ 'style.css' ],
        "scripts" => [
            'dist.js'
        ]
    ]);

    $hay->header();
?>
    <div id="app"
         v-cloak>
        <h1>
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <section v-show="state === 'edit'">
            <p class="lead">
                <?php $hay->description(); ?>
            </p>
        </section>

        <div class="alert alert-danger" v-show="error">
            Sorry, something went wrong. Either your query was wrong, or there were no results.
            <p v-if="!isEmpty(error)"><em>Error: </em> <code>{{error}}</code></p>
        </div>

        <form v-show="state === 'edit'">
            <h3>Enter project name</h3>

            <div class="col-md-3 input-group buffer-bottom">
                <span class="input-group-addon">https://</span>
                <input
                    type="text"
                    class="form-control"
                    aria-label="Project name"
                    v-model="project"
                    placeholder="en.wikipedia">
                <span class="input-group-addon">.org</span>
            </div>

            <div class="cells cells-spaced">
                <h3>Input your page / item titles (up to 50), separated by newlines.</h3>

                <button
                    type="button"
                    class="btn btn-primary"
                    v-bind:disabled="!project || !titles.length"
                    v-on:click="search">
                    Search
                </button>
            </div>

            <textarea
                class="form-control"
                v-model="titlesText"
                rows="50"></textarea>
        </form>

        <div v-show="state === 'results'">
            <menu class="cells cells-menu">
                <button
                    type="button"
                    class="btn btn-default"
                    v-on:click="download">
                    Download CSV
                </button>

                <button
                    type="button"
                    class="btn btn-default"
                    v-on:click="copy">
                    Copy CSV
                </button>

                <button
                    type="button"
                    class="btn btn-default"
                    v-on:click="edit">
                    Edit query
                </button>
            </menu>

            <table
                class="table table-striped table-hover table-condensed table-responsive">
                <thead>
                    <tr>
                        <th>Search query</th>
                        <th>Page</th>
                        <th>Wikidata item</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                        v-for="row in resultsTable"
                        v-bind:class="{
                            'success' : row.available,
                            'danger' : !row.available
                        }">
                        <td><code>{{row.title}}</code></td>
                        <td>
                            <a v-if="row.available"
                               v-bind:href="row.wikipedia_link"
                               target="blank">
                               {{row.title}}
                            </a>

                            <span v-if="!row.available">Not available</span>
                        </td>
                        <td>
                            <a v-if="row.wikidata_id"
                               v-bind:href="row.wikidata_link"
                               target="blank">
                               {{row.wikidata_id}}
                            </a>

                            <span v-if="!row.wikidata_id">Not available</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-show="state === 'copy'">
            <button
                type="button"
                class="btn btn-primary buffer-bottom"
                v-on:click="closeCopy">
                Back to results
            </button>

            <textarea
                class="csv form-control"
                v-copy
                rows="10">{{csvRaw}}</textarea>
        </div>
    </div>
<?php
    $hay->footer();
?>