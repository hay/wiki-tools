<?php
use \Httpful\Request as Request;

class ExternalLinkSearch {
    const QUERY = "?action=query&list=exturlusage&euquery=%s&format=json&eulimit=500";
    private $sites = array();

    function __construct($sites) {
        $sites = explode(",",$sites);

        foreach ($sites as $site) {
            # Make sure .org is cut off from the site to make old urls work
            $this->sites[] = trim(str_replace(".org", "", $site));
        }
    }

    private function getLinks($q, $site) {
        $endpoint = sprintf("https://%s.org/w/api.php", $site);
        $results = array();
        $continue = false;

        do {
            $url = $endpoint . sprintf(self::QUERY, urlencode($q));

            if ($continue) {
                $url = $url . "&euoffset=$continue";
            }

            error_log("Getting $url");

            $res = Request::get($url)->send();

            if (isset($res->body->{'query-continue'})) {
                $continue = $res->body->{'query-continue'}->exturlusage->euoffset;
            }

            $results = array_merge($results, $res->body->query->exturlusage);
        } while (isset($res->body->{'query-continue'}));

        return $results;
    }

    private function formatLinks($q, $site) {
        $links = $this->getLinks($q, $site);
        $results = array();

        foreach ($links as $item) {
            $pageid = $item->pageid;
            $page = $item->title;
            $pagelink = sprintf("https://%s.org/wiki/%s", $site, $item->title);
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
            "linkcount" => count($links),
            "pagecount" => count($results),
            "links" => $results
        );
    }

    public function query($q) {
        $results = array(
            "linkcount" => 0,
            "pagecount" => 0,
            "sites" => array()
        );

        foreach ($this->sites as $site) {
            $links = $this->formatLinks($q, $site);
            $results["sites"][$site] = $links;
            $results['linkcount'] += $links['linkcount'];
            $results['pagecount'] += $links['pagecount'];
        }

        $results['sitecount'] = count($results['sites']);

        return $results;
    }
}