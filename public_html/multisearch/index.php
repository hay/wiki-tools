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

        <section v-show="!results">
            <p class="lead">
                <?php $hay->description(); ?>
            </p>
        </section>

        <div class="alert alert-danger" v-show="error">
            Sorry, something went wrong. Either your query was wrong, or there were no results.
            <p v-if="error">{{error}}</p>
        </div>

        <form v-show="!results">
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

            <div class="cells">
                <h3>Input your page / item titles (up to 50)</h3>

                <button
                    type="button"
                    class="btn btn-primary"
                    v-bind:disabled="!project"
                    v-on:click="search">
                    Search
                </button>
            </div>

            <textarea
                class="form-control"
                v-model="titlesText"
                rows="50"></textarea>
        </form>

        <table
            class="table table-striped table-hover table-condensed table-responsive"
            v-show="!!results">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Result</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="row in results">
                    <td>{{row.title}}</td>
                    <td v-html="row.result"></td>
                </tr>
            </tbody>
        </table>
    </div>
<?php
    $hay->footer();
?>