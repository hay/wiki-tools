<?php
require 'config.php';
require_once 'vendor/autoload.php';
require_once 'class-templaterenderer.php';

class Hay {
    const DEFAULT_TITLE = "Hay's tools";
    private $toolname, $tools, $tooldata, $title, $toolurl;
    private $description, $titletag, $path, $opts;
    private $version, $beforeHeadClose;

    public function __construct($toolname = false, $opts = []) {
        $this->path = realpath(dirname(__FILE__));
        $toolpath = $this->path . "/tools.json";
        $this->tools = json_decode(file_get_contents($toolpath));
        $this->renderer = new TemplateRenderer();
        $this->opts = $opts;
        $this->beforeHeadClose = $opts["beforeHeadClose"] ?? false;

        if ($toolname && isset($this->tools->$toolname)) {
            $this->toolname = $toolname;
            $this->tooldata = $this->tools->$toolname;
            $this->title = $this->tooldata->title;
            $this->toolurl = ROOT . "/$toolname";
            $this->description = $this->tooldata->description;
            $this->titletag = $this->title . " - " . self::DEFAULT_TITLE;
        } else {
            $this->titletag = self::DEFAULT_TITLE;
        }
    }

    public function description() {
        echo $this->description;
    }

    public function footer() {
        echo $this->renderer->render("footer", [
            "root" => ROOT,
            "opts" => $this->opts,
            "toolname" => $this->toolname
        ]);
    }

    public function getDescription() {
        return $this->description;
    }

    public function getTitle() {
        return $this->title;
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

    public function getUrl() {
        return ROOT . "/" . $this->toolname;
    }

    public function header() {
        echo $this->renderer->render("header", [
            'toolname' => $this->toolname,
            'title' => $this->title,
            'description' => $this->description,
            'url' => $this->toolurl,
            'root' => ROOT,
            "opts" => $this->opts,
            "before_head_close" => $this->beforeHeadClose
        ]);
    }

    public function setBeforeHeadClose(string $html) {
        $this->beforeHeadClose = $html;
    }

    public function title() {
        echo $this->title;
    }
}