<?php
use \Httpful\Request as Request;

ORM::configure('mysql:host=' . DB_HOST . ';dbname=' . DB_TOOLSDIRECTORY);
ORM::configure('username', DB_USER);
ORM::configure('password', DB_PASS);

class Tool extends Model {
    public static $_table = "tools";

    // In the future, we'll probably want 'title' here as well
    public static $requiredProperties = array("name", "url", "description");

    public static $mutableProperties = array(
        "name", "title", "jsonurl", "description", "url", "keywords", "author",
        "repository"
    );

    public function update($data) {
        // If no title is present, use 'name' instead
        if (!isset($data->title)) {
            $data->title = $data->name;
        }

        foreach ($data as $key => $value) {
            if (in_array($key, self::$mutableProperties)) {
                $this->set($key, $value);
            }
        }

        $this->save();
    }
}

class CsvTool {
    // Really...
    public function as_array() {
        return json_decode(json_encode($this), true);
    }
}

class CsvToolProvider {
    const CSV_URL = "https://docs.google.com/spreadsheets/d/184W69EVaWG-FGgughOsOLa3YqtQIHwbGpi9cpxy7YII/export?format=csv&gid=1636389058";

    private function convertToAssoc($data) {
        $tools = [];
        $header = array_shift($data);

        foreach ($data as $row) {
            $tool = new CsvTool();

            foreach ($row as $index => $value) {
                $key = $header[$index];
                $tool->$key = $value;
            }

            $tools[] = $tool;
        }

        return $tools;
    }

    public function getTools() {
        $url = self::CSV_URL;
        $res = Request::get($url)->send();
        $tools = $this->convertToAssoc($res->body);
        return $tools;
    }
}

class DatabaseToolProvider {
    public function getTools() {
        return Model::factory('Tool')->order_by_desc('redirects')->find_many();
    }
}

class DirectoryApi {
    private $indexfields = ['name', 'title', 'description', 'keywords', 'author'];
    private $toolprovider;

    function __construct($toolprovider) {
        $this->toolprovider = new $toolprovider();
    }

    private function explode($str) {
        $arr = explode(",", $str);
        $arr = array_map("trim", $arr);
        return $arr[0] == "" ? [] : $arr;
    }

    private function transformTool($tool) {
        // Add a fulltext property for easy filtering
        $tool->fulltext = "";

        foreach ($this->indexfields as $field) {
            $tool->fulltext .= " " . strtolower($tool->$field);
        }

        $tool->fulltext = trim($tool->fulltext);

        $tool->author = $this->explode($tool->author);
        $tool->keywords = $this->explode($tool->keywords);

        if (!empty($tools->title)) {
            $tools->title = $tools->name;
        }

        return $tool;
    }

    public function createTool() {
        return Model::factory('Tool')->create();
    }

    public function getAllTools() {
        $tools = $this->toolprovider->getTools();
        return array_map([$this, "transformTool"], $tools);
    }

    public function getAllToolsRaw() {
        return $this->toolprovider->getTools();
    }

    public function getTool($key, $value) {
        return Model::factory('Tool')->where($key, $value)->find_one();
    }

    public function getToolById($id) {
        return Model::factory('Tool')->find_one($id);
    }

    public function getToolByName($name) {
        return $this->getTool('name', $name);
    }

    public function getToolByJsonUrl($url) {
        return Model::factory('Tool')->where('jsonurl', $url)->find_many();
    }

    public function hasRequiredProperties($tool) {
        foreach (Tool::$requiredProperties as $prop) {
            if (empty($tool->$prop)) {
                return false;
            }
        }

        return true;
    }

    public function hasTool($key, $val) {
        return (bool) $this->getTool($key, $val);
    }

    public function hasToolByJsonUrl($url) {
        return $this->hasTool('jsonurl', $url);
    }

    public function hasToolByName($name) {
        return $this->hasTool('name', $name);
    }
}