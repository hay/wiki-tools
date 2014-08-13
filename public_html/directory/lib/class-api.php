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
    function __construct() {

    }

    public function createTool() {
        return Model::factory('Tool')->create();
    }

    public function getAllTools() {
        return Model::factory('Tool')->order_by_desc('redirects')->find_many();
    }

    public function getToolById($id) {
        return Model::factory('Tool')->find_one($id);
    }

    public function getToolByName($name) {
        return Model::factory('Tool')->where('name', $name)->find_one();
    }

    public function getToolByJsonUrl($url) {
        return Model::factory('Tool')->where('jsonurl', $url)->find_many();
    }

    public function hasToolByJsonUrl($url) {
        return (bool) $this->getByJsonUrl($url);
    }

    public function hasToolByName($name) {
        return (bool) $this->getToolByName($name);
    }
}