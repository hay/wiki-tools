<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gahetna.php';
    Hay::header();
?>
        <h1>NA Transcript</h1>

        <p class="lead">A tool to get the transcripts for pieces in the <a href="http://www.gahetna.nl">Dutch National Archive</a> (Nationaal Archief) as converted wikitext.</p>

        <?php
            if (empty($_POST['url'])) {
        ?>

        <p>Enter a transcript URL.</p>

        <form method="post" action="index.php" class="form-inline">
            <div class="input-group">
                <input type="text" name="url" id="url" class="form-control" />
                <span class="input-group-btn">
                    <button type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-cloud-download"></span>
                        Download
                    </button>
                </span>
            </div>
        </form>


        <h3>Some examples</h3>

        <ul id="examples">
            <li><a href="http://www.gahetna.nl/collectie/archief/inventaris/gahetnascan/eadid/1.01.02/inventarisnr/12588.55B/afbeelding/NL-HaNA_1.01.02_12588.55B_21">Page 21 of the peace treaty of Munster</a></li>
        </ul>

        <?php
            } else {
                $url = $_POST['url'];
                $api = new Gahetna();
                $transcript = $api->getTranscriptForUrl($url);
        ?>
                <textarea id="transcript" cols="40" rows="40" class="form-control"><?php echo $transcript; ?></textarea>
                <br />
                <a class="btn btn-large btn-primary" href="index.php">Try again</a>
        <?php
            }
        ?>

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
<?php
    $hay->footer();
?>