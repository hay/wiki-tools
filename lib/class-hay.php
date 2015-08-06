<?php
require 'config.php';

class Hay {
    const DEFAULT_TITLE = "Hay's tools";
    private $toolname, $tools, $tooldata, $title, $description, $titletag, $path;

    public function __construct($toolname = false) {
        $this->path = realpath(dirname(__FILE__));
        $toolpath = $this->path . "/tools.json";
        $this->tools = json_decode(file_get_contents($toolpath));

        if ($toolname) {
            $this->toolname = $toolname;
            $this->tooldata = $this->tools->$toolname;
            $this->title = $this->tooldata->title;
            $this->description = $this->tooldata->description;
            $this->titletag = $this->title . " - " . self::DEFAULT_TITLE;
        } else {
            $this->titletag = self::DEFAULT_TITLE;
        }
    }

    public function getTools() {
        // Remove all 'hidden' tools
        $tools = array();

        foreach ($this->tools as $tool => $data) {
            if (empty($data->hidden)) {
                $tools[$tool] = $data;
            }
        }

        return $tools;
    }

    public function getTitle() {
        return $this->title;
    }

    public function getDescription() {
        return $this->description;
    }

    public function title() {
        echo $this->title;
    }

    public function description() {
        echo $this->description;
    }

    public function header(array $opts = array()) {
        $root = ROOT;
        $html = <<<HTML
<!doctype html>
<html ng-app="$this->toolname">
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
    <title>$this->titletag</title>
    <link rel="stylesheet" href="{$root}/vendor/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="{$root}/common/style.css" />
    <script>
        window._scripts = [];
    </script>
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

    public function footer() {
        $root = ROOT;

        echo <<<HTML

        </main>

        <hr />

        <footer class="footer">
            <p><small>Unless stated otherwise all code on these pages is under the <a href="http://opensource.org/licenses/MIT">MIT license</a> and all text and other media is under the <a href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-Sharealike (BY-SA) license</a>.</small></p>
        </footer>
    </div> <!-- .container -->

    <script src="${root}/vendor/jquery/dist/jquery.min.js"></script>
    <script src="${root}/vendor/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="${root}/vendor/fastclick/lib/fastclick.js"></script>
    <script>
        if (window._scripts) {
            window._scripts.forEach(function(script) {
                script();
            });
        }

        FastClick.attach(document.body);
    </script>
</body>
</html>
HTML;

    }
}