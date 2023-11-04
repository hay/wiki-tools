<?php
    // The default docker-compose setup hosts at the root of port 4080 on localhost
    define('ROOT', '//localhost:4080/');
    define('PATH', dirname(__FILE__) . '/');

    // DB settings, as configured in docker-compose.yml
    define('DB_HOST', 'mysql');
    define('DB_USER', 'test');
    define('DB_PASS', 'test');
    define('DB_TOOL_DATABASE', 'test');

    // TODO there should be a default of these set somewhere, so users don't need to set it
    define('TBL_DEPICTOR_ITEMS', 'depictor_items');
    define('TBL_DEPICTOR_FILES', 'depictor_files');
    define('TBL_DEPICTOR_CHALLENGES', 'depictor_challenges');

    // TODO this can probably be hard coded
    define('COMMONS_ENDPOINT', 'https://commons.wikimedia.org');