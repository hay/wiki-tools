<?php
use \Httpful\Request as Request;

class Category {
    const QUERY = "?action=query&generator=categorymembers&gcmtitle=Category:%s&gcmlimit=500&gcmsort=timestamp&gcmdir=older&format=json&prop=info";
    private $site;

    function __construct($site) {
        $this->site = $site;
    }

    public function getRecentPages($cat) {
        $endpoint = sprintf("http://%s.org/w/api.php", $this->site);
        $url = $endpoint . sprintf(self::QUERY, urlencode($cat));

        error_log("Getting $url");

        $res = Request::get($url)->send();
        $query = $res->body->query->pages;
        $site = $this->site;
        $pages = array();

        foreach ($query as $id => $page) {
            $page->url = "http://$site.org/wiki/" . $page->title;
            $date = strtotime($page->touched);
            $page->date = strftime("%a %e %b %Y, at %H:%M", $date);
            $pages[] = $page;
        }

        // Lololl, let's reverse that shit because we don't actually get the
        // newest stuff first in the array
        $pages = array_reverse($pages);

        return $pages;
    }
}