<?php
    require '../../../lib/config.php';
    require './vendor/autoload.php';
    require './class-oauth.php';

    define('RE_ITEMID', "/[M|Q]\d+$/");

    $oauth = new OAuth([
        "mockLogin" => DEBUG,
        "endpoint" => OAUTH_COMMONS_ENDPOINT,
        "consumer_key" => OAUTH_DEPICTOR["consumer_key"],
        "consumer_secret" => OAUTH_DEPICTOR["consumer_secret"]
    ]);

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

    function addDepicts(string $mid, string $qid) {
        global $oauth;
        $token = $oauth->requestCsrfToken();

        $oauth->requestPost([
            "action" => "wbcreateclaim",
            "format" => 'json',
            "entity" => $mid,
            "property" => "P180", // For now we only support depicts
            "snaktype" => "value",
            "value" => json_encode([
                "entity-type" => "item",
                "numeric-id" => str_replace("Q", "", $qid)
            ]),
            "token" => $token,
            "summary" => "Setting a depicts statement using Depictor"
        ]);

        // TODO: maybe get the result and do some error checking
    }

    function assertOauth() {
        global $oauth;

        if ($oauth->userState != OAuth::STATE_LOGGED_IN) {
            error("User not authorized");
        }
    }

    function assertIncludes(string $string, array $includes) {
        if (!in_array($string, $includes)) {
            error("Invalid string, should be one of: " . implode(", ",$includes));
        }
    }

    function assertItemid(string $itemid) {
        if (!preg_match(RE_ITEMID, $itemid)) {
            error("Invalid id");
        }
    }

    function hasFile(string $mid):bool {
        assertItemid($mid);
        $files = ORM::for_table(TBL_DEPICTOR_FILES)
            ->where('mid', $mid)
            ->where_not_equal('status', 'user-skipped') // Skipped items can show up again
            ->find_array();
        return count($files) > 0;
    }

    function hasItem(string $qid) {
        assertItemid($qid);
        $items = ORM::for_table(TBL_DEPICTOR_ITEMS)->where('qid', $qid)->find_array();
        return count($items) > 0;
    }

    function insert(array $args) {
        assertItemid($args["mid"]);
        assertItemid($args["qid"]);
        assertIncludes($args["status"], [
            'depicted','not-depicted','user-skipped', 'prominently-depicted'
        ]);

        // First check if maybe this pair of mid/qid is already in the db
        if (hasFile($args["mid"])) {
            error("Item already in database");
        }

        // If in debug mode, we simply skip this step so we can test everything else
        if (!DEBUG && $args["status"] == "depicted") {
            addDepicts($args["mid"], $args["qid"]);
        }

        $newItem = ORM::for_table(TBL_DEPICTOR_FILES)->create();

        $newItem->set([
            "mid" => $args["mid"],
            "qid" => $args["qid"],
            "category" => $args["category"],
            "user" => $args["user"],
            "status" => $args["status"],
            "timestamp" => date("c")
        ]);

        $newItem->save();

        respond(["ok" => "Added"]);
    }

    function itemdone(array $args) {
        assertItemid($args["qid"]);

        // Check if qid is already in the db
        if (hasItem($args["qid"])) {
            error("Item already in database");
        }

        $newItem = ORM::for_table(TBL_DEPICTOR_ITEMS)->create();

        $newItem->set([
            "qid" => $args["qid"],
            "status" => "done",
            "timestamp" => date("c"),
            "user" => $args["user"]
        ]);

        $newItem->save();

        respond(["ok" => "Added"]);
    }

    function test(string $message) {
        global $oauth;
        $message = htmlentities($message);
        $token = $oauth->requestCsrfToken();
        $ident = $oauth->getIdentity();

        $req = $oauth->requestPost([
            'action' => 'edit',
            'title' => 'User:' . $ident->username,
            'section' => 'new',
            'summary' => 'Test message from Depictor',
            'text' => "Here's a message from Depictor: $message",
            'token' => $token,
            'format' => 'json',
        ]);

        $data = json_decode($req, true);

        respond($data);
    }

    function main() {
        setupDb();
        assertOauth();
        $action = $_GET["action"] ?? false;

        if ($action == "add-file") {
            insert($_GET);
        } else if ($action == "file-exists") {
            $has = hasFile($_GET["mid"]);
            respond(["status" => $has]);
        } else if ($action == "item-exists") {
            $has = hasItem($_GET["qid"]);
            respond(["status" => $has]);
        } else if ($action == "item-done") {
            itemdone($_GET);
        } else if ($action == "test") {
            test($_GET["message"] ?? "test-message");
        } else {
            error("Invalid action");
        }
    }

    main();