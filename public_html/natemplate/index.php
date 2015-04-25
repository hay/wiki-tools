<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gahetna.php';
    Hay::header();
?>
        <h1>NA Commons Template</h1>

        <p class="lead">Generate a <a href="https://commons.wikimedia.org/wiki/Template:Photograph">{{Photograph}}</a> template for use on Wikimedia Commons from a <a href="http://www.gahetna.nl">Nationaal Archief</a> (Dutch National Archive) photograph.</p>

        <?php
            if (empty($_POST['id'])) {
        ?>

        <p>Enter an inventory number ('bestandsdeelnummer').</p>

        <form method="post" action="index.php" class="form-inline">
            <div class="input-group">
                <input type="text" name="id" id="id" class="form-control" />
                <span class="input-group-btn">
                    <button type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-search"></span>
                        Go
                    </button>
                </span>
            </div>
        </form>

        <!--
        <h3>Some examples</h3>

        <ul id="examples">
            <li><a href="http://www.gahetna.nl/collectie/archief/inventaris/gahetnascan/eadid/1.01.02/inventarisnr/12588.55B/afbeelding/NL-HaNA_1.01.02_12588.55B_21">Page 21 of the peace treaty of Munster</a></li>
        </ul>
        -->

        <?php
            } else {
                $id = $_POST['id'];
                $api = new Gahetna();
                $template = $api->getCommonsTemplateForPhoto($id);
        ?>
                <textarea id="transcript" cols="40" rows="40" class="form-control"><?php echo $template; ?></textarea>
                <br />
                <a class="btn btn-large btn-primary" href="index.php">Try again</a>
        <?php
            }
        ?>

        <!--
        <script src="//tools-static.wmflabs.org/cdnjs/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
        <script>
            $("#examples a").on('click', function(e) {
                e.preventDefault();
                $("#url").val(e.target.href);
            });

            $("#transcript").on('click', function(e) {
                $(this).select();
            });
        </script>
        -->
<?php
    Hay::footer();
?>