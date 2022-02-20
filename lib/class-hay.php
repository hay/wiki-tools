<?php
require 'config.php';
require_once 'vendor/autoload.php';
require_once 'class-templaterenderer.php';

class Hay {
    const DEFAULT_TITLE = "Hay's tools";
    private $toolname, $tools, $tooldata, $title, $toolurl;
    private $description, $titletag, $path, $opts, $toolpath;
    private $version, $beforeHeadClose, $default_scripts;

    public function __construct($toolname = false, $opts = []) {
        $this->path = realpath(dirname(__FILE__));
        $toolpath = $this->path . "/tools.json";
        $this->tools = json_decode(file_get_contents($toolpath));
        $this->renderer = new TemplateRenderer();
        $this->opts = $opts;
        $this->beforeHeadClose = $opts["beforeHeadClose"] ?? false;
        $this->default_scripts = $opts["default_scripts"] ?? true;

        if ($toolname && isset($this->tools->$toolname)) {
            $this->toolname = $toolname;
            $this->tooldata = $this->tools->$toolname;
            $this->title = $this->tooldata->title;
            $this->toolurl = ROOT . "/$toolname";
            $this->toolpath = realpath($this->path . "/../public_html/$toolname");
            $this->description = $this->tooldata->description;
            $this->titletag = $this->title . " - " . self::DEFAULT_TITLE;
        } else {
            $this->toolname = $toolname;
            $this->titletag = self::DEFAULT_TITLE;
            $this->toolurl = ROOT . "/$toolname";
        }
    }

    public function description() {
        echo $this->description;
    }

    public function footer() {
        echo $this->renderer->render("footer", [
            "debug" => DEBUG,
            "default_scripts" => $this->default_scripts,
            "opts" => $this->opts,
            "root" => ROOT,
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
            "default_scripts" => $this->default_scripts,
            'toolname' => $this->toolname,
            'title' => $this->title,
            'description' => $this->description,
            'url' => $this->toolurl,
            'root' => ROOT,
            'debug' => DEBUG,
            "opts" => $this->opts,
            "before_head_close" => $this->beforeHeadClose,
            "vite" => $this->getViteOpts()
        ]);
    }

    public function setBeforeHeadClose(string $html) {
        $this->beforeHeadClose = $html;
    }

    public function title() {
        echo $this->title;
    }

    private function getViteOpts():array {
        if (!$this->opts["use_vite"]) {
            return [];
        }

        if (!$this->opts["vite_manifest"]) {
            throw new Exception("Vite is used, but no manifest available");
        }

        // Load manifest and parse js/css
        $manifest_path = $this->toolpath . "/" . $this->opts["vite_manifest"];

        // FIXME
        $manifest_root_url = $this->toolurl . "/dist";

        $manifest = json_decode(file_get_contents($manifest_path));
        $styles = [];
        $scripts = [];

        foreach ($manifest as $key => $file) {
            if ($file->file) {
                $scripts[] = $manifest_root_url . "/" . $file->file;
            }

            if (isset($file->css)) {
                foreach ($file->css as $style) {
                    $styles[] = $manifest_root_url . "/". $style;
                }
            }
        }

        $opts = [
            "scripts" => $scripts,
            "styles" => $styles
        ];

        return $opts;
    }
}