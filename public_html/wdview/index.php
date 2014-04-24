<?php
    require '../../lib/class-hay.php';

    $hay = new Hay("wdview");
    $hay->header();
?>
<style>
    h1 {
        margin: 0 0 20px 0;
    }

    form {
        margin-top: 5px;
    }
</style>

<div>
    <div class="row">
        <div class="col-md-12">
            <select id="lang" class="pull-right">
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
                <option value="de">Deutsch</option>
                <option value="sv">Svenska</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="ru">Русский</option>
                <option value="es">Español</option>
                <option value="pl">Polski</option>
            </select>
        </div>

        <div style="height:30px;"></div>

        <div class="col-md-6">
            <h1><a href="index.php"><?php $hay->title(); ?></a></h1>
        </div>

        <div class="col-md-6">
            <form action="index.php" method="get" role="form">
                <div class="input-group">
                    <input type="text" id="q" name="q" class="form-control" autocomplete="off" />

                    <div class="input-group-btn">
                        <button type="submit" class="btn btn-primary">
                            <span class="glyphicon glyphicon-search"></span>
                            Lookup
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <?php if (!empty($_GET['id'])): ?>
        <script>
            // This should be a lot prettier
            var WIKIDATA_ID = "<?php echo $_GET['id']; ?>";
        </script>

        <div id="item" class="row">
            <div class="loading">Loading...</div>

            <div class="col-md-12">
                <h1 class="mainlabel"></h1>
                <h2 class="description"></h2>
            </div>

            <div class="col-md-6">
                <div class="image"></div>
            </div>

            <div class="col-md-6">
                <table class="table itemdata">
                </table>
            </div>
        </div>
    <?php elseif (!empty($_GET['q'])): ?>
        <script>
            var WIKIDATA_Q ="<?php echo $_GET['q']; ?>";
        </script>

        <div id="searchresults">
            <h3>Search results</h3>

            <div class="loading">Loading...</div>

            <ul></ul>
        </div>
    <?php else: ?>
        <p class="lead"><?php $hay->description(); ?></p>

        <p>Simply use the search form at the top of this page to try it out.</p>

        <h3>Examples</h3>
        <ul>
            <li><a href="?id=Q76">Barack Obama</a></li>
            <li><a href="?id=Q727">Amsterdam</a></li>
            <li><a href="?id=Q219831">The Nightwatch</a></li>
        </ul>
    <?php endif; ?>
</div>

    <script src="../common/jquery.js"></script>
    <script src="../common/moment.js"></script>
    <script src="app.js"></script>
    <script>
        this.app = new App();
    </script>
<?php
    $hay->footer();
?>