<?php
use \Httpful\Request as Request;

class LangStat {
    const URL_REGEX = "/\/\/(.*)\.wikipedia.org\/wiki\/(.*)/";

    private $lang, $article, $hasdata = false;

    function __construct($url) {
        preg_match_all(self::URL_REGEX, $url, $matches);

        if (!empty($matches[1]) && !empty($matches[2])) {
            $this->lang = $matches[1][0];
            $this->article = $matches[2][0];
        }
    }

    public function getStats() {
        if ($this->hasdata) {
            echo "no data";
        } else {
            echo $this->lang . $this->article;
        }
    }
}