<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("minefield", [
        "styles" => [ 'style.css' ],
        "scripts" => [ 'bundle.js' ]
    ]);

    $hay->header();
?>
    <div id="app"
         v-cloak>
        <h1>
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <section v-show="!results">
            <p class="lead">
                <?php $hay->description(); ?>
            </p>
        </section>

        <div class="alert alert-danger" v-show="error">
            Sorry, something went wrong. Either your query was wrong, or there were no results.
            <em>Error: </em> <code>{{error}}</code>
        </div>

        <div class="alert" v-show="loading">
            Getting your results...
        </div>

        <form v-show="!results">
            <div class="cells cells-spaced">
                <p class="text-info">
                    Input your Commons file page titles (up to 50), separated by newlines.
                </p>
            </div>

            <textarea
                class="form-control"
                v-model="titles"
                rows="50"></textarea>

            <button
                type="button"
                class="btn btn-primary buffer-top-2"
                v-bind:disabled="!titles.length"
                v-on:click="go">
                Go!
            </button>

            <button
                type="button"
                class="btn btn-link buffer-top-2"
                v-on:click="clear">
                Clear input
            </button>
        </form>

        <div v-show="results">
            <menu class="buffer-bottom-2">
                <button
                    type="button"
                    class="btn btn-primary"
                    v-on:click="download">
                    Download CSV
                </button>

                <button
                    type="button"
                    class="btn btn-default"
                    v-on:click="again">
                    Try again
                </button>
            </menu>

            <textarea
                class="form-control"
                v-model="csv"
                rows="50"></textarea>
        </div>
    </div>
<?php
    $hay->footer();
?>