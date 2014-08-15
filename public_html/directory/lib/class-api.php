<?php
ORM::configure('mysql:host=' . DB_HOST . ';dbname=' . DB_TOOLSDIRECTORY);
ORM::configure('username', DB_USER);
ORM::configure('password', DB_PASS);

class Tool extends Model {
    public static $_table = "tools";

    public function update($data) {
        // If no title is present, use 'name' instead
        if (!isset($data->title)) {
            $data->title = $data->name;
        }

        foreach ($data as $key => $value) {
            $this->set($key, $value);
        }

        $this->save();
    }
}

class Api {
    // In the future, we'll probably want 'title' here as well
    private $requiredProperties = array("name", "url", "description");

    function __construct() {

    }

    public function createTool() {
        return Model::factory('Tool')->create();
    }

    public function getAllTools() {
        return Model::factory('Tool')->order_by_desc('redirects')->find_many();
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
        foreach ($this->requiredProperties as $prop) {
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