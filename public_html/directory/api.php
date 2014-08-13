<?php
    require '../../lib/vendor/autoload.php';
    require '../../lib/config.php';
    require 'lib/class-api.php';

    header("Content-Type: application/json; charset=utf-8");
    header("Access-Control-Allow-Origin: *");

    $api = new Api();

    $tools = array();

    foreach ($api->getAllTools() as $tool) {
        $tools[] = $tool->as_array();
    }

    echo json_encode($tools);