<?php
    // This is basically a proxy for api.haykranen.nl because Toolforge doesn't
    // allow client calls to third-party domains
    $uri = $_SERVER['REQUEST_URI'];
    $parts = explode("api.php", $uri);
    $query = $parts[1];
    $api_call = "https://api.haykranen.nl$query";
    echo file_get_contents($api_call);
    die();