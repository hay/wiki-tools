<?php
    require '../../lib/class-hay.php';
    require './api/vendor/autoload.php';
    require './api/class-oauth.php';

    $oauth = new OAuth([
        "endpoint" => "https://commons.wikimedia.org/w/index.php?title=Special:OAuth",
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

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

        <pre><?= $oauth->userState; ?></pre>

        <?php if ($oauth->userState == "logged-in"): ?>
            <app></app>
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