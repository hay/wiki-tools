<?php
require 'class-util.php';

use \Httpful\Request as Request;

class LangViews {
    const URL_REGEX = "/https?:\/\/(.*).wikipedia.org\/wiki\/(.*)/";
    const WP_ENDPOINT = "https://%s.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=%s&format=json&lllimit=50";
    const STAT_ENDPOINT = "http://stats.grok.se/json/%s/latest30/%s";

    private $url, $langcode, $article;

    function __construct($url) {
        $this->url = $url;
    }

    private function parseUrl($url) {
        preg_match_all(self::URL_REGEX, $url, $matches);

        if (Util::arrayEmpty($matches)) {
            return false;
        }

        return array(
            "langcode" => $matches[1][0],
            "article" => $matches[2][0]
        );
    }

    private function getStats($lang, $article) {
        $url = sprintf(self::STAT_ENDPOINT, $lang, Util::wikiUrlEncode($article));
        $req = Request::get($url)->send();

        if (!isset($req->body)) {
            return false;
        }

        $json = json_decode($req->raw_body, true);
        return $json['daily_views'];
    }

    private function getLanguages() {
        $url = sprintf(self::WP_ENDPOINT, $this->langcode, Util::wikiUrlEncode($this->article));
        $req = Request::get($url)->send();

        if (!isset($req->body->query->pages)) {
            return false;
        }

        $stats = reset($req->body->query->pages);

        $languages = array_map(function($lang) {
            return array(
                "langcode" => $lang->lang,
                "article" => $lang->{'*'},
                "language" => Util::langcode($lang->lang)
            );
        }, $stats->langlinks);

        array_unshift($languages, array(
            "langcode" => $this->langcode,
            "article" => $this->article,
            "language" => Util::langcode($this->langcode)
        ));

        return $languages;
    }

    public function getResults() {
        $parsedUrl = $this->parseUrl($this->url);
        if (!$parsedUrl) return false;

        $this->langcode = $parsedUrl['langcode'];
        $this->article = $parsedUrl['article'];

        $languages = $this->getLanguages();
        if (!$languages) return false;

        $data = array();

        foreach($languages as $lang) {
            $views = $this->getStats($lang['langcode'], $lang['article']);

            if (!$views) {
                $lang['dailyviews'] = false;
                $lang['totalviews'] = false;
                continue;
            }

            $lang['dailyviews'] = $views;
            $lang['totalviews'] = 0;

            foreach($views as $date => $view) {
                $lang['totalviews'] = $lang['totalviews'] + $view;
            }

            $data[] = $lang;
        }

        return array(
            "views" => $data,
            "totalviews" => array_reduce($data, function($a, $b) {
                $a = $a + $b['totalviews'];
                return $a;
            })
        );
    }
}