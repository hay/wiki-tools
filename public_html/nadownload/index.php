<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gahetna.php';

    if (isset($_POST['url'])) {
        $url = $_POST['url'];
        $api = new Gahetna();
        $script = $api->getWgetScriptFromUrl($url);

        if (isset($_POST['dl-wget-linux'])) {
            $script = "#!/bin/bash\n$script";
            $filename = "download.sh";
        } else {
            $filename = "download.bat";
        }

        header('Content-Type: text/plain');
        header("Content-Disposition: attachment; filename=$filename");
        echo $script;
        die();
    }

    Hay::header();
?>
        <h1>NA Download</h1>

        <p class="lead">A small tool to download all images from a <a href="http://www.gahetna.nl">Dutch National Archive</a> inventory</p>

        <p>Simply copy the inventory URL and press 'download'. You'll get a script that you can use with wget to download all files.</p>

        <div class="alert alert-warning">
            <strong>Note</strong>: the API might be slow, so after hitting 'download' it could take a few minutes to get any resuls. Be patient :)
        </div>

<?php if (empty($_POST['url'])): ?>

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
                            <button type="submit" class="btn btn-link" id="dl-wget-linux" name="dl-wget-linux">wget script (Mac / Linux)</button>
                        </li>
                        <li>
                            <button type="submit" class="btn btn-link" id="dl-wget-windows" name="dl-wget-windows">wget script (Windows)</button>
                        </li>
                    </ul>
                </div>
            </div>
        </form>

        <h3>Some examples</h3>

        <ul id="examples">
            <li><a href="http://gahetna.nl/collectie/archief/inventaris/gahetnascans/eadid/1.11.01.01/inventarisnr/121/level/file">Abel Tasman's travel journeys (1.11.01.01 / 121)</a></li>
        </ul>

        <h3>A little HOWTO</h3>

        <h4>On Windows</h4>
        <p>This is a bit hacky but it works. Get <a href="wget-windows.zip">this version</a> of wget for windows and extract it somewhere. Then use the tool to get the script as a BAT file, save it to the same directory as your extracted wget files. Now doubleclick the BAT file and Bob should be your uncle.</p>

        <h4>On Mac OS X / Linux</h4>
        <p>You need a little tool called <code>wget</code>. If it's not available on your system install it using your package manager of choice (e.g. <a href="http://mxcl.github.io/homebrew/">homebrew</a> on Mac OS X). </p>

        <p>Download the file, save it to some directory and open a terminal. Then cd to the directory, make the file executable (<code>chmod +x ./download.sh</code>). Now you can simple execute it (<code>./download.sh</code>) and files should start rolling in!</p>

<?php endif; ?>

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