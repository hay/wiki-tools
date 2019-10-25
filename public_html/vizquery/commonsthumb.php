<?php
    $mid = $_GET['mid'];
    $url = "https://commons.wikimedia.org/wiki/Special:EntityData/$mid.json";
    $json = json_decode(file_get_contents($url), true);

    $title = $json["entities"][$mid]["title"];
    $title = str_replace("File:", "", $title);
    $redirect = "https://commons.wikimedia.org/wiki/Special:FilePath/$title?width=300";
    header("Location: $redirect");
    echo $redirect;