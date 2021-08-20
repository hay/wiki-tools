<?php
    require '../../../lib/config.php';
    require './vendor/autoload.php';

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

    function choice(array $args) {
        $type = $args["type"] ?? false;

        if (!in_array($type, POSSIBLE_TYPES)) {
            error("Invalid type");
        }

        $itemid = $args["itemid"] ?? false;

        if (!preg_match(RE_ITEMID, $itemid)) {
            error("Invalid itemid");
        }

        $status = $args["status"] ?? false;

        if (!in_array($status, POSSIBLE_STATES)) {
            error("Invalid status");
        }

        insert($args);
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

    function main() {
        setupDb();
        $action = $_GET["action"] ?? false;

        if ($action == "choice") {
            choice($_GET);
        }
    }

    main();