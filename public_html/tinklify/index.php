<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("tinklify", [
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
            <p>Sorry, something went wrong. Here's an error message:</p>

            <p><code>{{error}}</code></p>
        </div>

        <div class="alert" v-show="loading">
            <p class="loading">Getting your results 😴...</p>
        </div>

        <div v-show="!results && !loading">
            <p class="text-info">Enter a URL to a Wikimedia project here</p>

            <div class="input-with-button">
                <input
                    v-model="url"
                    v-on:keyup.enter="go"
                    class="form-control"
                    placeholder="https://en.wikipedia.org/wiki/Bolivian_cuisine" />

                <button
                    type="button"
                    class="btn btn-primary buffer-top-2"
                    v-bind:disabled="!urlValid"
                    v-on:click="go">
                    Go!
                </button>
            </div>

            <br />

            <p class="text-muted">
                Note that this tool is limited to the first 500 links on a page.
            </p>
        </div>

        <div v-if="results">
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

            <h2>
                Links with items for
                <a v-bind:href="url"
                   target="_blank">
                   {{urlParsed.title}}
                </a>
            </h2>

            <table class="table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Title</th>
                        <th>QID</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in results">
                        <td>{{row.status}}</td>
                        <td>
                            <a v-bind:href="row.url"
                               target="_blank">
                                {{row.title}}
                            </a>
                        </td>
                        <td>
                            <a v-bind:href="row.qidlink"
                               target="_blank">
                                {{row.qid}}
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
<?php
    $hay->footer();
?>