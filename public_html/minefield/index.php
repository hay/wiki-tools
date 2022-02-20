<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("minefield", [
        "bare" => true,
        "default_scripts" => false,
        "use_vite" => true,
        "vite_entry" => "js/app.js"
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
            <p>Sorry, something went wrong. Here's an error message:</p>

            <p><code>{{error}}</code></p>
        </div>

        <div class="alert" v-show="loading">
            <p class="loading">Getting your results 😴...</p>
        </div>

        <form v-show="!results && !loading">
            <div class="cells cells-spaced">
                <p class="text-info">
                    Input your Commons file page titles separated by newlines.
                    <button
                        class="text-link"
                        v-show="!showPagepile"
                        v-on:click="displayPagepile($event)">
                        Or use a PagePile ID
                    </button>
                </p>
            </div>

            <div
                v-show="showPagepile"
                class="pagepile-input">
                <input
                    class="form-control"
                    placeholder="Enter PagePile ID"
                    v-model="pagepileInput" />

                <button
                    class="btn btn-primary"
                    v-bind:disabled="!pagepileInput"
                    v-on:click="setPagepile($event)">
                    Go
                </button>
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