<?php
use \Httpful\Request as Request;

class ExternalLinkSearch {
    const QUERY = "?action=query&list=exturlusage&euquery=%s&format=json&eulimit=500";
    private $endpoint, $site;

    function __construct($site) {
        $this->site = $site;
        $this->endpoint = "http://$site/w/api.php";
    }

    public function getLinks($q) {
        $results = array();
        $continue = false;

        do {
            $url = $this->endpoint . sprintf(self::QUERY, urlencode($q));

            if ($continue) {
                $url = $url . "&euoffset=$continue";
            }

            // error_log("Getting $url");

            $res = Request::get($url)->send();

            if (isset($res->body->{'query-continue'})) {
                $continue = $res->body->{'query-continue'}->exturlusage->euoffset;
            }

            $results = array_merge($results, $res->body->query->exturlusage);
        } while (isset($res->body->{'query-continue'}));

        return $results;
    }

    public function query($q) {
        $links = $this->getLinks($q);
        $results = array();

        foreach ($links as $item) {
            $pageid = $item->pageid;
            $page = $item->title;
            $pagelink = sprintf("http://%s/wiki/%s", $this->site, $item->title);
            $externallink = $item->url;

            if (empty($results[$pageid])) {
                $results[$pageid] = array(
                    "count" => 1,
                    "page" => $page,
                    "pagelink" => $pagelink,
                    "links" => array( $externallink )
                );
            } else {
                $results[$pageid]["count"]++;
                $results[$pageid]["links"][] = $externallink;
            }
        }

        uasort($results, function($a, $b) {
            return $a['count'] > $b['count'] ? -1 : 1;
        });

        return array(
            "count" => count($links),
            "links" => $results
        );
    }
}