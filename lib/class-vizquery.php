<?php
use \Httpful\Request as Request;

class VizQuery {
    const API_ENDPOINT = "https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=%s";
    const THUMB_WIDTH = 300;

    private $renderer;

    function __construct() {
        $this->renderer = new TemplateRenderer();
    }

    public function parseResult($result) {
        if ($result->image) {
            $result->image->value = $result->image->value ."?width=" . self::THUMB_WIDTH;
        }

        return $result;
    }

    public function queryToSparql($q) {
        return $this->renderer->render("sparql-query", $q);
    }

    public function query($q) {
        $query = $this->queryToSparql($q);
        $url = sprintf(self::API_ENDPOINT, urlencode($query));
        $res = Request::get($url)->send();

        if (!$res) {
            throw new Exception("Invalid request");
        }

        return array_map(function ($result) {
            return $this->parseResult($result);
        }, $res->body->results->bindings);
    }
}