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

    if (DEBUG) {
        $userName = "Debug user";
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
<?php
    $hay->footer();
?>