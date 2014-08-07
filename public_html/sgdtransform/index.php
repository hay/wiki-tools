<?php
    require '../../lib/class-hay.php';
    $hay = new Hay("sgdtransform");
    $hay->header();

    function transformXml($xml) {
        $url_prefix = "http://www.statengeneraaldigitaal.nl/document";

        // Some ugly regular expressions and string replacement
        preg_match_all("/<identifier>(.*)<\/identifier>/", $xml, $matches);

        if (empty($matches[0])) {
            return false;
        }

        $tag = $matches[0][0];
        $uri = $matches[1][0];
        preg_match_all("/sgd:kaarten:mpeg21:(.*):(.*):(.*):image/", $uri, $matches);

        if (empty($matches[0])) {
            return false;
        }

        $newurl = sprintf("%s?id=sgd:mpeg21:%s:%s&pagina=%s",
            $url_prefix,
            $matches[1][0],
            $matches[2][0],
            ltrim($matches[3][0], "0")
        );

        $newtag = sprintf(
            "<identifier>%s</identifier>\n<originalidentifier>%s</originalidentifier>",
            $newurl, $uri
        );

        $xml = str_replace($tag, $newtag, $xml);

        return $xml;
    }
?>
    <h1><?php $hay->title(); ?></h1>

    <p class="lead"><?php $hay->description(); ?></p>

    <?php
        if (empty($_POST['xml'])) {
    ?>

    <p>Enter some XML.</p>

    <form method="post" action="index.php" class="form-inline">
        <div class="input-group">
            <textarea name="xml" id="xml" cols="80" rows="20" class="form-control"></textarea>

            <button type="submit" class="btn btn-primary">
                <span class="glyphicon glyphicon-cloud-download"></span>
                Transform
            </button>
        </div>
    </form>

    <?php
        } else {
            $xml = transformXml($_POST['xml']);
    ?>

        <?php if($xml): ?>
            <textarea cols="80" rows="20" disabled><?php echo $xml; ?></textarea>
        <?php else: ?>
            <p>Oops.. something went wrong. Sure your XML is valid?</p>
        <?php endif; ?>

        <br />
        <a class="btn btn-large btn-primary" href="index.php">Try again</a>
    <?php
        }
    ?>
<?php
    $hay->footer();
?>