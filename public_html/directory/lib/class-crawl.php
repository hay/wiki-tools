<?php
use \Httpful\Request as Request;

class Crawl {
    const API_ENDPOINT = 'https://wikitech.wikimedia.org/w/api.php';
    const TOOLS_PAGE = 'User:Hay/directory';
    const LOG_FILE = "crawler.log";
    const ERR_INVALID_JSON = 1;
    const ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL = 2;
    const ERR_UNAVAILABLE_JSON_FOR_UNKNOWN_TOOL = 3;

    private $crawllist, $api;

    function __construct() {
        $this->api = new Api();
        $now = time();
        $this->log("Starting new crawl");

        $this->crawllist = $this->getCrawlList();

        $this->checkDeletedTools();

        foreach ($this->crawllist as $crawlinfo) {
            $url = $crawlinfo['url'];
            $name = $crawlinfo['name'];

            $this->log("Now crawling $name < $url >");

            try {
                $toolinfo = $this->getToolInfo($url);
            } catch (Exception $e) {
                if ($e->getCode() == ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL) {
                    $tool = $api->getToolByJsonUrl($url);
                    $tool->unavailable = true;
                    $tool->save();
                }

                $this->log("Error for '$name': " . $e->getMessage());

                continue;
            }

            $toolinfo->jsonurl = $url;

            if ($this->api->hasToolByJsonUrl($url)) {
                $this->log("'$name' already in database, updating values");

                $tool = $this->api->getToolByJsonUrl($url);
                $tool->update($toolinfo);
            } else {
                $this->log("'$name' not in database, creating");

                $tool = $this->api->createTool();
                $tool->update($toolinfo);
            }
        }

        $seconds = time() - $now;
        $this->log("Crawl finished in $seconds seconds");
    }

    private function getToolInfo($url) {
        $req = Request::get($url)->send();

        if (isset($req->raw_body)) {
            $json = json_decode($req->raw_body);

            if ($json) {
                return $json;
            } else {
                throw new Exception("Invalid JSON", ERR_INVALID_JSON);
            }
        } else {
            if ($this->api->hasToolByJsonUrl($url)) {
                throw new Exception("JSON not available for this known tool", ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL);
            } else {
                throw new Exception("JSON not available for this unknown tool", ERR_UNAVAILABLE_JSON_FOR_UNKNOWN_TOOL);
            }
        }
    }

    private function log($line) {
        $msg = sprintf("[%s] %s\n", date("c"), $line);
        error_log($msg, 3, self::LOG_FILE);
    }

    private function getCrawlList() {
        $params = http_build_query(array(
            "format" => "json",
            "action" => "query",
            "titles" => self::TOOLS_PAGE,
            "prop" => "revisions",
            "rvprop" => "content"
        ));

        $res = Request::get(self::API_ENDPOINT . "?" . $params)->send();

        // Note the awful use of 'reset' here, because of MW api's strange
        // tendency to give back the page as the first item
        $source = reset($res->body->query->pages)->revisions[0]->{'*'};

        // Parse the <source> tag and get out the actual URLs
        $tools = (string) simplexml_load_string($source);
        $tools = explode("\n", trim($tools));

        // Seperate the name from the url
        return array_map(function($tool) {
            $vals = explode(":", $tool);
            $name = trim(array_shift($vals));
            $url = trim(implode(":", $vals));

            return array(
                "name" => trim($name),
                "url" => trim($url)
            );
        }, $tools);
    }

    // Check if all the jsonurls in the database are in the the crawllist, if
    // not, set them as 'deleted' in the db
    private function checkDeletedTools() {
        foreach ($this->api->getAllTools() as $tool) {
            $tool->deleted = !in_array($tool->jsonurl, $this->crawllist);
            $tool->save();
        }
    }
}