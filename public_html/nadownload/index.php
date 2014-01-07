<?php
    require '../../lib/class-hay.php';
    require 'class-gahetna.php';
    Hay::header();
?>
        <h1>NA Download</h1>
        <h2>A small tool to download all images from a <a href="http://www.gahetna.nl">Dutch National Archive</a> inventory</h2>

        <p>Simply copy the inventory URL and press 'download'. You'll get a script that you can use with wget to download all files.</p>

        <?php
            if (empty($_POST['url'])) {
        ?>

        <form method="post" action="index.php">
            <input type="text" id="url" name="url" placeholder="URL" />
            <button id="go">Download!</button>
        </form>

        <?php
            } else {
                $url = $_POST['url'];
                $api = new Gahetna();
                $text = $api->getDownloadscriptFromUrl($url);
        ?>

            <textarea cols="80" rows="10"><?php echo $text; ?></textarea>
        <?php
            }
        ?>
<?php
    Hay::footer();
?>