<?php
require 'config.php';

class Hay {
    const DEFAULT_TITLE = "Hay's tools";

    public static function header(array $opts = array()) {
        $title = isset($opts['title']) ? $opts['title'] : self::DEFAULT_TITLE;
        $root = ROOT;
        $html = <<<HTML
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>$title</title>
    <link rel="stylesheet" href="{$root}/style.css" />
</head>
<body>
    <div id="wrapper">
        <header>
            Hay's tools
            <a href="../">Home</a>
        </header>
HTML;

        echo $html;
    }

    public static function footer() {
        echo <<<HTML

        <hr />

        <p><small>Unless stated otherwise all code on these pages is under the <a href="http://opensource.org/licenses/MIT">MIT license</a> and all text and other media is under the <a href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-Sharealike (BY-SA) license</a>.</small></p>
    </div>
</body>
</html>
HTML;

    }
}