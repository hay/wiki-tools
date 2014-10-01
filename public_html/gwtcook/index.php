<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/class-hay.php';
    require '../../lib/class-gwtcook.php';
    require '../../lib/class-gwtcooktransformer.php';
    require '../../lib/class-gwtcooknabeeldbank.php';

    if (!empty($_FILES)) {
        $gwtcook = new GwtCook($_FILES['file'], $_POST['transformer']);

        // If there is no error, offer the new file as a download,
        // otherwise show the  error
        if (!$gwtcook->hasError()) {
            if (!isset($_POST['downloadxml'])) {
                die( $gwtcook->getXml() );
            }

            header("Content-disposition: attachment; filename=" . $gwtcook->getFilename());
            header('Content-Type: application/xml');
            die( $gwtcook->getXml() );
        }
    }

    $hay = new Hay("gwtcook");

    $hay->header();
?>
    <h1><?php $hay->title(); ?></h1>

<?php if(empty($_FILES)): ?>

    <p class="lead"><?php $hay->description(); ?></p>

    <form action="index.php" method="post" enctype="multipart/form-data" role="form">
        <div class="form-group">
            <label for="file">File input</label>
            <input type="file" id="file" name="file" />
            <p class="help-block">Upload a valid XML file</p>
        </div>

        <div class="form-group">
            <label for="transformer">Transformer</label>

            <select name="transformer" id="transformer" class="form-control">
                <option value="na-beeldbank">Nationaal Archief Beeldbank</option>
            </select>
        </div>

        <div class="form-group">
            <label>
                Download result as XML
                <input type="checkbox" id="downloadxml" name="downloadxml" checked />
            </label>

            <p class="help-block">Disable this option to display the XML in the browser instead.</p>
        </div>

        <button type="submit" class="btn btn-primary">
            <span class="glyphicon glyphicon-upload"></span>
            Upload and transform XML
        </button>
    </form>

<?php else: ?>
    <?php if ($gwtcook->hasError()): ?>
        <div class="alert alert-danger"><?php echo $gwtcook->getError(); ?></div>

        <a href="index.php" class="btn btn-primary">Try again?</a>
    <?php endif; ?>

<?php endif; ?>
<?php
    $hay->footer();
?>