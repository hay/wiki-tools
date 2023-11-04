<?php
    require '../../../lib/config.php';
    require './vendor/autoload.php';
    require './class-oauth.php';
    require './class-db.php';
    require './class-api.php';

    function respond(array $data) {
        header("content-type: application/json; charset=utf-8");
        echo json_encode($data);
        die();
    }

    $oauth = new OAuth([
        "mockLogin" => DEBUG,
        "endpoint" => OAUTH_ENDPOINT,
        "apiEndpoint" => COMMONS_ENDPOINT,
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

    $db = new Db([
        "connection_string" => sprintf('mysql:host=%s;dbname=%s;', DB_HOST, DB_TOOL_DATABASE),
        "username" => DB_USER,
        "password" => DB_PASS,
        "logging" => DEBUG
    ]);

    $api = new Api($oauth, $db);

    if (DEBUG) {
        $api->setDebug(true);
    }

    try {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            // Encoded JSON, get that
            $body = file_get_contents('php://input');
            $args = json_decode($body, true);
        } else {
            $args = $_GET;
        }

        $res = $api->process($args);
    } catch (Exception $e) {
        respond([ "error" => $e->getMessage() ]);
    }

    respond($res);