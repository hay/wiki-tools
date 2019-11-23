<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/config.php';
    require '../../lib/class-directoryapi.php';

    $api = new DirectoryApi("DatabaseToolProvider");

    function listtools() {
        global $api;

        header("Content-Type: application/json; charset=utf-8");
        header("Access-Control-Allow-Origin: *");

        $tools = array();

        foreach ($api->getAllTools() as $tool) {
            // Make sure we only list tools that have the required fields
            if ($api->hasRequiredProperties($tool)) {
                $tools[] = $tool->as_array();
            }
        }

        // Randomize the tool order
        shuffle($tools);

        echo json_encode($tools);
    }

    function track($name) {
        global $api;

        $tool = $api->getToolByName($name);

        if ($tool) {
            $tool->redirects = intval($tool->redirects) + 1;
            $tool->save();
        }

        die();
    }

    if (isset($_GET['track'])) {
        track($_GET['track']);
    } else {
        listtools();
    }