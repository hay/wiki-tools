<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gahetna.php';
    require '../../lib/class-zipexternal.php';
    Hay::header();
?>
        <h1>NA Download</h1>

        <p class="lead">A small tool to download all images from a <a href="http://www.gahetna.nl">Dutch National Archive</a> inventory</p>

        <p>Simply copy the inventory URL and press 'download'. You'll get a script that you can use with wget to download all files.</p>

        <div class="alert alert-warning">
            <strong>Note</strong>: the API might be slow, so after hitting 'download' it could take a few minutes to get any resuls. Be patient :)
        </div>

        <?php
            if (empty($_POST['url'])) {
        ?>

        <form method="post" action="index.php" class="form-inline">
            <div class="input-group">
                <input type="text" id="url" name="url" placeholder="URL" class="form-control" />
                <div class="input-group-btn">
                    <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">
                        <span class="glyphicon glyphicon-download"></span>
                        Download as <span class="caret"></span>
                    </button>

                    <ul class="dropdown-menu" role="menu">
                        <li>
                            <button type="submit" class="btn btn-link" id="dlzip" name="dlzip">ZIP file</button>
                        </li>
                        <li>
                            <button type="submit" class="btn btn-link" id="dlwget" name="dlwget">wget script</button>
                        </li>
                        <li>
                            <button type="submit" class="btn btn-link" id="dlhtml" name="dlhtml">HTML links</button>
                        </li>
                    </ul>
                </div>
            </div>
        </form>

        <h3>Some examples</h3>

        <ul id="examples">
            <li><a href="http://gahetna.nl/collectie/archief/inventaris/gahetnascans/eadid/1.11.01.01/inventarisnr/121/level/file">Abel Tasman's travel journeys (1.11.01.01 / 121)</a></li>
        </ul>

        <?php
            } else {
                $url = $_POST['url'];
                foreach (array("wget", "html", "zip") as $methodname) {
                    if (isset($_POST['dl' . $methodname])) {
                        $method = $methodname;
                    }
                }
                $api = new Gahetna();

                if ($method == 'wget') {
                    $text = $api->getDownloadscriptFromUrl($url);

        ?>
                <textarea class="form-control" rows="10"><?php echo $text; ?></textarea>
        <?php
                }

                if ($method == 'html') {
                    $html = $api->getDownloadHtmlFromUrl($url);
                    echo $html;
                }

                if ($method == "zip") {
                    $zip = new ZipExternal();
                    $images = $api->getUrlList($url);

                    # For now, we limit the amount of images to 10, otherwise
                    # memory will fail
                    $images = array_slice($images, 0, 10);

                    foreach ($images as $image) {
                        $zip->addUrl($image['url'], $image['filename']);
                    }

                    $zip->create();
                }
        ?>

            <hr />

            <a class="btn btn-large btn-primary" href="index.php">Try again</a>
        <?php
            }
        ?>

        <script>
            (function() {
                var examples = document.getElementById('examples');
                var url = document.getElementById('url');

                if (!examples) {
                    return;
                }

                examples.addEventListener('click', function(e) {
                    e.preventDefault();
                    url.value = e.target.href;
                });
            })();
        </script>
<?php
    Hay::footer();
?>