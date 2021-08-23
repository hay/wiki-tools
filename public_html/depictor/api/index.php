<?php
    require '../../../lib/config.php';
    require './vendor/autoload.php';
    require './class-oauth.php';

    $oauth = new OAuth([
        "endpoint" => OAUTH_COMMONS_ENDPOINT,
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

    define('RE_ITEMID', "/[M|Q]\d+$/");
    define('POSSIBLE_STATES', ['approved','rejected','done']);
    define('POSSIBLE_TYPES', ['item', 'file']);

    function error(string $msg) {
        respond([ "error" => $msg ]);
    }

    function respond(array $data) {
        echo json_encode($data);
        die();
    }

    function setupDb() {
        ORM::configure([
            "connection_string" => sprintf('mysql:host=%s;dbname=%s;', DB_HOST, DB_TOOL_DATABASE),
            "username" => DB_USER,
            "password" => DB_PASS,
            "logging" => DEBUG
        ]);

        if (DEBUG) {
            ORM::configure('logger', function($log_string) {
                error_log($log_string);
            });
        }
    }

    function assertOauth() {
        global $oauth;

        if ($oauth->userState != OAuth::STATE_LOGGED_IN) {
            error("User not authorized");
        }
    }

    function check_type(string $type) {
        if (!in_array($type, POSSIBLE_TYPES)) {
            error("Invalid type");
        }
    }

    function check_itemid(string $itemid) {
        if (!preg_match(RE_ITEMID, $itemid)) {
            error("Invalid itemid");
        }
    }

    function choice(array $args) {
        $type = $args["type"] ?? false;
        check_type($type);

        $itemid = $args["itemid"] ?? false;
        check_itemid($itemid);

        $status = $args["status"] ?? false;

        if (!in_array($status, POSSIBLE_STATES)) {
            error("Invalid status");
        }

        insert($args);
    }

    function exists(array $args) {
        $type = $args["type"] ?? false;
        check_type($type);

        $itemid = $args["itemid"] ?? false;
        check_itemid($itemid);

        $has = hasItem($type, $itemid);
        respond(["status" => $has]);
    }

    function getItem(string $type, string $id) {
        return ORM::for_table(TBL_DEPICTOR_ITEMS)->where([
            "type" => $type,
            "itemid" => $id
        ])->find_array();
    }

    function hasItem(string $type, string $id) {
        return count(getItem($type, $id)) > 0;
    }

    function insert(array $args) {
        // First check if maybe this pair of type/id is already in the db
        $hasItem = hasItem($args["type"], $args["itemid"]);

        if ($hasItem) {
            error("Item already in database");
        }

        $newItem = ORM::for_table(TBL_DEPICTOR_ITEMS)->create();

        $newItem->set([
            "type" => $args["type"],
            "itemid" => $args["itemid"],
            "status" => $args["status"],
            "timestamp" => date("c")
        ]);

        $newItem->save();

        respond(["ok" => "Added"]);
    }

    function test() {
        global $oauth;
        print_r($oauth->getIdentity());
    }

    function main() {
        setupDb();
        // assertOauth();
        $action = $_GET["action"] ?? false;

        if ($action == "choice") {
            choice($_GET);
        } else if ($action == "exists") {
            exists($_GET);
        } else if ($action == "test") {
            test($_GET["message"] ?? "test-message");
        } else {
            error("Invalid action");
        }
    }

    main();