<?php
use \Httpful\Request as Request;

class DirectoryCrawl {
    const API_ENDPOINT = 'https://wikitech.wikimedia.org/w/api.php';
    const TOOLS_PAGE = 'User:Hay/directory';
    const LOG_FILE = "crawler.log";
    const TOOL_REGEX = "/<!-- START_TOOL_LIST -->(.*)<!-- END_TOOL_LIST -->/ms";
    const ERR_INVALID_JSON = 1;
    const ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL = 2;
    const ERR_UNAVAILABLE_JSON_FOR_UNKNOWN_TOOL = 3;

    private $crawllist, $api;

    function __construct() {
        date_default_timezone_set("UTC");
        $this->api = new DirectoryApi("DatabaseToolProvider");
        $now = time();

        // Let's start the crawl. Delete the old crawler log
        // because it gets too big otherwise
        $this->emptyLog();
        $this->log("Starting new crawl");

        $this->crawllist = $this->getCrawlList();

        $this->checkDeletedTools();

        foreach ($this->crawllist as $url) {
            $this->log("Now crawling < $url >");

            try {
                $tools = $this->getToolInfo($url);
            } catch (Exception $e) {
                if ($e->getCode() == self::ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL) {
                    $tools = $this->api->getToolByJsonUrl($url);

                    foreach ($tools as $tool) {
                        $tool->unavailable = true;
                        $tool->save();
                    }
                }

                $this->log("Error for < $url >: " . $e->getMessage());

                continue;
            }

            // Now loop over all the tools, and process them
            foreach ($tools as $tool) {
                $tool->jsonurl = $url;

                // Using 'title' instead of 'name' is deprecated
                $name = isset($tool->name) ? $tool->name : $tool->title;

                if (!$this->api->hasRequiredProperties($tool)) {
                    $this->log("'$name' does not all have required properties, skipping");
                    continue;
                }

                if ($this->api->hasToolByName($name)) {
                    $this->log("'$name' already in database, updating values");

                    $record = $this->api->getToolByName($name);
                } else {
                    $this->log("'$name' not in database, creating");

                    $record = $this->api->createTool();

                    // Does this url already exist in the database?
                    if ($this->api->hasTool('url', $url)) {
                        $this->log("'$name' has an url property that already exists in the database, skipping");
                        continue;
                    }

                    // Add a timestamp with new tools
                    $record->added = date("c");
                }

                try {
                    $record->update($tool);
                } catch (Exception $e) {
                    $this->log("Could not update $name because of a database exception");
                }
            }
        }

        $seconds = time() - $now;
        $this->log("Crawl finished in $seconds seconds");
    }

    private function emptyLog() {
        file_put_contents(self::LOG_FILE, "");
    }

    private function getToolInfo($url) {
        $req = Request::get($url)->followRedirects(true)->send();

        if (isset($req->raw_body)) {
            $json = json_decode($req->raw_body);

            if ($json) {
                // Check if this is a 'multi-tool-list', or simply one tool
                if (is_object($json)) {
                    // Put the lonely tool in an array to simplify handling later
                    return array( $json );
                } else {
                    // More than one tool
                    return $json;
                }
            } else {
                throw new Exception("Invalid JSON", self::ERR_INVALID_JSON);
            }
        } else {
            if ($this->api->hasToolByJsonUrl($url)) {
                throw new Exception("JSON not available for this known tool", self::ERR_UNAVAILABLE_JSON_FOR_KNOWN_TOOL);
            } else {
                throw new Exception("JSON not available for this unknown tool", self::ERR_UNAVAILABLE_JSON_FOR_UNKNOWN_TOOL);
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

        $url = self::API_ENDPOINT . "?" . $params;
        $res = Request::get(self::API_ENDPOINT . "?" . $params)->send();

        // Note the awful use of 'reset' here, because of MW api's strange
        // tendency to give back the page as the first item
        $source = trim(reset($res->body->query->pages)->revisions[0]->{'*'});

        preg_match_all(self::TOOL_REGEX, $source, $matches);
        $tools = $matches[1][0];

        // Parse the <source> tag and get out the actual URLs
        $tools = explode("\n", trim($tools));

        // Trim all lines
        $tools = array_map("trim", $tools);

        // Remove comments from the tools and newlines and other strange crap
        $tools = array_filter($tools, function($tool) {
            return substr($tool, 0, 4) == "http";
        });

        return $tools;
    }

    // Check if all the jsonurls in the database are in the the crawllist, if
    // not, set them as 'deleted' in the db
    private function checkDeletedTools() {
        foreach ($this->api->getAllToolsRaw() as $tool) {
            $tool->deleted = !in_array($tool->jsonurl, $this->crawllist);
            $tool->save();
        }
    }
}