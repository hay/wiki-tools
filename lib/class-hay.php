<?php
class Hay {
    const DEFAULT_TITLE = "Hay's tools";

    public static function header(array $opts = array()) {
        $title = isset($opts['title']) ? $opts['title'] : self::DEFAULT_TITLE;

        $html = <<<HTML
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>$title</title>
    <style>
        * {
            font-family: Helvetica, Arial, sans-serif;
            box-sizing: border-box;
            color: #333;
        }

        #wrapper {
            margin: 0 auto;
            max-width: 640px;
            padding: 0 20px;
        }

        h1 {
            font-size: 2em;
        }

        h2 {
            font-size: 1.5em;
            font-weight: normal;
        }

        header {
            border-bottom: 5px solid navy;
        }

        header a {
            text-decoration: none;
            padding: 0 10px;
        }
    </style>
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