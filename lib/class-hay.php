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
 <!-- __                                    __                   ___
     /\ \                                  /\ \__               /\_ \
     \ \ \___      __     __  __    ____   \ \ ,_\   ___     ___\//\ \     ____
      \ \  _ `\  /'__`\  /\ \/\ \  /',__\   \ \ \/  / __`\  / __`\\ \ \   /',__\
       \ \ \ \ \/\ \L\.\_\ \ \_\ \/\__, `\   \ \ \_/\ \L\ \/\ \L\ \\_\ \_/\__, `\
        \ \_\ \_\ \__/.\_\\/`____ \/\____/    \ \__\ \____/\ \____//\____\/\____/
         \/_/\/_/\/__/\/_/ `/___/> \/___/      \/__/\/___/  \/___/ \/____/\/___/
                              /\___/
                              \/__/                                           -->

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>$title</title>
    <link rel="stylesheet" href="{$root}/vendor/bootstrap/css/bootstrap.min.css" />
    <style>
        #wrapper { max-width: 700px; }

        .dl-horizontal dd {
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .cell-maximize-length {
            text-overflow: ellipsis;
            overflow: hidden;
            display: inline-block;
            white-space: nowrap;
        }
    </style>
</head>
<body>
<div id="wrapper" class="container">
    <header>
        <ul class="nav nav-header nav-pills pull-right">
            <li><a href="../">Home</a></li>
            <li><a href="https://github.com/hay/wiki-tools">Source</a></li>
        </ul>
        <h3 class="text-muted"><a href="../">Hay's tools</a></h3>
    </header>

    <hr />

    <main>
HTML;

        echo $html;
    }

    public static function footer() {
        $root = ROOT;

        echo <<<HTML

        </main>

        <hr />

        <footer>
            <p><small>Unless stated otherwise all code on these pages is under the <a href="http://opensource.org/licenses/MIT">MIT license</a> and all text and other media is under the <a href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-Sharealike (BY-SA) license</a>.</small></p>
        </footer>
    </div> <!-- .container -->

    <script src="${root}/vendor/jquery/jquery.js"></script>
    <script src="${root}/vendor/bootstrap/js/bootstrap.min.js"></script>
</body>
</html>
HTML;

    }
}