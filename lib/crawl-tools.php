<?php
    require __DIR__ . '/vendor/autoload.php';
    require __DIR__ . '/config.php';
    require __DIR__ . '/class-directoryapi.php';
    require __DIR__ . '/class-directorycrawl.php';

    $crawl = new DirectoryCrawl();
    file_put_contents(__DIR__ . "/../public_html/directory/last-update.txt", date("c"));