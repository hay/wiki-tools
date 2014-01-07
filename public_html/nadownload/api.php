<?php
require 'vendor/autoload.php';
require 'class-gahetna.php';

$api = new Gahetna();

$q = $_GET['q'];
$json = array("error" => true);

if (empty($q)) {
    $json = array("error" => "no query");
}

$data = $api->query($q);

header("Content-Type: application/json");
echo json_encode($data);