<?php
    define('ROOT', '//localhost/git/wiki-tools/public_html/');
    define('PATH', dirname(__FILE__) . '/');
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', 'root');
    define('DB_TOOLSDIRECTORY', 'toolsdirectory');
    define('DEBUG', false);
    define('DB_TOOL_DATABASE', 'wikitools');
    define('TBL_DEPICTOR_CHALLENGES', 'depictor_challenges');
    define('TBL_DEPICTOR_FILES', 'depictor_files');
    define('TBL_DEPICTOR_ITEMS', 'depictor_items');
    define('DEBUG', true);

    // This is used for Depictor
    define('OAUTH_DEPICTOR', [
        "consumer_key" => "xxx",
        "consumer_secret" => "xxx"
    ]);

    // These two should probably be the same, except if you want to
    // use a different server for authentication
    define('OAUTH_ENDPOINT', "https://commons.wikimedia.org");
    define('COMMONS_ENDPOINT', "https://commons.wikimedia.org");