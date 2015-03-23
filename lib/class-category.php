<?php
require 'class-util.php';

class Category {
    const QUERY = "?action=query&generator=categorymembers&gcmtitle=Category:%s&gcmlimit=500&gcmsort=timestamp&gcmdir=older&format=json&prop=info";
    private $site;

    function __construct($site) {
        $this->site = $site;
    }

    public function getRecentPages($cat) {
        $call = sprintf(self::QUERY, urlencode($cat));
        $query = Util::doQueryWithContinue($call, $this->site);
        $pages = [];

        foreach ($query as $id => $page) {
            $page->url = "http://$this->site.org/wiki/" . $page->title;
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