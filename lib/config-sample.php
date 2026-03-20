<?php
    define('ROOT', '//localhost:4080');
    define('PUBLIC_HTML_PATH', 'html');
    define('PATH', dirname(__FILE__) . '/');
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', 'root');
    define('DB_TOOLSDIRECTORY', 'wikitools');
    define('DB_TOOL_DATABASE', 'wikitools');
    define('TBL_DEPICTOR_CHALLENGES', 'depictor_challenges');
    define('TBL_DEPICTOR_FILES', 'depictor_files');
    define('TBL_DEPICTOR_ITEMS', 'depictor_items');
    define('DEBUG', false);
    define('ENV_MODE', 'test');
    define('OAUTH_DEPICTOR', [
        "consumer_key" => "xxx",
        "consumer_secret" => "xxx"
    ]);
    define('OAUTH_ENDPOINT', "https://commons.wikimedia.org");
    define('COMMONS_ENDPOINT', "https://commons.wikimedia.org");