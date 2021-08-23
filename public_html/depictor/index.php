<?php
    require '../../lib/class-hay.php';
    require './api/vendor/autoload.php';
    require './api/class-oauth.php';

    $oauth = new OAuth([
        "endpoint" => OAUTH_COMMONS_ENDPOINT,
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

    if ($_GET["logout"] ?? false) {
        $oauth->logout();
        header("Location: index.php");
    }

    $hay = new Hay(basename(dirname(__FILE__)), [
        "bare" => true,
        "scripts" => [ 'bundle.js' ],
        "styles" => [ 'style.css' ]
    ]);

    $hay->header();
?>
    <div id="app"
         class="app"
         v-cloak>
        <h1 class="app-title">
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <p class="app-lead">
            <?php $hay->description(); ?>
        </p>

        <?php if ($oauth->userState == OAuth::STATE_LOGGED_IN): ?>
            <p class="app-user">
                You are logged in as <strong><?= $oauth->getIdentity()->username; ?></strong>.
                <a href="index.php?logout=1">Log out</a>.
            </p>

            <app></app>
        <?php elseif ($oauth->userState == OAuth::STATE_ACCES_TOKEN_REQUEST): ?>
            <div class="screen">
                <p class="screen__lead">
                    You are now logged in. Click 'proceed' to begin.
                </p>

                <a href="index.php"
                   class="button button--start">Proceed</a>
            </div>
        <?php else: ?>
            <div class="screen">
                <p class="screen__lead">
                    Hi! To get started with matching images, click below to authorize this application
                    to make Wikimedia Commons edits on your behalf.
                </p>

                <a href="<?= $oauth->getAuthUrl(); ?>"
                   class="button button--start">Log in</a>
            </div>
        <?php endif; ?>
    </div>
<?php
    $hay->footer();
?>