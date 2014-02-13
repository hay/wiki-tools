<?php
    require '../../lib/class-hay.php';
    require 'class-gahetna.php';
    Hay::header();
?>
        <h1>NA Download</h1>

        <p class="lead">A small tool to download all images from a <a href="http://www.gahetna.nl">Dutch National Archive</a> inventory</p>

        <p>Simply copy the inventory URL and press 'download'. You'll get a script that you can use with wget to download all files.</p>

        <?php
            if (empty($_POST['url'])) {
        ?>

        <form method="post" action="index.php" class="form-inline">
            <div class="input-group">
                <input type="text" id="url" name="url" placeholder="URL" class="form-control" />
                <div class="input-group-btn">
                    <button type="submit" class="btn btn-primary">
                        <span class="glyphicon glyphicon-download"></span>
                        Download
                    </button>
                </div>
            </div>
        </form>

        <?php
            } else {
                $url = $_POST['url'];
                $api = new Gahetna();
                $text = $api->getDownloadscriptFromUrl($url);
        ?>

            <textarea cols="80" rows="10"><?php echo $text; ?></textarea>

            <a href="index.php">Try again!</a>
        <?php
            }
        ?>
<?php
    Hay::footer();
?>