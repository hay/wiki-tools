<?php
    require '../../lib/class-hay.php';
    require './api/vendor/autoload.php';
    require './api/class-oauth.php';

    $oauth = new OAuth([
        "mockLogin" => DEBUG,
        "endpoint" => OAUTH_COMMONS_ENDPOINT,
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

    if ($_GET["logout"] ?? false) {
        $oauth->logout();
        header("Location: index.php");
    }

    // Add a couple of settings and messages we later need in the Javascript
    // code
    $userName = null;
    $authUrl = null;
    $userState = $oauth->userState;

    if ($userState == OAuth::STATE_LOGGED_IN && !DEBUG) {
        $userName = $oauth->getIdentity()->username;
    }

    if ($userState == OAuth::STATE_LOGGED_OUT) {
        $authUrl = $oauth->getAuthUrl();
    }

    $hay = new Hay(basename(dirname(__FILE__)), [
        "bare" => true,
        "scripts" => [ 'bundle.js' ],
        "styles" => [ 'style.css' ]
    ]);

    $ctx = json_encode([
        "authUrl" => $authUrl,
        "isAccessTokenRequest" => $userState == OAuth::STATE_ACCES_TOKEN_REQUEST,
        "isDebug" => DEBUG,
        "isLoggedIn" => $userState == OAuth::STATE_LOGGED_IN,
        "isLoggedOut" => $userState == OAuth::STATE_LOGGED_OUT,
        "rootUrl" => $hay->getUrl(),
        "userName" => $userName
    ]);

    $hay->setBeforeHeadClose("<script>window.__ctx__ = window.__ctx__ || $ctx</script>");

    $hay->header();
?>
    <div id="app"
         class="app"
         v-cloak>
         <app></app>
    </div>
         <!--
        <h1 class="app-title">
            <a href="<?= $hay->getUrl(); ?>"><?php $hay->title(); ?></a>
        </h1>

        <p class="app-lead">
            <?php $hay->description(); ?>
        </p>

        <?php if ($oauth->userState == OAuth::STATE_LOGGED_IN): ?>
            <?php if (DEBUG): ?>
                <p class="app-user">Debug mode</p>
                <meta name="authenticated-user" content="debug-user" />
            <?php else: ?>
                <?php $user = $oauth->getIdentity()->username; ?>
                <p class="app-user">
                    Logged in as <strong>
                        <a href="https://commons.wikimedia.org/wiki/User:<?= $user; ?>"
                           target="_blank"><?= $user; ?></a></strong>.
                    <a href="index.php?logout=1">Log out</a>.
                </p>
                <meta name="authenticated-user" content="<?= $user; ?>" />
            <?php endif; ?>

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
    -->
<?php
    $hay->footer();
?>